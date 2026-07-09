'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/app/app/dashboards/referee/referee.module.css';
import { TennisScoreState, createInitialScoreState } from '@/lib/engine/scoring';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'REQUIRES_INTERVENTION' | 'PENDING';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function RefereeArena() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const tournamentId = params.tournamentId as string;

  // Poll for the match every 5 seconds to get real data while online
  const { data, mutate } = useSWR(`/api/tournaments/${tournamentId}/matches/${matchId}`, fetcher, {
    refreshInterval: 5000,
  });

  const matchData = data?.match;

  const [matchStatus, setMatchStatus] = useState<MatchStatus>('SCHEDULED');
  const [scoreState, setScoreState] = useState<TennisScoreState>(createInitialScoreState());
  const [server, setServer] = useState<'A' | 'B'>('A');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'PAUSE'|'FORFEIT'|'INCIDENT'>('PAUSE');
  
  // Incident/Forfeit Form State
  const [interventionReason, setInterventionReason] = useState('MEDICAL_TIMEOUT');
  const [forfeitReason, setForfeitReason] = useState('WALKOVER');
  const [incidentType, setIncidentType] = useState('CODE_VIOLATION');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [targetTeamId, setTargetTeamId] = useState('');

  const { isOnline, queueLength, enqueue, syncQueue, isSyncing, lastSyncResult } = useOfflineQueue();

  // Sync state with server data
  useEffect(() => {
    if (matchData) {
      setMatchStatus(matchData.status as MatchStatus);
      try {
        const parsed = typeof matchData.scoreState === 'string' ? JSON.parse(matchData.scoreState) : matchData.scoreState;
        if (parsed?.pointsA !== undefined) {
          setScoreState(parsed);
        }
      } catch (e) {}
    }
  }, [matchData]);

  // Show toast on sync completion
  useEffect(() => {
    if (lastSyncResult) {
      const showTimer = setTimeout(() => setShowSyncToast(true), 0);
      const hideTimer = setTimeout(() => setShowSyncToast(false), 3000);
      return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
    }
  }, [lastSyncResult]);

  // ---------- Score a point (online or offline) ----------
  const handleScore = useCallback(async (team: 'A' | 'B') => {
    if (matchStatus !== 'IN_PROGRESS' || isUpdating) return;

    if (!isOnline) {
      // Offline path: enqueue locally
      enqueue(matchId, team);
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/match/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, scoringTeam: team }),
      });

      const data = await res.json();

      if (res.ok && data.match) {
        try {
          const parsed = typeof data.match.scoreState === 'string'
            ? JSON.parse(data.match.scoreState) : data.match.scoreState;
          if (parsed?.pointsA !== undefined) {
            setScoreState(parsed);
            mutate(); // Optimistic refresh
          }
        } catch (e) {}

        if (data.matchCompleted) {
          setMatchStatus('COMPLETED');
        }
      }
    } catch (err) {
      // Network error — fallback to offline queue
      enqueue(matchId, team);
    } finally {
      setIsUpdating(false);
    }
  }, [matchStatus, isUpdating, isOnline, enqueue, matchId, mutate]);

  // ---------- Undo Logic ----------
  const handleUndo = async () => {
    if (isUpdating || !isOnline) return;
    setIsUpdating(true);
    
    try {
      const res = await fetch('/api/match/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      });
      const data = await res.json();
      
      if (res.ok && data.match) {
        try {
          const parsed = typeof data.match.scoreState === 'string'
            ? JSON.parse(data.match.scoreState) : data.match.scoreState;
          if (parsed?.pointsA !== undefined) {
            setScoreState(parsed);
            mutate();
          }
        } catch (e) {}
        
        if (data.match.status === 'IN_PROGRESS') {
          setMatchStatus('IN_PROGRESS');
        }
      }
    } catch (err) {
      console.error('Failed to undo:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // ---------- State Machine Transitions ----------
  const advanceMatchStatus = async () => {
    if (!isOnline) return; // Cannot start match offline
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/matches/${matchId}/score`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' })
      });
      if (res.ok) {
        setMatchStatus('IN_PROGRESS');
        mutate();
      }
    } catch (e) {}
    setIsUpdating(false);
  };

  const handleIntervention = async (action: 'PAUSE' | 'RESUME', reason?: string) => {
    if (!isOnline) { alert("Must be online to trigger intervention"); return; }
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/matches/${matchId}/intervention`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      });
      if (res.ok) {
        setMatchStatus(action === 'PAUSE' ? 'REQUIRES_INTERVENTION' : 'IN_PROGRESS');
        mutate();
        setShowControlPanel(false);
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to trigger intervention');
      }
    } catch (e) {}
    setIsUpdating(false);
  };

  const handleForfeit = async (forfeitingTeamId: string) => {
    if (!isOnline) { alert("Must be online to forfeit"); return; }
    if (!confirm('Are you absolutely sure you want to forfeit this team? This ends the match immediately.')) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/matches/${matchId}/forfeit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forfeitingTeamId, reason: forfeitReason })
      });
      if (res.ok) {
        setMatchStatus('COMPLETED');
        mutate();
        setShowControlPanel(false);
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to forfeit');
      }
    } catch (e) {}
    setIsUpdating(false);
  };

  const handleIncident = async () => {
    if (!isOnline) { alert("Must be online to report incident"); return; }
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/matches/${matchId}/incident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentType, description: incidentDescription, targetTeamId })
      });
      if (res.ok) {
        alert('Incident Logged.');
        setIncidentDescription('');
        setShowControlPanel(false);
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to log incident');
      }
    } catch (e) {}
    setIsUpdating(false);
  };

  if (!matchData) return <div style={{ padding: '24px', color: '#8b949e', background: '#0d1117', minHeight: '100vh' }}>Loading Arena...</div>;

  // ---------- Network Status Pill ----------
  const renderNetworkPill = () => {
    if (isSyncing) return (
      <div className={`${styles.networkPill} ${styles.networkPillSyncing}`}>
        <span className={styles.pip} />SYNCING...
      </div>
    );
    if (!isOnline) return (
      <div className={`${styles.networkPill} ${styles.networkPillOffline}`}>
        <span className={styles.pip} />OFFLINE
        {queueLength > 0 && <span className={styles.queueBadge}>{queueLength}</span>}
      </div>
    );
    return (
      <div className={`${styles.networkPill} ${styles.networkPillOnline}`}>
        <span className={`${styles.pip} ${styles.pipPulse}`} />LIVE
      </div>
    );
  };

  const statusBadgeClass = {
    SCHEDULED: styles.badgeScheduled,
    IN_PROGRESS: styles.badgeInProgress,
    COMPLETED: styles.badgeCompleted,
    PENDING: styles.badgeScheduled,
    REQUIRES_INTERVENTION: styles.badgeScheduled,
  }[matchStatus] || styles.badgeScheduled;

  const livePointA = scoreState.isTiebreaker ? scoreState.tiebreakerPointsA : scoreState.pointsA;
  const livePointB = scoreState.isTiebreaker ? scoreState.tiebreakerPointsB : scoreState.pointsB;

  const teamAName = matchData.teamA?.franchiseName || matchData.placeholderA || 'Team A';
  const teamBName = matchData.teamB?.franchiseName || matchData.placeholderB || 'Team B';

  return (
    <div className={styles.container}>

      {/* Status Bar */}
      <div className={styles.statusBar}>
        <span className={styles.courtLabel} onClick={() => router.push('/referee')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>←</span> ⬤ {matchData.court?.name || 'Unassigned Court'}
        </span>
        {renderNetworkPill()}
      </div>

      {/* Match Header */}
      <div className={styles.matchHeader}>
        <h1 className={styles.matchTitle}>{matchData.stage} Match</h1>
        <div className={styles.matchMeta}>
          <span className={`${styles.stateBadge} ${statusBadgeClass}`}>{matchStatus.replace('_', ' ')}</span>
          {' '}• Best of 3 Sets{scoreState.isTiebreaker ? ' • 🔥 TIEBREAKER' : ''}
        </div>
      </div>

      {/* ---- State: SCHEDULED ---- */}
      {matchStatus === 'SCHEDULED' && (
        <div className={styles.stateFlow}>
          <p className={styles.stateDescription}>Players warming up on court.</p>
          <button className={styles.transitionButton} onClick={advanceMatchStatus} disabled={!isOnline || isUpdating}>
            {isUpdating ? 'Starting...' : 'Start Match →'}
          </button>
        </div>
      )}

      {/* ---- State: IN_PROGRESS — The Core Scoring Arena ---- */}
      {matchStatus === 'IN_PROGRESS' && (
        <div className={styles.scoringArena}>

          {/* Live score strip */}
          <div className={styles.scoreStrip}>
            <div className={styles.teamScoreBlock}>
              <div className={styles.teamLabel}>{teamAName}</div>
              <AnimatePresence mode="wait">
                <motion.div key={`a-${livePointA}`}
                  initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 16, opacity: 0 }} transition={{ duration: 0.18 }}
                  className={styles.scoreDisplay}>
                  {livePointA}
                </motion.div>
              </AnimatePresence>
              <div className={styles.scoreMeta}>{scoreState.setsA} Sets • {scoreState.gamesA} Games</div>
              {server === 'A' && <div className={styles.serverLabel}>● Serving</div>}
            </div>

            <div className={styles.scoreDivider} />

            <div className={styles.teamScoreBlock}>
              <div className={styles.teamLabel}>{teamBName}</div>
              <AnimatePresence mode="wait">
                <motion.div key={`b-${livePointB}`}
                  initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 16, opacity: 0 }} transition={{ duration: 0.18 }}
                  className={styles.scoreDisplay}>
                  {livePointB}
                </motion.div>
              </AnimatePresence>
              <div className={styles.scoreMeta}>{scoreState.setsB} Sets • {scoreState.gamesB} Games</div>
              {server === 'B' && <div className={styles.serverLabel}>● Serving</div>}
            </div>
          </div>

          {/* GIANT tap buttons — the primary scoring surface */}
          <div className={styles.tapGrid}>
            <motion.button
              className={`${styles.tapButton} ${styles.tapButtonA} ${isUpdating ? styles.tapButtonDisabled : ''}`}
              onClick={() => handleScore('A')}
              whileTap={{ scale: 0.96 }}
            >
              <span className={styles.tapIcon}>🎾</span>
              <span className={styles.tapTeamName}>{teamAName}</span>
              <span className={styles.tapHint}>Tap to score</span>
              {!isOnline && <span className={styles.tapHint}>⚡ Offline mode</span>}
            </motion.button>

            <motion.button
              className={`${styles.tapButton} ${styles.tapButtonB} ${isUpdating ? styles.tapButtonDisabled : ''}`}
              onClick={() => handleScore('B')}
              whileTap={{ scale: 0.96 }}
            >
              <span className={styles.tapIcon}>🎾</span>
              <span className={styles.tapTeamName}>{teamBName}</span>
              <span className={styles.tapHint}>Tap to score</span>
              {!isOnline && <span className={styles.tapHint}>⚡ Offline mode</span>}
            </motion.button>
          </div>

          {/* Action footer */}
          <div className={styles.footer}>
            <button className={`${styles.footerBtn} ${styles.footerBtnServer}`}
              onClick={() => setServer(s => s === 'A' ? 'B' : 'A')}>
              <span className={styles.footerIcon}>↔</span>
              Switch Server
            </button>
            <button className={`${styles.footerBtn} ${styles.footerBtnUndo}`} onClick={handleUndo}>
              <span className={styles.footerIcon}>↶</span>
              Undo Point
            </button>
            <button className={styles.footerBtn} style={{ background: 'rgba(255,255,255,0.1)' }} onClick={() => setShowControlPanel(true)}>
              <span className={styles.footerIcon}>⚙️</span>
              Options
            </button>
          </div>
        </div>
      )}

      {/* ---- State: REQUIRES_INTERVENTION ---- */}
      {matchStatus === 'REQUIRES_INTERVENTION' && (
        <div className={styles.stateFlow}>
          <div className={styles.celebrationGraphic}>⏸️</div>
          <h2 style={{ color: '#f85149' }}>Match Paused</h2>
          <p className={styles.stateDescription}>
            Reason: <strong>{matchData.pauseReason || 'Medical Timeout / Dispute'}</strong>
          </p>
          <button className={styles.transitionButton} onClick={() => handleIntervention('RESUME')} disabled={!isOnline || isUpdating}>
            {isUpdating ? 'Resuming...' : 'Resume Match ➔'}
          </button>
          <button className={styles.footerBtn} style={{ background: 'rgba(255,255,255,0.1)', marginTop: '24px' }} onClick={() => setShowControlPanel(true)}>
            Match Options
          </button>
        </div>
      )}

      {/* ---- State: COMPLETED ---- */}
      {matchStatus === 'COMPLETED' && (
        <div className={styles.stateFlow}>
          <div className={styles.celebrationGraphic}>🏆</div>
          <h2 style={{ color: '#fff' }}>Match Complete</h2>
          <p className={styles.stateDescription}>
            Score: {scoreState.setsA} - {scoreState.setsB}
          </p>
          <button className={styles.transitionButton} onClick={() => router.push('/referee')}>
            Return to Hub
          </button>
        </div>
      )}

      {/* Sync Toast Overlay */}
      <AnimatePresence>
        {showSyncToast && lastSyncResult && (
          <motion.div className={styles.syncToast}
            initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
            <span style={{ fontSize: '1.2rem' }}>
              {lastSyncResult.includes('✓') ? '✅' : '⚠️'}
            </span>
            {lastSyncResult}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Control Panel Modal */}
      <AnimatePresence>
        {showControlPanel && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100 }}
              onClick={() => setShowControlPanel(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#161b22', borderTop: '1px solid rgba(255,255,255,0.1)', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', padding: '24px', zIndex: 101, display: 'flex', flexDirection: 'column', gap: '24px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>Referee Command</h2>
                <button onClick={() => setShowControlPanel(false)} style={{ background: 'transparent', border: 'none', color: '#8b949e', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>

              {/* Roster Abstraction Display */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#0d1117', padding: '16px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#8b949e', textTransform: 'uppercase', marginBottom: '8px' }}>Team A Roster</div>
                  <strong style={{ color: '#fff' }}>{teamAName}</strong>
                  {matchData.teamA?.players?.map((p: any) => <div key={p.id} style={{ fontSize: '0.9rem', color: '#c9d1d9' }}>• {p.name}</div>)}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#8b949e', textTransform: 'uppercase', marginBottom: '8px' }}>Team B Roster</div>
                  <strong style={{ color: '#fff' }}>{teamBName}</strong>
                  {matchData.teamB?.players?.map((p: any) => <div key={p.id} style={{ fontSize: '0.9rem', color: '#c9d1d9' }}>• {p.name}</div>)}
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                {['PAUSE', 'FORFEIT', 'INCIDENT'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab as any)} style={{
                    background: 'transparent', border: 'none', color: activeTab === tab ? '#58a6ff' : '#8b949e',
                    fontWeight: activeTab === tab ? 700 : 400, cursor: 'pointer', fontSize: '1rem', padding: '4px 8px'
                  }}>
                    {tab === 'PAUSE' ? 'Intervention' : tab === 'FORFEIT' ? 'Forfeit' : 'Log Incident'}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'PAUSE' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ color: '#8b949e', margin: 0 }}>Pause the match clock and scoring for a medical timeout or weather delay.</p>
                  <select value={interventionReason} onChange={e => setInterventionReason(e.target.value)} style={{ padding: '12px', background: '#0d1117', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px' }}>
                    <option value="MEDICAL_TIMEOUT">Medical Timeout</option>
                    <option value="WEATHER_DELAY">Weather Delay</option>
                    <option value="EQUIPMENT_ISSUE">Equipment Issue</option>
                    <option value="DISPUTE">Score Dispute</option>
                  </select>
                  <Button variant="danger" onClick={() => handleIntervention('PAUSE', interventionReason)} disabled={isUpdating}>
                    Pause Match
                  </Button>
                </div>
              )}

              {activeTab === 'FORFEIT' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ color: '#f85149', margin: 0, fontWeight: 600 }}>WARNING: This ends the match immediately.</p>
                  <select value={forfeitReason} onChange={e => setForfeitReason(e.target.value)} style={{ padding: '12px', background: '#0d1117', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px' }}>
                    <option value="WALKOVER">No Show (Walkover)</option>
                    <option value="RETIREMENT">Retirement (Injury)</option>
                    <option value="DISQUALIFICATION">Disqualification</option>
                  </select>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <Button style={{ flex: 1, background: '#f85149', color: '#fff' }} onClick={() => handleForfeit(matchData.teamAId)} disabled={isUpdating}>
                      Forfeit {teamAName}
                    </Button>
                    <Button style={{ flex: 1, background: '#f85149', color: '#fff' }} onClick={() => handleForfeit(matchData.teamBId)} disabled={isUpdating}>
                      Forfeit {teamBName}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'INCIDENT' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ color: '#8b949e', margin: 0 }}>Log a code violation or official warning. Will be recorded in the audit log.</p>
                  <select value={incidentType} onChange={e => setIncidentType(e.target.value)} style={{ padding: '12px', background: '#0d1117', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px' }}>
                    <option value="CODE_VIOLATION">Code Violation (Conduct)</option>
                    <option value="TIME_VIOLATION">Time Violation</option>
                    <option value="MEDICAL_INCIDENT">Medical Incident</option>
                  </select>
                  <select value={targetTeamId} onChange={e => setTargetTeamId(e.target.value)} style={{ padding: '12px', background: '#0d1117', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px' }}>
                    <option value="">-- Select Target Team --</option>
                    <option value={matchData.teamAId}>{teamAName}</option>
                    <option value={matchData.teamBId}>{teamBName}</option>
                  </select>
                  <textarea 
                    placeholder="Describe the incident..."
                    value={incidentDescription}
                    onChange={e => setIncidentDescription(e.target.value)}
                    style={{ padding: '12px', background: '#0d1117', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', minHeight: '100px' }}
                  />
                  <Button variant="primary" onClick={handleIncident} disabled={isUpdating || !incidentDescription}>
                    Submit Report
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

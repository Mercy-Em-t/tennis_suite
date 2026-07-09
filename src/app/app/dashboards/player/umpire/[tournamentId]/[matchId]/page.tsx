'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './umpire.module.css';
import { TennisScoreState, createInitialScoreState } from '@/lib/engine/scoring';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';

type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'REQUIRES_INTERVENTION' | 'PENDING';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PlayerUmpireArena() {
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
        <span className={styles.courtLabel} onClick={() => router.push('/team')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>←</span> ⬤ EXIT UMPIRE TERMINAL
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
          <div className={styles.footer} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '16px' }}>
            <button className={`${styles.footerBtn} ${styles.footerBtnUndo}`} onClick={handleUndo} style={{ background: 'transparent', color: '#8b949e', border: '1px solid rgba(255,255,255,0.2)', padding: '12px', borderRadius: '8px', fontWeight: 600 }}>
              <span className={styles.footerIcon}>↶</span> Undo
            </button>
            <button className={`${styles.footerBtn} ${styles.footerBtnServer}`} onClick={() => setServer(s => s === 'A' ? 'B' : 'A')} style={{ background: 'transparent', color: '#e3b341', border: '1px solid rgba(227,179,65,0.3)', padding: '12px', borderRadius: '8px', fontWeight: 600 }}>
              <span className={styles.footerIcon}>↔</span> Server
            </button>
            <button className={`${styles.footerBtn} ${styles.footerBtnAlert}`} 
              style={{ background: 'transparent', color: '#f85149', border: '1px solid rgba(248,81,73,0.3)', padding: '12px', borderRadius: '8px', fontWeight: 600 }}
              onClick={async () => {
                if (confirm('Are you sure you want to call the Referee? This will pause the match.')) {
                  setIsUpdating(true);
                  try {
                    const res = await fetch(`/api/tournaments/${tournamentId}/matches/${matchId}/call-referee`, { method: 'POST' });
                    if (res.ok) mutate();
                  } finally {
                    setIsUpdating(false);
                  }
                }
              }}
            >
              ⚠️ Call Ref
            </button>
          </div>
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

    </div>
  );
}

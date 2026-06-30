'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './referee.module.css';
import { TennisScoreState, createInitialScoreState } from '@/lib/engine/scoring';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

type MatchStatus = 'SCHEDULED' | 'WARMUP' | 'IN_PROGRESS' | 'COMPLETED';

// ---------- Mock JWT for MVP (Production: set from auth session) ----------
// Role: REFEREE — authorized by Gate 2 RBAC middleware
const MOCK_JWT = `header.${btoa(JSON.stringify({ role: 'REFEREE', sub: 'ref_001' }))}.signature`;
const MOCK_MATCH_ID = 'cmqz2ayqu0006n4eih63ajspb'; // Seeded by Golden Loop seed.ts

export default function RefereePWA() {
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('SCHEDULED');
  const [scoreState, setScoreState] = useState<TennisScoreState>(createInitialScoreState());
  const [server, setServer] = useState<'A' | 'B'>('A');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSyncToast, setShowSyncToast] = useState(false);

  const { isOnline, queueLength, enqueue, syncQueue, isSyncing, lastSyncResult } = useOfflineQueue(MOCK_JWT);

  // Show toast on sync completion
  useEffect(() => {
    if (lastSyncResult) {
      setShowSyncToast(true);
      const t = setTimeout(() => setShowSyncToast(false), 3000);
      return () => clearTimeout(t);
    }
  }, [lastSyncResult]);

  // ---------- Score a point (online or offline) ----------
  const handleScore = useCallback(async (team: 'A' | 'B') => {
    if (matchStatus !== 'IN_PROGRESS' || isUpdating) return;

    if (!isOnline) {
      // Offline path: enqueue locally
      enqueue(MOCK_MATCH_ID, team);
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch('/api/match/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_JWT}`, // Gate 2: JWT injected on every mutation
        },
        body: JSON.stringify({ matchId: MOCK_MATCH_ID, scoringTeam: team }),
      });

      const data = await res.json();

      if (res.ok && data.match) {
        try {
          const parsed = typeof data.match.scoreState === 'string'
            ? JSON.parse(data.match.scoreState) : data.match.scoreState;
          if (parsed?.pointsA !== undefined) setScoreState(parsed);
        } catch (e) {}

        if (data.matchCompleted) {
          setMatchStatus('COMPLETED');
        }
      }
    } catch (err) {
      // Network error — fallback to offline queue
      enqueue(MOCK_MATCH_ID, team);
    } finally {
      setIsUpdating(false);
    }
  }, [matchStatus, isUpdating, isOnline, enqueue]);

  // ---------- State Machine Transitions ----------
  const advanceMatchStatus = () => {
    setMatchStatus(prev => {
      if (prev === 'SCHEDULED') return 'WARMUP';
      if (prev === 'WARMUP') return 'IN_PROGRESS';
      return prev;
    });
  };

  // ---------- Network Status Pill ----------
  const NetworkPill = () => {
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
    WARMUP: styles.badgeWarmup,
    IN_PROGRESS: styles.badgeInProgress,
    COMPLETED: styles.badgeCompleted,
  }[matchStatus];

  const livePointA = scoreState.isTiebreaker ? scoreState.tiebreakerPointsA : scoreState.pointsA;
  const livePointB = scoreState.isTiebreaker ? scoreState.tiebreakerPointsB : scoreState.pointsB;

  return (
    <div className={styles.container}>

      {/* Status Bar */}
      <div className={styles.statusBar}>
        <span className={styles.courtLabel}>⬤ Court 1 — Referee</span>
        <NetworkPill />
      </div>

      {/* Match Header */}
      <div className={styles.matchHeader}>
        <h1 className={styles.matchTitle}>Men's Doubles Final</h1>
        <div className={styles.matchMeta}>
          <span className={`${styles.stateBadge} ${statusBadgeClass}`}>{matchStatus.replace('_', ' ')}</span>
          {' '}• Best of 3 Sets{scoreState.isTiebreaker ? ' • 🔥 TIEBREAKER' : ''}
        </div>
      </div>

      {/* ---- State: SCHEDULED ---- */}
      {matchStatus === 'SCHEDULED' && (
        <div className={styles.stateFlow}>
          <p className={styles.stateDescription}>Match has not started yet.</p>
          <button className={styles.transitionButton} onClick={advanceMatchStatus}>
            Begin Warmup →
          </button>
        </div>
      )}

      {/* ---- State: WARMUP ---- */}
      {matchStatus === 'WARMUP' && (
        <div className={styles.stateFlow}>
          <p className={styles.stateDescription}>Players warming up on court.</p>
          <button className={styles.transitionButton} onClick={advanceMatchStatus}>
            Start Match →
          </button>
        </div>
      )}

      {/* ---- State: IN_PROGRESS — The Core Scoring Arena ---- */}
      {matchStatus === 'IN_PROGRESS' && (
        <div className={styles.scoringArena}>

          {/* Live score strip */}
          <div className={styles.scoreStrip}>
            <div className={styles.teamScoreBlock}>
              <div className={styles.teamLabel}>Team A</div>
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
              <div className={styles.teamLabel}>Team B</div>
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
              <span className={styles.tapTeamName}>TEAM A</span>
              <span className={styles.tapHint}>Tap to score</span>
              {!isOnline && <span className={styles.tapHint}>⚡ Offline mode</span>}
            </motion.button>

            <motion.button
              className={`${styles.tapButton} ${styles.tapButtonB} ${isUpdating ? styles.tapButtonDisabled : ''}`}
              onClick={() => handleScore('B')}
              whileTap={{ scale: 0.96 }}
            >
              <span className={styles.tapIcon}>🎾</span>
              <span className={styles.tapTeamName}>TEAM B</span>
              <span className={styles.tapHint}>Tap to score</span>
              {!isOnline && <span className={styles.tapHint}>⚡ Offline mode</span>}
            </motion.button>
          </div>

          {/* Action footer */}
          <div className={styles.footer}>
            <button className={`${styles.footerBtn} ${styles.footerBtnServer}`}
              onClick={() => setServer(s => s === 'A' ? 'B' : 'A')}>
              <span className={styles.footerIcon}>↔</span>
              Server
            </button>
            <button className={`${styles.footerBtn} ${styles.footerBtnDanger}`}>
              <span className={styles.footerIcon}>⏱</span>
              Timeout
            </button>
            <button className={`${styles.footerBtn} ${styles.footerBtnDanger}`}>
              <span className={styles.footerIcon}>⚠</span>
              Dispute
            </button>
          </div>
        </div>
      )}

      {/* ---- State: COMPLETED ---- */}
      {matchStatus === 'COMPLETED' && (
        <div className={styles.completedView}>
          <div className={styles.completedTitle}>Match Over</div>
          <div className={styles.completedScore}>
            Sets: {scoreState.setsA} – {scoreState.setsB}
          </div>
          <p style={{ color: '#484f58', fontSize: '0.85rem' }}>Results have been submitted to the system.</p>
        </div>
      )}

      {/* Sync toast notification */}
      <AnimatePresence>
        {showSyncToast && (
          <motion.div className={styles.syncToast}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
            {lastSyncResult}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

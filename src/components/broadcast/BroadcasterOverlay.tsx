'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveMatch } from '@/hooks/useLiveMatch';
import styles from './broadcaster.module.css';

type ViewMode = 'slate' | 'scorebug';

export default function BroadcasterOverlay() {
  const { data, connected, latencyMs } = useLiveMatch();
  const [viewMode, setViewMode] = useState<ViewMode>('slate');

  const state = data?.scoreState;
  const teamAName = data?.teamA?.name?.toUpperCase() ?? 'TEAM A';
  const teamBName = data?.teamB?.name?.toUpperCase() ?? 'TEAM B';

  // Sponsor rotation (Pillar 16) — auto-advances every 8 seconds
  const sponsors = ['RED BULL', 'ROLEX', 'NIKE', 'WILSON'];
  const [sponsorIdx, setSponsorIdx] = useState(0);
  const [sponsorVisible, setSponsorVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setSponsorVisible(false);
      setTimeout(() => {
        setSponsorIdx(i => (i + 1) % sponsors.length);
        setSponsorVisible(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (viewMode === 'scorebug') {
    return (
      <div className={styles.scorebugWrapper}>
        <motion.div className={styles.scorebug} initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className={styles.scorebugRow}>
            <span className={styles.bugTeam}>{teamAName}</span>
            <div className={styles.bugScores}>
              <span className={styles.bugSets}>{state?.setsA ?? 0}</span>
              <span className={styles.bugGames}>{state?.gamesA ?? 0}</span>
              <AnimatePresence mode="wait">
                <motion.span key={state?.pointsA}
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className={styles.bugPoints}>
                  {state?.isTiebreaker ? state.tiebreakerPointsA : (state?.pointsA ?? '0')}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
          <div className={styles.scorebugDivider} />
          <div className={styles.scorebugRow}>
            <span className={styles.bugTeam}>{teamBName}</span>
            <div className={styles.bugScores}>
              <span className={styles.bugSets}>{state?.setsB ?? 0}</span>
              <span className={styles.bugGames}>{state?.gamesB ?? 0}</span>
              <AnimatePresence mode="wait">
                <motion.span key={state?.pointsB}
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className={styles.bugPoints}>
                  {state?.isTiebreaker ? state.tiebreakerPointsB : (state?.pointsB ?? '0')}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
          <div className={styles.bugMeta}>
            <span className={connected ? styles.livePip : styles.offlinePip} />
            {connected ? 'LIVE' : 'RECONNECTING...'} • {latencyMs}ms
          </div>
        </motion.div>
        <button className={styles.modeToggle} onClick={() => setViewMode('slate')}>⛶ Full Slate</button>
      </div>
    );
  }

  // FULL-SCREEN SLATE (Default)
  return (
    <div className={styles.slate}>

      {/* Ambient court glow */}
      <div className={styles.ambientGlow} />

      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.matchContext}>
          <span className={styles.tournamentLabel}>PURELY DOUBLES • ELITE SERIES</span>
          <span className={styles.divider}>|</span>
          <span className={styles.formatLabel}>{state?.isTiebreaker ? '🔥 TIEBREAKER' : 'BEST OF 3 SETS'}</span>
        </div>
        <div className={styles.sponsorTag} style={{ opacity: sponsorVisible ? 1 : 0, transition: 'opacity 0.35s ease' }}>
          Presented by <strong>{sponsors[sponsorIdx]}</strong>
        </div>
      </div>

      {/* Main score canvas */}
      <div className={`${styles.scoreCanvas} ${state?.isTiebreaker ? styles.tiebreakerGlow : ''}`}>

        {/* Column headers */}
        <div className={styles.columnHeaders}>
          <div className={styles.teamCol} />
          <div className={styles.scoreColHeader}>SET 1</div>
          <div className={styles.scoreColHeader}>SET 2</div>
          <div className={styles.scoreColHeader}>SET 3</div>
          <div className={styles.pointsColHeader}>POINTS</div>
        </div>

        {/* Team A Row */}
        <motion.div
          className={`${styles.teamRow} ${(state?.setsA ?? 0) > (state?.setsB ?? 0) ? styles.leadingRow : ''}`}
          layout
        >
          <div className={styles.teamInfo}>
            <div className={styles.serverDot} style={{ opacity: 0.8 }} />
            <span className={styles.teamName}>{teamAName}</span>
          </div>
          {/* Set history placeholder — in production, scoreState would track per-set history */}
          <div className={styles.setScore}>—</div>
          <div className={styles.setScore}>—</div>
          <div className={styles.setScore}>—</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`a-${state?.pointsA}-${state?.gamesA}`}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={styles.livePoints}
            >
              {state?.isTiebreaker ? state.tiebreakerPointsA : (state?.pointsA ?? '0')}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Separator */}
        <div className={styles.rowSeparator} />

        {/* Team B Row */}
        <motion.div
          className={`${styles.teamRow} ${(state?.setsB ?? 0) > (state?.setsA ?? 0) ? styles.leadingRow : ''}`}
          layout
        >
          <div className={styles.teamInfo}>
            <div className={styles.serverDot} style={{ opacity: 0.2 }} />
            <span className={styles.teamName}>{teamBName}</span>
          </div>
          <div className={styles.setScore}>—</div>
          <div className={styles.setScore}>—</div>
          <div className={styles.setScore}>—</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`b-${state?.pointsB}-${state?.gamesB}`}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={styles.livePoints}
            >
              {state?.isTiebreaker ? state.tiebreakerPointsB : (state?.pointsB ?? '0')}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Game Score Row */}
        <div className={styles.gameRow}>
          <div className={styles.gameLabel}>GAMES THIS SET</div>
          <motion.div key={state?.gamesA} className={styles.gameCount}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {state?.gamesA ?? 0}
          </motion.div>
          <div className={styles.gameSep}>—</div>
          <motion.div key={state?.gamesB} className={styles.gameCount}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {state?.gamesB ?? 0}
          </motion.div>
        </div>

      </div>

      {/* Bottom telemetry bar */}
      <div className={styles.bottomBar}>
        <div className={styles.statusPill}>
          <span className={connected ? styles.livePip : styles.offlinePip} />
          <span>{connected ? 'LIVE' : 'RECONNECTING'}</span>
        </div>
        <span className={styles.latency}>{latencyMs}ms latency</span>
        <span className={styles.matchStatus}>{data?.status ?? 'AWAITING MATCH'}</span>
        <button className={styles.modeToggle} onClick={() => setViewMode('scorebug')}>⬛ Scorebug</button>
      </div>

    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveMatch } from '@/hooks/useLiveMatch';
import { useBroadcasterState } from '../useBroadcasterState';

// Inlining styles for the TV Output for simplicity, normally would use CSS modules
const styles = {
  slate: {
    width: '100vw', height: '100vh', background: '#000', color: '#fff',
    fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' as const, overflow: 'hidden'
  },
  topBar: {
    position: 'absolute' as const, top: 0, left: 0, right: 0, height: '60px',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', zIndex: 10
  },
  scorebugWrapper: {
    position: 'absolute' as const, bottom: '40px', left: '40px', zIndex: 10
  },
  scorebug: {
    background: 'rgba(13, 17, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' as const, gap: '12px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)', width: '400px'
  },
  teamRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  teamName: {
    fontSize: '1.2rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const
  },
  scores: {
    display: 'flex', gap: '12px', alignItems: 'center', fontSize: '1.2rem', fontWeight: 700
  },
  points: {
    color: '#f85149', width: '32px', textAlign: 'right' as const
  },
  adsSidebar: {
    position: 'absolute' as const, top: '100px', right: '40px', width: '300px',
    display: 'flex', flexDirection: 'column' as const, gap: '24px', zIndex: 10
  },
  adSlot: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', color: '#8b949e'
  }
};

export default function PublicBroadcastScreen() {
  const { graphics, activeMatch, loaded } = useBroadcasterState();
  const { data: sseData, connected, latencyMs } = useLiveMatch();
  
  const [sponsorIdx, setSponsorIdx] = useState(0);
  const [sponsorVisible, setSponsorVisible] = useState(true);

  const sponsors = graphics.sponsorList ? graphics.sponsorList.split(',').map(s => s.trim()) : ['TENNIS SUITE'];

  useEffect(() => {
    if (sponsors.length <= 1) return;
    const interval = setInterval(() => {
      setSponsorVisible(false);
      setTimeout(() => {
        setSponsorIdx(i => (i + 1) % sponsors.length);
        setSponsorVisible(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, [graphics.sponsorList, sponsors.length]);

  if (!loaded) return <div style={styles.slate}></div>;

  // Determine which data source to use based on Sandbox Toggle
  const isSandbox = graphics.isSandbox;
  
  let teamAName = 'TEAM A';
  let teamBName = 'TEAM B';
  let setsA = 0, gamesA = 0, pointsA: string | number = 0;
  let setsB = 0, gamesB = 0, pointsB: string | number = 0;
  let matchStatus = 'PENDING';

  if (isSandbox && activeMatch) {
    teamAName = activeMatch.team1Name;
    teamBName = activeMatch.team2Name;
    setsA = activeMatch.score.team1.sets;
    gamesA = activeMatch.score.team1.games;
    pointsA = activeMatch.score.team1.points;
    setsB = activeMatch.score.team2.sets;
    gamesB = activeMatch.score.team2.games;
    pointsB = activeMatch.score.team2.points;
    matchStatus = activeMatch.status;
  } else if (!isSandbox && sseData) {
    teamAName = sseData.teamA?.name ?? 'TEAM A';
    teamBName = sseData.teamB?.name ?? 'TEAM B';
    setsA = sseData.scoreState?.setsA ?? 0;
    gamesA = sseData.scoreState?.gamesA ?? 0;
    pointsA = sseData.scoreState?.pointsA ?? 0;
    setsB = sseData.scoreState?.setsB ?? 0;
    gamesB = sseData.scoreState?.gamesB ?? 0;
    pointsB = sseData.scoreState?.pointsB ?? 0;
    matchStatus = 'IN_PROGRESS';
  }

  // Force Sponsor Takeover Mode
  if (graphics.showSponsorOverlay) {
    return (
      <div style={{ ...styles.slate, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#000' }}>
        <h1 style={{ fontSize: '5rem', fontWeight: 900, textTransform: 'uppercase' }}>{sponsors[sponsorIdx]}</h1>
      </div>
    );
  }

  return (
    <div style={styles.slate}>
      {/* Background Camera Feed (Simulated via gradient for now) */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, #161b22 0%, #0d1117 100%)' }} />

      <div style={styles.topBar}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, color: '#58a6ff' }}>TENNIS SUITE NETWORK</span>
          <span style={{ color: '#8b949e' }}>|</span>
          <span style={{ fontWeight: 600 }}>{isSandbox ? 'SANDBOX MATCH' : 'LIVE MATCH'}</span>
        </div>
        <div style={{ opacity: sponsorVisible ? 1 : 0, transition: 'opacity 0.4s ease', fontWeight: 600 }}>
          Presented by <span style={{ color: '#3fb950' }}>{sponsors[sponsorIdx]}</span>
        </div>
      </div>

      {graphics.showScoreBug && (
        <div style={styles.scorebugWrapper}>
          <motion.div style={styles.scorebug} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            
            <div style={styles.teamRow}>
              <span style={styles.teamName}>{teamAName}</span>
              <div style={styles.scores}>
                <span style={{ color: '#8b949e' }}>{setsA}</span>
                <span>{gamesA}</span>
                <span style={styles.points}>{pointsA}</span>
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

            <div style={styles.teamRow}>
              <span style={styles.teamName}>{teamBName}</span>
              <div style={styles.scores}>
                <span style={{ color: '#8b949e' }}>{setsB}</span>
                <span>{gamesB}</span>
                <span style={styles.points}>{pointsB}</span>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#8b949e', display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span>{isSandbox ? 'LOCAL SYNC' : (connected ? 'SSE LIVE' : 'RECONNECTING...')}</span>
              <span>{matchStatus}</span>
            </div>

          </motion.div>
        </div>
      )}

      {graphics.showAdsSidebar && (
        <div style={styles.adsSidebar}>
          <div style={styles.adSlot}>
            {graphics.adSlotImageUrl ? (
              <img src={graphics.adSlotImageUrl} alt="Ad Slot 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>Ad Slot 1 (300x250)</span>
            )}
          </div>
          <div style={styles.adSlot}>
            <span>Ad Slot 2 (300x250)</span>
          </div>
        </div>
      )}

    </div>
  );
}

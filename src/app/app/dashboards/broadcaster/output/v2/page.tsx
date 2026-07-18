'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveMatch } from '@/hooks/useLiveMatch';
import { useBroadcasterState } from '../../useBroadcasterState';

// Helper for Real-time Clock
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '2px', color: '#fff' }}>
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </span>
      <span style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', fontWeight: 600 }}>
        {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </span>
    </div>
  );
}

// Helper for Marquee
function MarqueeText({ text }: { text: string }) {
  return (
    <div className="marquee-container" style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', display: 'flex', alignItems: 'center', height: '40px', background: '#e3242b', color: '#fff', fontSize: '1rem', fontWeight: 600, letterSpacing: '1px' }}>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        .marquee-content {
          display: inline-block;
          animation: scroll 20s linear infinite;
        }
      `}</style>
      <div className="marquee-content">{text} &nbsp;&nbsp; • &nbsp;&nbsp; {text}</div>
    </div>
  );
}

export default function V2PublicBroadcastScreen() {
  const { graphics, activeMatch, mockUpcomingMatches, loaded } = useBroadcasterState();
  const { data: sseData, connected } = useLiveMatch();
  
  const [sponsorIdx, setSponsorIdx] = useState(0);
  const [reminderIdx, setReminderIdx] = useState(0);

  const sponsors = graphics.sponsorList ? graphics.sponsorList.split(',').map(s => s.trim()) : ['TENNIS SUITE'];
  const reminders = ['HYDRATION STATION AT MAIN TENT', 'FIRST AID AVAILABLE AT COURT 2', 'MERCHANDISE STAND CLOSES AT 6PM'];

  // Timers for rotating widgets
  useEffect(() => {
    if (sponsors.length > 1) {
      const sponsorTimer = setInterval(() => setSponsorIdx(i => (i + 1) % sponsors.length), 8000);
      return () => clearInterval(sponsorTimer);
    }
  }, [sponsors.length]);

  useEffect(() => {
    const reminderTimer = setInterval(() => setReminderIdx(i => (i + 1) % reminders.length), 10000);
    return () => clearInterval(reminderTimer);
  }, [reminders.length]);

  if (!loaded) return <div style={{ background: '#000', width: '100vw', height: '100vh' }}></div>;

  const isSandbox = graphics.isSandbox;
  let teamAName = 'TEAM A', teamBName = 'TEAM B';
  let setsA = 0, gamesA = 0, pointsA: string | number = 0;
  let setsB = 0, gamesB = 0, pointsB: string | number = 0;
  let matchStatus = 'PENDING';
  let matchStage = 'POOL STAGE';

  if (isSandbox && activeMatch) {
    teamAName = activeMatch.team1Name; teamBName = activeMatch.team2Name;
    setsA = activeMatch.score.team1.sets; gamesA = activeMatch.score.team1.games; pointsA = activeMatch.score.team1.points;
    setsB = activeMatch.score.team2.sets; gamesB = activeMatch.score.team2.games; pointsB = activeMatch.score.team2.points;
    matchStatus = activeMatch.status;
    matchStage = activeMatch.round;
  } else if (!isSandbox && sseData) {
    teamAName = sseData.teamA?.name ?? 'TEAM A'; teamBName = sseData.teamB?.name ?? 'TEAM B';
    setsA = sseData.scoreState?.setsA ?? 0; gamesA = sseData.scoreState?.gamesA ?? 0; pointsA = sseData.scoreState?.pointsA ?? 0;
    setsB = sseData.scoreState?.setsB ?? 0; gamesB = sseData.scoreState?.gamesB ?? 0; pointsB = sseData.scoreState?.pointsB ?? 0;
    matchStatus = 'LIVE';
  }

  // Force Sponsor Takeover Mode
  if (graphics.showSponsorOverlay) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#000' }}>
        <h1 style={{ fontSize: '5rem', fontWeight: 900, textTransform: 'uppercase' }}>{sponsors[sponsorIdx]}</h1>
      </div>
    );
  }

  return (
    <div className="tv-layout" style={{ width: '100vw', height: '100vh', background: '#0d1117', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        /* Responsive Grid System */
        .tv-main { display: grid; grid-template-columns: 1fr 380px; gap: 24px; flex: 1; padding: 24px; overflow: hidden; }
        .sidebar { display: flex; flexDirection: column; gap: 20px; overflow-y: auto; }
        .corner-ad { position: absolute; top: 120px; left: 24px; width: 150px; height: 150px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; z-index: 20; color: #8b949e; text-align: center; padding: 8px; font-size: 0.8rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .stage-badge { position: absolute; top: 24px; left: 24px; background: #e3242b; color: #fff; padding: 6px 16px; border-radius: 20px; font-weight: 800; font-size: 0.85rem; letter-spacing: 1px; z-index: 20; text-transform: uppercase; box-shadow: 0 4px 12px rgba(227,36,43,0.4); }
        
        @media (max-width: 900px) {
          .tv-main { grid-template-columns: 1fr; overflow-y: auto; }
          .corner-ad { display: none; }
        }
      `}</style>

      {/* Header */}
      <header style={{ height: '80px', background: '#161b22', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '40px', height: '40px', background: '#3fb950', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '1.2rem' }}>TS</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '1px' }}>TENNIS SUITE NETWORK</h1>
            <div style={{ color: '#8b949e', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>LIVE FROM NAIROBI CLUB</span>
              <span>•</span>
              <span style={{ color: isSandbox ? '#d29922' : '#3fb950' }}>{isSandbox ? 'SANDBOX MODE' : 'LIVE FEED'}</span>
            </div>
          </div>
        </div>
        <LiveClock />
      </header>

      {/* Main Grid */}
      <div className="tv-main">
        
        {/* Left: Video Feed & Score */}
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#000', border: '1px solid #30363d', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <div className="stage-badge">{matchStage}</div>
          <div className="corner-ad">CORNER AD<br/>(Grid Placement)</div>
          
          {/* Mock Video Stream */}
          <video 
            autoPlay loop muted playsInline 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
            src="https://www.w3schools.com/html/mov_bbb.mp4"
          />

          {/* Scorebug */}
          {graphics.showScoreBug && (
            <div style={{ position: 'absolute', bottom: '32px', left: '32px', background: 'rgba(13, 17, 23, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '16px 24px', width: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>{teamAName}</span>
                <div style={{ display: 'flex', gap: '16px', fontSize: '1.4rem', fontWeight: 700 }}>
                  <span style={{ color: '#8b949e' }}>{setsA}</span><span>{gamesA}</span><span style={{ color: '#f85149', width: '36px', textAlign: 'right' }}>{pointsA}</span>
                </div>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '12px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>{teamBName}</span>
                <div style={{ display: 'flex', gap: '16px', fontSize: '1.4rem', fontWeight: 700 }}>
                  <span style={{ color: '#8b949e' }}>{setsB}</span><span>{gamesB}</span><span style={{ color: '#f85149', width: '36px', textAlign: 'right' }}>{pointsB}</span>
                </div>
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#8b949e', fontWeight: 600, display: 'flex', justifyContent: 'space-between', textTransform: 'uppercase' }}>
                <span>{matchStatus}</span>
                <span>Presented by {sponsors[sponsorIdx]}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Info Panels Sidebar */}
        <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Upcoming Matches Panel */}
          <div style={{ background: '#161b22', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', background: '#58a6ff', borderRadius: '50%', display: 'inline-block' }}></span>
              Upcoming
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mockUpcomingMatches.map((m) => (
                <div key={m.id} style={{ background: '#0d1117', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: '#58a6ff', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>{m.time}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.team1Name}</div>
                  <div style={{ color: '#8b949e', fontSize: '0.8rem', margin: '2px 0' }}>vs</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.team2Name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rotating Reminders & Alternating Ad Slot */}
          <AnimatePresence mode="wait">
            {reminderIdx % 2 === 0 ? (
              <motion.div 
                key="reminder"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                style={{ flex: 1, background: 'linear-gradient(135deg, #238636 0%, #105921 100%)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 800, opacity: 0.8, marginBottom: '8px', letterSpacing: '2px' }}>ORGANIZER MESSAGE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.4 }}>{reminders[reminderIdx]}</div>
              </motion.div>
            ) : (
              <motion.div 
                key="ad"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                style={{ flex: 1, background: '#161b22', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: '#8b949e', overflow: 'hidden' }}
              >
                {graphics.adSlotImageUrl ? (
                  <img src={graphics.adSlotImageUrl} alt="Sponsor Ad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>PROUD SPONSOR</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{sponsors[sponsorIdx]}</div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Marquee Ticker Belt */}
      <MarqueeText text={graphics.tickerText} />
      
    </div>
  );
}

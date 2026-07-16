'use client';

import React, { useState, useEffect } from 'react';
import { useBroadcasterState } from '../useBroadcasterState';

export default function PresentationScreenOutput() {
  const { graphics, activeMatch, mockMatches, loaded } = useBroadcasterState();
  const [autoCycleView, setAutoCycleView] = useState<'MATCH' | 'STANDINGS'>('MATCH');

  // Auto-cycling logic
  useEffect(() => {
    if (graphics.presentationMode === 'AUTO_CYCLE') {
      const interval = setInterval(() => {
        setAutoCycleView(prev => prev === 'MATCH' ? 'STANDINGS' : 'MATCH');
      }, autoCycleView === 'MATCH' ? 10000 : 5000); // 10s Match, 5s Standings for quick testing
      return () => clearInterval(interval);
    }
  }, [graphics.presentationMode, autoCycleView]);

  if (!loaded) return <div style={{ background: '#00ff00', width: '100vw', height: '100vh' }} />;

  // Determine actual view
  let currentView = autoCycleView;
  if (graphics.presentationMode === 'FORCE_MATCH') currentView = 'MATCH';
  if (graphics.presentationMode === 'FORCE_BRACKET') currentView = 'STANDINGS';

  // Determine Background (simulating camera cuts)
  const bgColors = {
    'WIDE_ANGLE': 'linear-gradient(135deg, #1f2937, #111827)',
    'CAM_1': 'linear-gradient(135deg, #374151, #1f2937)',
    'CAM_2': 'linear-gradient(135deg, #111827, #000000)'
  };
  const backgroundStyle = currentView === 'MATCH' 
    ? { background: bgColors[graphics.activeCamera] }
    : { background: '#0d1117' };

  return (
    <div style={{ 
      width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', 
      fontFamily: 'Inter, system-ui, sans-serif', color: '#fff',
      transition: 'background 0.5s ease',
      ...backgroundStyle 
    }}>
      
      {/* --- STANDINGS / BRACKET VIEW --- */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: currentView === 'STANDINGS' ? 1 : 0,
        transform: currentView === 'STANDINGS' ? 'translateY(0)' : 'translateY(50px)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none'
      }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '40px', letterSpacing: '-2px', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>TOURNAMENT STANDINGS</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', width: '80%', maxWidth: '1200px' }}>
          {Object.values(mockMatches).map(m => (
            <div key={m.id} style={{ background: 'rgba(22, 27, 34, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{m.team1Name}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b949e' }}>{m.team2Name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', color: m.status === 'IN_PROGRESS' ? '#3fb950' : '#58a6ff', fontWeight: 900 }}>{m.status}</div>
                <div style={{ fontSize: '1rem', color: '#8b949e' }}>{m.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MATCH VIEW OVERLAYS --- */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        opacity: currentView === 'MATCH' ? 1 : 0,
        transition: 'opacity 0.5s ease',
        pointerEvents: 'none'
      }}>
        
        {/* Score Bug (Top Left) */}
        {activeMatch && (
          <div style={{
            position: 'absolute', top: '40px', left: '40px',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
            borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            transform: graphics.showScoreBug ? 'translateX(0)' : 'translateX(-120%)',
            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <div style={{ background: '#58a6ff', color: '#000', padding: '4px 16px', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {activeMatch.category} - {activeMatch.round}
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '200px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {activeMatch.team1Seed && <span style={{color: '#8b949e', marginRight: '6px', fontSize: '0.9rem'}}>{activeMatch.team1Seed}</span>}
                  {activeMatch.team1Name}
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '1.5rem', fontWeight: 900, fontFamily: 'monospace' }}>
                  <div style={{ width: '30px', textAlign: 'center', color: '#8b949e' }}>{activeMatch.score.team1.sets}</div>
                  <div style={{ width: '30px', textAlign: 'center' }}>{activeMatch.score.team1.games}</div>
                  <div style={{ width: '40px', textAlign: 'center', color: '#3fb950', background: 'rgba(63, 185, 80, 0.1)', borderRadius: '4px' }}>{activeMatch.score.team1.points}</div>
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '200px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {activeMatch.team2Seed && <span style={{color: '#8b949e', marginRight: '6px', fontSize: '0.9rem'}}>{activeMatch.team2Seed}</span>}
                  {activeMatch.team2Name}
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '1.5rem', fontWeight: 900, fontFamily: 'monospace' }}>
                  <div style={{ width: '30px', textAlign: 'center', color: '#8b949e' }}>{activeMatch.score.team2.sets}</div>
                  <div style={{ width: '30px', textAlign: 'center' }}>{activeMatch.score.team2.games}</div>
                  <div style={{ width: '40px', textAlign: 'center', color: '#3fb950', background: 'rgba(63, 185, 80, 0.1)', borderRadius: '4px' }}>{activeMatch.score.team2.points}</div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tournament Logo Watermark (Top Right) */}
        <div style={{
          position: 'absolute', top: '40px', right: '40px',
          opacity: graphics.showTournamentLogo ? 0.8 : 0,
          transform: graphics.showTournamentLogo ? 'scale(1)' : 'scale(0.8)',
          transition: 'all 0.5s ease',
          fontSize: '2rem', fontWeight: 900, fontStyle: 'italic',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}>
          TENNIS <span style={{ color: '#58a6ff' }}>SUITE</span>
        </div>

        {/* Lower Thirds (Player 1) */}
        <div style={{
          position: 'absolute', bottom: '80px', left: '40px',
          background: 'linear-gradient(90deg, #161b22, transparent)',
          padding: '24px 64px 24px 24px', borderLeft: '4px solid #3fb950',
          opacity: graphics.showPlayer1LowerThird ? 1 : 0,
          transform: graphics.showPlayer1LowerThird ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{activeMatch?.team1Name}</div>
          <div style={{ fontSize: '1.2rem', color: '#8b949e' }}>World Rank: #12 • Aces: 14</div>
        </div>

        {/* Lower Thirds (Player 2) */}
        <div style={{
          position: 'absolute', bottom: '80px', left: '40px',
          background: 'linear-gradient(90deg, #161b22, transparent)',
          padding: '24px 64px 24px 24px', borderLeft: '4px solid #d2a8ff',
          opacity: graphics.showPlayer2LowerThird ? 1 : 0,
          transform: graphics.showPlayer2LowerThird ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{activeMatch?.team2Name}</div>
          <div style={{ fontSize: '1.2rem', color: '#8b949e' }}>World Rank: #45 • Aces: 6</div>
        </div>

        {/* Sponsor Ribbon (Bottom Right) */}
        <div style={{
          position: 'absolute', bottom: '80px', right: '40px',
          background: '#e3b341', color: '#000',
          padding: '12px 32px', borderRadius: '8px',
          fontWeight: 900, fontSize: '1.2rem',
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
          opacity: graphics.showSponsorOverlay ? 1 : 0,
          transform: graphics.showSponsorOverlay ? 'translateX(0)' : 'translateX(120%)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          SPONSORED BY <span style={{ fontSize: '1.5rem', fontStyle: 'italic', display: 'block' }}>ROLEX</span>
        </div>

        {/* Ad Space Banner (Left/Right alternating or static) */}
        <div style={{
          position: 'absolute', top: '150px', right: '40px', width: '300px', height: '250px',
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          opacity: graphics.showAdsSidebar ? 1 : 0,
          transform: graphics.showAdsSidebar ? 'translateX(0)' : 'translateX(150%)',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '0.7rem', color: '#8b949e', letterSpacing: '2px' }}>ADVERTISEMENT</div>
          <div style={{ animation: 'adCycle 15s infinite' }}>
            <img src="https://via.placeholder.com/260x180/1f2937/3fb950?text=WILSON+CLASH" alt="Ad 1" style={{ width: '260px', height: '180px', objectFit: 'cover', borderRadius: '8px' }} />
          </div>
          <style>{`
            @keyframes adCycle {
              0%, 30% { filter: hue-rotate(0deg); content: url('https://via.placeholder.com/260x180/1f2937/3fb950?text=NIKE+COURT'); }
              33%, 63% { filter: hue-rotate(120deg); content: url('https://via.placeholder.com/260x180/1f2937/58a6ff?text=GATORADE'); }
              66%, 96% { filter: hue-rotate(240deg); content: url('https://via.placeholder.com/260x180/1f2937/d2a8ff?text=WILSON+PRO'); }
            }
          `}</style>
        </div>

      </div>

      {/* Global Alerts (Delegate Overrides) */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%) scale(1.1)',
        background: 'rgba(248,81,73,0.9)', backdropFilter: 'blur(10px)',
        padding: '32px 64px', borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        opacity: graphics.fullScreenAlert ? 1 : 0,
        pointerEvents: graphics.fullScreenAlert ? 'auto' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{ fontSize: '3rem', fontWeight: 900, textAlign: 'center', letterSpacing: '4px' }}>
          {graphics.fullScreenAlert}
        </div>
      </div>

      {/* "Next Up" Ticker (Bottom Bar) */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px',
        background: '#0d1117', borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', padding: '0 24px',
        fontSize: '0.9rem', color: '#8b949e', whiteSpace: 'nowrap', overflow: 'hidden'
      }}>
        <span style={{ color: '#fff', fontWeight: 'bold', marginRight: '24px', background: '#f85149', padding: '4px 12px', borderRadius: '4px' }}>NEXT UP</span>
        <div style={{ animation: 'ticker 20s linear infinite' }}>
          • Mens Open: Charlie vs Delta (Court 1) • Womens Open: Echo vs Foxtrot (Court 2) • Mixed Doubles (Court 3)
        </div>
        <style>{`
          @keyframes ticker {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </div>

    </div>
  );
}

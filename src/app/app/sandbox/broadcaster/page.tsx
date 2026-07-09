'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useBroadcasterState } from './useBroadcasterState';

export default function BroadcasterControlPanel() {
  const { graphics, updateGraphics, activeMatch, mockMatches, loaded, syncStatus } = useBroadcasterState();

  if (!loaded) return <div style={{ padding: '48px', color: '#8b949e', background: '#0d1117', minHeight: '100vh' }}>Loading...</div>;

  const S = {
    page: { padding: '24px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' } as React.CSSProperties,
    layout: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', height: 'calc(100vh - 100px)' } as React.CSSProperties,
    sidebar: { background: '#161b22', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' } as React.CSSProperties,
    switcher: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>Control Room (Director's Desk)</h1>
            <Badge variant={syncStatus === 'LIVE' ? 'success' : 'warning'}>
              {syncStatus === 'LIVE' ? '● LIVE DB SYNC' : '↻ SYNCING...'}
            </Badge>
          </div>
          <p style={{ color: '#8b949e', margin: 0, marginTop: '4px' }}>Private signal routing, camera switching, and editorial control.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Button variant="primary" onClick={() => window.open('/sandbox/broadcaster/output', '_blank', 'width=1280,height=720')}>
            Open Public Presentation Screen ↗
          </Button>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Broadcaster" alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#21262d' }} />
        </div>
      </header>

      <div style={S.layout}>
        
        {/* Source Selection & Comm Feed */}
        <div style={S.sidebar}>
          
          <div>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem', color: '#fff' }}>Presentation Mode</h2>
            <div style={{ display: 'flex', gap: '8px', background: '#0d1117', padding: '8px', borderRadius: '8px', border: '1px solid #30363d' }}>
              <Button 
                variant={graphics.presentationMode === 'AUTO_CYCLE' ? 'primary' : 'secondary'} 
                style={{ flex: 1, padding: '4px' }}
                onClick={() => updateGraphics({ presentationMode: 'AUTO_CYCLE' })}
              >AUTO CYCLE</Button>
              <Button 
                variant={graphics.presentationMode === 'FORCE_MATCH' ? 'primary' : 'secondary'} 
                style={{ flex: 1, padding: '4px' }}
                onClick={() => updateGraphics({ presentationMode: 'FORCE_MATCH' })}
              >LOCK MATCH</Button>
              <Button 
                variant={graphics.presentationMode === 'FORCE_BRACKET' ? 'primary' : 'secondary'} 
                style={{ flex: 1, padding: '4px' }}
                onClick={() => updateGraphics({ presentationMode: 'FORCE_BRACKET' })}
              >LOCK BRACKET</Button>
            </div>
          </div>

          <div>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem', color: '#fff' }}>Active Match Feed</h2>
            <select 
              value={graphics.activeMatchId || ''} 
              onChange={e => updateGraphics({ activeMatchId: e.target.value })}
              style={{ width: '100%', padding: '12px', background: '#0d1117', color: '#fff', border: '1px solid #30363d', borderRadius: '6px' }}
            >
              <option value="">-- Select Match --</option>
              {Object.values(mockMatches).map(m => (
                <option key={m.id} value={m.id}>{m.team1Name} vs {m.team2Name} ({m.status})</option>
              ))}
            </select>
          </div>

          {activeMatch && (
            <div style={{ background: '#0d1117', padding: '16px', borderRadius: '8px', border: '1px solid #30363d' }}>
              <Badge variant="success" style={{ marginBottom: '8px' }}>STATE DRIVEN FEED</Badge>
              <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '4px' }}>{activeMatch.category}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>{activeMatch.team1Name}</span>
                <span style={{ fontWeight: 'bold' }}>{activeMatch.score.team1.sets} - {activeMatch.score.team1.games} <span style={{color: '#58a6ff'}}>({activeMatch.score.team1.points})</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{activeMatch.team2Name}</span>
                <span style={{ fontWeight: 'bold' }}>{activeMatch.score.team2.sets} - {activeMatch.score.team2.games} <span style={{color: '#58a6ff'}}>({activeMatch.score.team2.points})</span></span>
              </div>
            </div>
          )}

          <div>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem', color: '#fff' }}>Camera Switcher</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <Button 
                variant={graphics.activeCamera === 'WIDE_ANGLE' ? 'destructive' : 'secondary'}
                onClick={() => updateGraphics({ activeCamera: 'WIDE_ANGLE' })}
              >WIDE</Button>
              <Button 
                variant={graphics.activeCamera === 'CAM_1' ? 'destructive' : 'secondary'}
                onClick={() => updateGraphics({ activeCamera: 'CAM_1' })}
              >CAM 1</Button>
              <Button 
                variant={graphics.activeCamera === 'CAM_2' ? 'destructive' : 'secondary'}
                onClick={() => updateGraphics({ activeCamera: 'CAM_2' })}
              >CAM 2</Button>
            </div>
          </div>

        </div>

        {/* Graphic Switcher */}
        <div style={{ background: '#161b22', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '1.5rem', borderBottom: '1px solid #30363d', paddingBottom: '12px' }}>Graphics Injection (Overlays)</h2>
          
          <div style={S.switcher}>
            <Card style={{ padding: '16px', background: '#0d1117', border: `1px solid ${graphics.showScoreBug ? '#3fb950' : '#30363d'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>Score Bug</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#8b949e' }}>Top-left persistent score.</p>
                </div>
                <Button 
                  variant={graphics.showScoreBug ? 'destructive' : 'success'}
                  onClick={() => updateGraphics({ showScoreBug: !graphics.showScoreBug })}
                >
                  {graphics.showScoreBug ? 'CUT' : 'TAKE'}
                </Button>
              </div>
            </Card>

            <Card style={{ padding: '16px', background: '#0d1117', border: `1px solid ${graphics.showTournamentLogo ? '#3fb950' : '#30363d'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>Watermark Logo</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#8b949e' }}>Top-right corner.</p>
                </div>
                <Button 
                  variant={graphics.showTournamentLogo ? 'destructive' : 'success'}
                  onClick={() => updateGraphics({ showTournamentLogo: !graphics.showTournamentLogo })}
                >
                  {graphics.showTournamentLogo ? 'CUT' : 'TAKE'}
                </Button>
              </div>
            </Card>

            <Card style={{ padding: '16px', background: '#0d1117', border: `1px solid ${graphics.showSponsorOverlay ? '#3fb950' : '#30363d'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#e3b341' }}>Sponsor Ribbon</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#8b949e' }}>Bottom-right sponsor loop.</p>
                </div>
                <Button 
                  variant={graphics.showSponsorOverlay ? 'destructive' : 'success'}
                  onClick={() => updateGraphics({ showSponsorOverlay: !graphics.showSponsorOverlay })}
                >
                  {graphics.showSponsorOverlay ? 'CUT' : 'TAKE'}
                </Button>
              </div>
            </Card>

            <Card style={{ padding: '16px', background: '#0d1117', border: `1px solid ${graphics.showPlayer1LowerThird ? '#3fb950' : '#30363d'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>Player 1 Profile</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#8b949e' }}>Lower-third stats.</p>
                </div>
                <Button 
                  variant={graphics.showPlayer1LowerThird ? 'destructive' : 'success'}
                  onClick={() => updateGraphics({ showPlayer1LowerThird: !graphics.showPlayer1LowerThird, showPlayer2LowerThird: false })}
                >
                  {graphics.showPlayer1LowerThird ? 'CUT' : 'TAKE'}
                </Button>
              </div>
            </Card>
          </div>

          <h2 style={{ margin: '32px 0 16px', fontSize: '1.2rem', color: '#8b949e' }}>Delegate Output Feeds (Read-Only)</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'rgba(248,81,73,0.1)', color: '#f85149', borderRadius: '6px', fontSize: '0.85rem', flex: 1, border: '1px solid #f85149' }}>
              <strong>SYSTEM SUSPENSION:</strong> INACTIVE
            </div>
            <div style={{ padding: '12px', background: 'rgba(88,166,255,0.1)', color: '#58a6ff', borderRadius: '6px', fontSize: '0.85rem', flex: 1, border: '1px solid #58a6ff' }}>
              <strong>ACTIVE OVERRIDES:</strong> NONE
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useBroadcasterState } from './useBroadcasterState';

export default function BroadcasterControlPanel() {
  const { graphics, updateGraphics, activeMatch, mockMatches, loaded, syncStatus } = useBroadcasterState();

  if (!loaded) return <div >Loading...</div>;

  const S = {
    page: { padding: '24px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' } as React.CSSProperties,
    layout: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', height: 'calc(100vh - 100px)' } as React.CSSProperties,
    sidebar: { background: '#161b22', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' } as React.CSSProperties,
    switcher: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <header >
        <div>
          <div >
            <h1 >Control Room (Director's Desk)</h1>
            <Badge variant={syncStatus === 'LIVE' ? 'success' : 'warning'}>
              {syncStatus === 'LIVE' ? '● LIVE DB SYNC' : '↻ SYNCING...'}
            </Badge>
          </div>
          <p >Private signal routing, camera switching, and editorial control.</p>
        </div>
        <div >
          <Button variant="secondary" onClick={() => window.open('/sandbox/broadcaster/output', '_blank', 'width=1280,height=720')}>
            Open Public Presentation Screen ↗
          </Button>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Broadcaster" alt="Profile"  />
        </div>
      </header>

      <div style={S.layout}>
        
        {/* Source Selection & Comm Feed */}
        <div style={S.sidebar}>
          
          <div>
            <h2 >Presentation Mode</h2>
            <div >
              <Button 
                variant={graphics.presentationMode === 'AUTO_CYCLE' ? 'primary' : 'secondary'} 
                
                onClick={() => updateGraphics({ presentationMode: 'AUTO_CYCLE' })}
              >AUTO CYCLE</Button>
              <Button 
                variant={graphics.presentationMode === 'FORCE_MATCH' ? 'primary' : 'secondary'} 
                
                onClick={() => updateGraphics({ presentationMode: 'FORCE_MATCH' })}
              >LOCK MATCH</Button>
              <Button 
                variant={graphics.presentationMode === 'FORCE_BRACKET' ? 'primary' : 'secondary'} 
                
                onClick={() => updateGraphics({ presentationMode: 'FORCE_BRACKET' })}
              >LOCK BRACKET</Button>
            </div>
          </div>

          <div>
            <h2 >Active Match Feed</h2>
            <select 
              value={graphics.activeMatchId || ''} 
              onChange={e => updateGraphics({ activeMatchId: e.target.value })}
              
            >
              <option value="">-- Select Match --</option>
              {Object.values(mockMatches).map(m => (
                <option key={m.id} value={m.id}>{m.team1Name} vs {m.team2Name} ({m.status})</option>
              ))}
            </select>
          </div>

          {activeMatch && (
            <div >
              <Badge variant="success" >STATE DRIVEN FEED</Badge>
              <div >{activeMatch.category}</div>
              <div >
                <span>{activeMatch.team1Name}</span>
                <span >{activeMatch.score.team1.sets} - {activeMatch.score.team1.games} <span >({activeMatch.score.team1.points})</span></span>
              </div>
              <div >
                <span>{activeMatch.team2Name}</span>
                <span >{activeMatch.score.team2.sets} - {activeMatch.score.team2.games} <span >({activeMatch.score.team2.points})</span></span>
              </div>
            </div>
          )}

          <div>
            <h2 >Camera Switcher</h2>
            <div >
              <Button 
                variant={graphics.activeCamera === 'WIDE_ANGLE' ? 'danger' : 'secondary'}
                onClick={() => updateGraphics({ activeCamera: 'WIDE_ANGLE' })}
              >WIDE</Button>
              <Button 
                variant={graphics.activeCamera === 'CAM_1' ? 'danger' : 'secondary'}
                onClick={() => updateGraphics({ activeCamera: 'CAM_1' })}
              >CAM 1</Button>
              <Button 
                variant={graphics.activeCamera === 'CAM_2' ? 'danger' : 'secondary'}
                onClick={() => updateGraphics({ activeCamera: 'CAM_2' })}
              >CAM 2</Button>
            </div>
          </div>

        </div>

        {/* Graphic Switcher */}
        <div >
          <h2 >Graphics Injection (Overlays)</h2>
          
          <div style={S.switcher}>
            <Card style={{ padding: '16px', background: '#0d1117', border: `1px solid ${graphics.showScoreBug ? '#3fb950' : '#30363d'}` }}>
              <div >
                <div>
                  <h3 >Score Bug</h3>
                  <p >Top-left persistent score.</p>
                </div>
                <Button 
                  variant={graphics.showScoreBug ? 'danger' : 'success'}
                  onClick={() => updateGraphics({ showScoreBug: !graphics.showScoreBug })}
                >
                  {graphics.showScoreBug ? 'CUT' : 'TAKE'}
                </Button>
              </div>
            </Card>

            <Card style={{ padding: '16px', background: '#0d1117', border: `1px solid ${graphics.showTournamentLogo ? '#3fb950' : '#30363d'}` }}>
              <div >
                <div>
                  <h3 >Watermark Logo</h3>
                  <p >Top-right corner.</p>
                </div>
                <Button 
                  variant={graphics.showTournamentLogo ? 'danger' : 'success'}
                  onClick={() => updateGraphics({ showTournamentLogo: !graphics.showTournamentLogo })}
                >
                  {graphics.showTournamentLogo ? 'CUT' : 'TAKE'}
                </Button>
              </div>
            </Card>

            <Card style={{ padding: '16px', background: '#0d1117', border: `1px solid ${graphics.showSponsorOverlay ? '#3fb950' : '#30363d'}` }}>
              <div >
                <div>
                  <h3 >Sponsor Ribbon</h3>
                  <p >Bottom-right sponsor loop.</p>
                </div>
                <Button 
                  variant={graphics.showSponsorOverlay ? 'danger' : 'success'}
                  onClick={() => updateGraphics({ showSponsorOverlay: !graphics.showSponsorOverlay })}
                >
                  {graphics.showSponsorOverlay ? 'CUT' : 'TAKE'}
                </Button>
              </div>
            </Card>

            <Card style={{ padding: '16px', background: '#0d1117', border: `1px solid ${graphics.showPlayer1LowerThird ? '#3fb950' : '#30363d'}` }}>
              <div >
                <div>
                  <h3 >Player 1 Profile</h3>
                  <p >Lower-third stats.</p>
                </div>
                <Button 
                  variant={graphics.showPlayer1LowerThird ? 'danger' : 'success'}
                  onClick={() => updateGraphics({ showPlayer1LowerThird: !graphics.showPlayer1LowerThird, showPlayer2LowerThird: false })}
                >
                  {graphics.showPlayer1LowerThird ? 'CUT' : 'TAKE'}
                </Button>
              </div>
            </Card>
          </div>

          <h2 >Delegate Output Feeds (Read-Only)</h2>
          <div >
            <div >
              <strong>SYSTEM SUSPENSION:</strong> INACTIVE
            </div>
            <div >
              <strong>ACTIVE OVERRIDES:</strong> NONE
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

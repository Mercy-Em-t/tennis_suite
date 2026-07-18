'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useBroadcasterState } from './useBroadcasterState';

export default function BroadcasterControlPanel() {
  const { graphics, updateGraphics, activeMatch, mockMatches, loaded, syncStatus } = useBroadcasterState();

  if (!loaded) return <div style={{ padding: '48px', color: '#fff' }}>Loading Operational Desk...</div>;

  const S = {
    page: { padding: '24px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' } as React.CSSProperties,
    layout: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', height: 'calc(100vh - 100px)' } as React.CSSProperties,
    sidebar: { background: '#161b22', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', overflowY: 'auto' } as React.CSSProperties,
    switcher: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>Broadcaster Control Desk</h1>
            <Badge variant={syncStatus === 'LIVE' ? 'success' : 'warning'}>
              {syncStatus === 'LIVE' ? '● LIVE SYNC' : '↻ SYNCING...'}
            </Badge>
            {graphics.isSandbox && <Badge variant="warning">SANDBOX MODE</Badge>}
          </div>
          <p style={{ margin: 0, color: '#8b949e' }}>Manage public presentation screen, ads, and telemetry</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button variant="secondary" onClick={() => updateGraphics({ isSandbox: !graphics.isSandbox })}>
            Toggle {graphics.isSandbox ? 'Live' : 'Sandbox'} Mode
          </Button>
          <Button variant="secondary" onClick={() => window.open('/app/dashboards/broadcaster/output/v2', '_blank', 'width=1280,height=720')}>
            Preview V2 Output ↗
          </Button>
          <Button variant="primary" onClick={() => window.open('/app/dashboards/broadcaster/output', '_blank', 'width=1280,height=720')}>
            Open V1 Output ↗
          </Button>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Broadcaster" alt="Profile" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff' }} />
        </div>
      </header>

      <div style={S.layout}>
        
        {/* Source Selection & Comm Feed */}
        <div style={S.sidebar}>
          
          <div>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#8b949e' }}>Presentation Mode</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button 
                variant={graphics.presentationMode === 'AUTO_CYCLE' ? 'primary' : 'secondary'} 
                style={{ justifyContent: 'flex-start' }}
                onClick={() => updateGraphics({ presentationMode: 'AUTO_CYCLE' })}
              >AUTO CYCLE (Carousel)</Button>
              <Button 
                variant={graphics.presentationMode === 'FORCE_MATCH' ? 'primary' : 'secondary'} 
                style={{ justifyContent: 'flex-start' }}
                onClick={() => updateGraphics({ presentationMode: 'FORCE_MATCH' })}
              >LOCK TO ACTIVE MATCH</Button>
              <Button 
                variant={graphics.presentationMode === 'FORCE_BRACKET' ? 'primary' : 'secondary'} 
                style={{ justifyContent: 'flex-start' }}
                onClick={() => updateGraphics({ presentationMode: 'FORCE_BRACKET' })}
              >LOCK TO BRACKET</Button>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#8b949e' }}>Active Match Feed</h2>
            <select 
              value={graphics.activeMatchId || ''} 
              onChange={e => updateGraphics({ activeMatchId: e.target.value })}
              style={{ width: '100%', padding: '12px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
              disabled={!graphics.isSandbox}
            >
              <option value="">-- Select Match --</option>
              {Object.values(mockMatches).map(m => (
                <option key={m.id} value={m.id}>{m.team1Name} vs {m.team2Name} ({m.status})</option>
              ))}
            </select>
            {!graphics.isSandbox && (
              <p style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '8px' }}>
                * In Live mode, matches are driven by the Tournament Engine SSE.
              </p>
            )}
          </div>

          {activeMatch && graphics.isSandbox && (
            <div style={{ background: '#0d1117', border: '1px solid #3fb950', padding: '16px', borderRadius: '8px' }}>
              <div style={{ marginBottom: '12px' }}><Badge variant="success">SANDBOX FEED</Badge></div>
              <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '8px' }}>{activeMatch.category}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>{activeMatch.team1Name}</span>
                <span style={{ fontWeight: 700 }}>{activeMatch.score.team1.sets} - {activeMatch.score.team1.games} <span style={{ color: '#f85149' }}>({activeMatch.score.team1.points})</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{activeMatch.team2Name}</span>
                <span style={{ fontWeight: 700 }}>{activeMatch.score.team2.sets} - {activeMatch.score.team2.games} <span style={{ color: '#f85149' }}>({activeMatch.score.team2.points})</span></span>
              </div>
            </div>
          )}

          <div>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#8b949e' }}>Sponsors & Ads (Pillar 16)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#fff' }}>Sponsor Cycle (Comma separated)</label>
                <input 
                  type="text" 
                  value={graphics.sponsorList} 
                  onChange={e => updateGraphics({ sponsorList: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#fff' }}>Ad Banner URL</label>
                <input 
                  type="text" 
                  placeholder="https://..."
                  value={graphics.adSlotImageUrl} 
                  onChange={e => updateGraphics({ adSlotImageUrl: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#fff' }}>Ticker Belt Text</label>
                <textarea 
                  value={graphics.tickerText} 
                  onChange={e => updateGraphics({ tickerText: e.target.value })}
                  rows={2}
                  style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>
          
          <div>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#8b949e' }}>Overlays</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={graphics.showScoreBug} onChange={e => updateGraphics({ showScoreBug: e.target.checked })} /> Show Score Bug
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={graphics.showAdsSidebar} onChange={e => updateGraphics({ showAdsSidebar: e.target.checked })} /> Show Sidebar Ads
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={graphics.showSponsorOverlay} onChange={e => updateGraphics({ showSponsorOverlay: e.target.checked })} /> Force Sponsor Takeover
              </label>
            </div>
          </div>

        </div>

        {/* Graphics Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ flex: 1, background: '#000', borderRadius: '12px', border: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(0,0,0,0.8)', padding: '8px 16px', borderRadius: '24px', color: '#8b949e', fontSize: '0.9rem', zIndex: 10 }}>
              PROGRAM OUT (Simulated)
            </div>
            
            {/* Simulated Output Frame */}
            <iframe 
              src="/app/dashboards/broadcaster/output?preview=true" 
              style={{ width: '100%', height: '100%', border: 'none', transform: 'scale(1)', transformOrigin: 'top left' }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

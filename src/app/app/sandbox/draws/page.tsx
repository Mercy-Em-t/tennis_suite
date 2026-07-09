'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useDrawState, DrawFormat } from './useDrawState';
import { Users, LayoutList, Trophy, FileText, CheckCircle2 } from 'lucide-react';

export default function DrawsSandbox() {
  const { 
    players, activeCategory, setActiveCategory, updateManualSeed, 
    generateDraw, activeDraft, publishDraw, logs 
  } = useDrawState();

  const [format, setFormat] = useState<DrawFormat>("KNOCKOUT");
  const [bracketSizeOverride, setBracketSizeOverride] = useState<number | undefined>(undefined);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', padding: '32px', fontFamily: 'Inter, sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 800 }}>Registration & Draws Sandbox</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Simulate pulling verified players into algorithmic bracket logic.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant={activeCategory === 'MEN_SINGLES' ? 'primary' : 'outline'} onClick={() => setActiveCategory('MEN_SINGLES')}>Men's Singles</Button>
          <Button variant={activeCategory === 'WOMEN_SINGLES' ? 'primary' : 'outline'} onClick={() => setActiveCategory('WOMEN_SINGLES')}>Women's Singles</Button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 280px', gap: '24px' }}>
        
        {/* LEFT SIDEBAR: REGISTRATION POOL */}
        <Card style={{ display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} /> Verified Registrations
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Total: {players.length} Players</div>
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {players.map(p => (
              <div key={p.id} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff' }}>
                <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>ITF Points: {p.ranking}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Seed:</span>
                    <input 
                      type="number" 
                      min="1" max="32" 
                      placeholder="Auto"
                      value={p.manualSeed || ''}
                      onChange={(e) => updateManualSeed(p.id, e.target.value ? parseInt(e.target.value) : null)}
                      style={{ width: '50px', padding: '2px 4px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#0f172a', background: '#ffffff' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* MAIN AREA: DRAW ENGINE & VISUALIZER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Controls */}
          <Card style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Draw Format</label>
                <select 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value as DrawFormat)}
                  style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', background: '#ffffff' }}
                >
                  <option value="KNOCKOUT">Standard Knockout (Tree)</option>
                  <option value="POOLS_TO_KNOCKOUT">Pools / Round Robin</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Knockout Size (Optional Override)</label>
                <select 
                  value={bracketSizeOverride || ''} 
                  onChange={(e) => setBracketSizeOverride(e.target.value ? parseInt(e.target.value) : undefined)}
                  style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', background: '#ffffff' }}
                >
                  <option value="">Auto-Calculate (Best Fit)</option>
                  <option value="16">Round of 16</option>
                  <option value="32">Round of 32</option>
                  <option value="64">Round of 64</option>
                </select>
              </div>
            </div>
            <Button size="lg" onClick={() => generateDraw(format, bracketSizeOverride)}>
              <LayoutList size={18} style={{ marginRight: '8px' }} />
              GENERATE NEW DRAFT
            </Button>
          </Card>

          {/* Visualizer Output */}
          <Card style={{ flex: 1, padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            {!activeDraft ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
                <Trophy size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>No active draw draft. Generate one above.</p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Draft Version: {activeDraft.version}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                      {activeDraft.config.format === 'KNOCKOUT' ? `Round of ${activeDraft.config.bracketSize}` : 'Round Robin Pools'} | {activeDraft.config.category}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Badge variant={activeDraft.status === 'PUBLISHED' ? 'success' : 'warning'}>
                      {activeDraft.status}
                    </Badge>
                    {activeDraft.status === 'DRAFT' && (
                      <Button variant="success" onClick={publishDraw}>
                        <CheckCircle2 size={16} style={{ marginRight: '8px' }} /> PUBLISH DRAW
                      </Button>
                    )}
                  </div>
                </div>

                {/* Render Knockout Tree (Simplified) */}
                {activeDraft.config.format === 'KNOCKOUT' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    {activeDraft.slots.map(slot => (
                      <div key={slot.matchId} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ background: '#f1f5f9', padding: '4px 8px', fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>
                          Match {slot.matchId}
                        </div>
                        <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', background: slot.player1 === 'BYE' ? '#f8fafc' : '#fff' }}>
                          {slot.player1 === 'BYE' ? <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>BYE</span> : slot.player1?.name}
                        </div>
                        <div style={{ padding: '8px', background: slot.player2 === 'BYE' ? '#f8fafc' : '#fff' }}>
                          {slot.player2 === 'BYE' ? <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>BYE</span> : slot.player2?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Render Pools Grid */}
                {activeDraft.config.format === 'POOLS_TO_KNOCKOUT' && activeDraft.pools && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {Object.entries(activeDraft.pools).map(([poolName, pList]) => (
                      <div key={poolName} style={{ border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                        <div style={{ padding: '12px', background: '#f1f5f9', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1' }}>
                          {poolName}
                        </div>
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {pList.map((p, i) => (
                            <div key={p.id} style={{ display: 'flex', gap: '12px', fontSize: '0.9rem' }}>
                              <span style={{ color: '#94a3b8', width: '20px' }}>{i + 1}.</span> {p.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT SIDEBAR: AUDIT LOGS */}
        <Card style={{ display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} /> Draw Meta-Logs
            </h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                {log}
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}

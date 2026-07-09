'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTournamentState, LifecycleStage } from './useTournamentState';
import { Database, Play, Lock, AlertTriangle, FileText, DatabaseZap, ShieldAlert, Cpu } from 'lucide-react';

const STAGES: LifecycleStage[] = ['BLUEPRINT', 'INITIALIZATION', 'PRE_TOURNAMENT', 'LIVE', 'POST_TOURNAMENT', 'ARCHIVED'];

export default function TournamentObjectSandbox() {
  const { state, initializeTournament, advanceStage, attemptIllegalMutation, reset } = useTournamentState();

  const isArchived = state.stage === 'ARCHIVED';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Tournament Object Sandbox
          </h1>
          <p style={{ margin: 0, color: '#64748b', maxWidth: '600px' }}>
            Visualize the data structure, payload size, and audit logging of a Tournament as it moves through its lifecycle.
          </p>
        </div>
        <Button variant="outline" onClick={reset}>RESET TO BLUEPRINT</Button>
      </header>

      {/* TIMELINE STEPPER */}
      <Card style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          {/* Connecting Line */}
          <div style={{ position: 'absolute', top: '50%', left: '40px', right: '40px', height: '2px', background: '#e2e8f0', zIndex: 0 }} />
          
          {STAGES.map((s, idx) => {
            const isActive = state.stage === s;
            const isPast = STAGES.indexOf(state.stage) > idx;
            return (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, position: 'relative' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? '#3b82f6' : isPast ? '#10b981' : '#f1f5f9',
                  color: isActive || isPast ? '#fff' : '#94a3b8',
                  border: `2px solid ${isActive ? '#2563eb' : isPast ? '#059669' : '#cbd5e1'}`,
                  fontWeight: 'bold'
                }}>
                  {isPast ? '✓' : idx + 1}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 'bold' : 'normal', color: isActive ? '#0f172a' : '#64748b' }}>
                  {s.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        
        {/* MAIN VISUALIZER AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {state.stage === 'BLUEPRINT' ? (
            <Card style={{ padding: '60px 40px', textAlign: 'center', border: '2px dashed #cbd5e1', background: '#f8fafc' }}>
              <FileText size={48} style={{ margin: '0 auto 16px', color: '#94a3b8' }} />
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Select a Blueprint</h2>
              <p style={{ color: '#64748b', marginBottom: '24px' }}>
                A tournament does not exist until it is explicitly initialized from a blueprint template.
              </p>
              <Button size="lg" onClick={() => initializeTournament('Grand Slam 2026')}>
                INITIALIZE TOURNAMENT OBJECT
              </Button>
            </Card>
          ) : (
            <Card style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
              {isArchived && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: '#64748b' }} />
              )}
              {state.stage === 'LIVE' && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: '#ef4444' }} />
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold' }}>{state.metadata.id}</div>
                  <h2 style={{ margin: '4px 0 12px 0', fontSize: '2rem' }}>{state.metadata.name}</h2>
                  <Badge variant={isArchived ? 'secondary' : 'primary'}>{state.metadata.status}</Badge>
                </div>

                {/* PAYLOAD SIZE VISUALIZER */}
                <div style={{ textAlign: 'right', padding: '16px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <DatabaseZap size={14} /> ACTIVE NETWORK PAYLOAD
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#3b82f6' }}>
                    {state.payloadSizeKb} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>KB</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Data is lazy-loaded to prevent device bloat.
                  </div>
                </div>
              </div>

              {/* DYNAMIC CONTENT BASED ON STAGE */}
              {isArchived && state.derivedAnalytics ? (
                <div style={{ background: '#f1f5f9', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu size={20} /> Derived Knowledge (Read-Only)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Matches Played</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{state.derivedAnalytics.totalMatches}</div>
                    </div>
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Avg. Match Duration</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{state.derivedAnalytics.averageMatchTime}</div>
                    </div>
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Prize Pool</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>${state.derivedAnalytics.totalPrizePool.toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Top Seed Win Rate</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{state.derivedAnalytics.topSeedWinRate}</div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="destructive" onClick={attemptIllegalMutation}>
                      <AlertTriangle size={16} style={{ marginRight: '8px' }} />
                      SIMULATE ILLEGAL WRITE ATTEMPT
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                  <Button size="lg" onClick={advanceStage}>
                    ADVANCE TO NEXT STAGE <Play size={16} style={{ marginLeft: '8px' }} />
                  </Button>
                </div>
              )}
            </Card>
          )}

        </div>

        {/* AUDIT LOG SIDEBAR */}
        <Card style={{ display: 'flex', flexDirection: 'column', maxHeight: '600px' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} />
            <span style={{ fontWeight: 'bold' }}>Object Audit Ledger</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {state.logs.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', marginTop: '40px' }}>
                Waiting for initialization...
              </div>
            ) : (
              state.logs.map(log => (
                <div key={log.id} style={{ fontSize: '0.85rem', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#94a3b8' }}>
                    <span>{log.timestamp}</span>
                    <span style={{ fontWeight: 'bold', color: log.actor === 'SYSTEM_AUTH' ? '#ef4444' : '#64748b' }}>{log.actor}</span>
                  </div>
                  <div style={{ color: log.action.includes('ILLEGAL') || log.action.includes('DENIED') ? '#ef4444' : '#0f172a' }}>
                    {log.action}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}

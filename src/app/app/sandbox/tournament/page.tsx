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
    <div >
      
      <header >
        <div>
          <h1 >
            Tournament Object Sandbox
          </h1>
          <p >
            Visualize the data structure, payload size, and audit logging of a Tournament as it moves through its lifecycle.
          </p>
        </div>
        <Button variant="secondary" onClick={reset}>RESET TO BLUEPRINT</Button>
      </header>

      {/* TIMELINE STEPPER */}
      <Card >
        <div >
          {/* Connecting Line */}
          <div  />
          
          {STAGES.map((s, idx) => {
            const isActive = state.stage === s;
            const isPast = STAGES.indexOf(state.stage) > idx;
            return (
              <div key={s} >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? '#3b82f6' : isPast ? '#10b981' : '#f1f5f9',
                  color: isActive || isPast ? '#fff' : '#94a3b8',
                  border: `2px solid ${isActive ? '#2563eb' : isPast ? '#059669' : '#cbd5e1'}`,
                  fontWeight: 'bold'
                }}>
                  {isPast ? '✓' : idx + 1}
                </div>
                <span >
                  {s.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <div >
        
        {/* MAIN VISUALIZER AREA */}
        <div >
          
          {state.stage === 'BLUEPRINT' ? (
            <Card >
              <FileText size={48}  />
              <h2 >Select a Blueprint</h2>
              <p >
                A tournament does not exist until it is explicitly initialized from a blueprint template.
              </p>
              <Button size="lg" onClick={() => initializeTournament('Grand Slam 2026')}>
                INITIALIZE TOURNAMENT OBJECT
              </Button>
            </Card>
          ) : (
            <Card >
              {isArchived && (
                <div  />
              )}
              {state.stage === 'LIVE' && (
                <div  />
              )}
              
              <div >
                <div>
                  <div >{state.metadata.id}</div>
                  <h2 >{state.metadata.name}</h2>
                  <Badge variant={isArchived ? 'default' : 'default'}>{state.metadata.status}</Badge>
                </div>

                {/* PAYLOAD SIZE VISUALIZER */}
                <div >
                  <div >
                    <DatabaseZap size={14} /> ACTIVE NETWORK PAYLOAD
                  </div>
                  <div >
                    {state.payloadSizeKb} <span >KB</span>
                  </div>
                  <div >
                    Data is lazy-loaded to prevent device bloat.
                  </div>
                </div>
              </div>

              {/* DYNAMIC CONTENT BASED ON STAGE */}
              {isArchived && state.derivedAnalytics ? (
                <div >
                  <h3 >
                    <Cpu size={20} /> Derived Knowledge (Read-Only)
                  </h3>
                  <div >
                    <div >
                      <div >Total Matches Played</div>
                      <div >{state.derivedAnalytics.totalMatches}</div>
                    </div>
                    <div >
                      <div >Avg. Match Duration</div>
                      <div >{state.derivedAnalytics.averageMatchTime}</div>
                    </div>
                    <div >
                      <div >Total Prize Pool</div>
                      <div >${state.derivedAnalytics.totalPrizePool.toLocaleString()}</div>
                    </div>
                    <div >
                      <div >Top Seed Win Rate</div>
                      <div >{state.derivedAnalytics.topSeedWinRate}</div>
                    </div>
                  </div>
                  
                  <div >
                    <Button variant="danger" onClick={attemptIllegalMutation}>
                      <AlertTriangle size={16}  />
                      SIMULATE ILLEGAL WRITE ATTEMPT
                    </Button>
                  </div>
                </div>
              ) : (
                <div >
                  <Button size="lg" onClick={advanceStage}>
                    ADVANCE TO NEXT STAGE <Play size={16}  />
                  </Button>
                </div>
              )}
            </Card>
          )}

        </div>

        {/* AUDIT LOG SIDEBAR */}
        <Card >
          <div >
            <Database size={18} />
            <span >Object Audit Ledger</span>
          </div>
          <div >
            {state.logs.length === 0 ? (
              <div >
                Waiting for initialization...
              </div>
            ) : (
              state.logs.map(log => (
                <div key={log.id} >
                  <div >
                    <span>{log.timestamp}</span>
                    <span >{log.actor}</span>
                  </div>
                  <div >
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

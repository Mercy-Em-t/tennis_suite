'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TournamentSandboxData, SandboxMatch } from '../../useSandboxState';

interface Props {
  tournament: TournamentSandboxData;
  updateTournament: (updates: Partial<TournamentSandboxData>) => void;
}

export default function DuringTournamentView({ tournament, updateTournament }: Props) {
  if (tournament.status !== 'ACTIVE') {
    return (
      <Card style={{ background: '#161b22', border: '1px dashed rgba(255,255,255,0.2)', padding: '48px', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '8px' }}>Event is not Active</h2>
        <p style={{ color: '#8b949e', marginBottom: '24px' }}>You must publish the match schedule in the Pre-Tournament view to begin the event.</p>
      </Card>
    );
  }

  const liveMatches = (tournament.matches || []).filter(m => m.status === 'IN_PROGRESS' || m.status === 'PENDING');
  const completedMatches = (tournament.matches || []).filter(m => m.status === 'COMPLETED');
  const totalMatchesCount = (tournament.matches || []).length;
  const completionPercentage = totalMatchesCount === 0 ? 0 : Math.round((completedMatches.length / totalMatchesCount) * 100);

  const getScoreValue = (scoreState: string, isTeamA: boolean) => {
    try {
      const parsed = JSON.parse(scoreState || '{}');
      return isTeamA ? parsed.gamesA || 0 : parsed.gamesB || 0;
    } catch {
      return 0;
    }
  };

  const handleScorePoint = (matchId: string, isTeamA: boolean) => {
    const nextMatches = (tournament.matches || []).map(m => {
      if (m.id === matchId) {
        try {
          const parsed = JSON.parse(m.scoreState || '{"setsA":0,"setsB":0,"gamesA":0,"gamesB":0}');
          if (isTeamA) {
            parsed.gamesA = (parsed.gamesA || 0) + 1;
          } else {
            parsed.gamesB = (parsed.gamesB || 0) + 1;
          }

          // Simple set logic for tennis: first to 6 wins the match
          let status = m.status;
          if (parsed.gamesA >= 6) {
            status = 'COMPLETED' as const;
            parsed.setsA = 1;
            alert(`Match complete! ${m.teamA.franchiseName} wins 6-${parsed.gamesB}!`);
          } else if (parsed.gamesB >= 6) {
            status = 'COMPLETED' as const;
            parsed.setsB = 1;
            alert(`Match complete! ${m.teamB.franchiseName} wins 6-${parsed.gamesA}!`);
          }

          return {
            ...m,
            scoreState: JSON.stringify(parsed),
            status,
            durationSec: m.durationSec + 120 // mock duration increment
          };
        } catch {
          return m;
        }
      }
      return m;
    });

    updateTournament({ matches: nextMatches });
  };

  const S = {
    grid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' } as React.CSSProperties,
    card: { background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', marginBottom: '24px' } as React.CSSProperties,
    h3: { margin: '0 0 16px', color: '#fff', fontSize: '1.25rem', fontWeight: 700 } as React.CSSProperties,
    matchCard: { background: '#0d1117', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px' } as React.CSSProperties,
    scoreBox: { background: '#21262d', padding: '6px 14px', borderRadius: '6px', fontFamily: 'monospace', fontWeight: 'bold', color: '#fff', fontSize: '1.1rem' } as React.CSSProperties,
    progressTrack: { width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', margin: '16px 0 8px' } as React.CSSProperties,
    progressBar: (pct: number) => ({ width: `${pct}%`, height: '100%', background: '#3fb950', transition: 'width 0.4s ease' } as React.CSSProperties),
  };

  return (
    <div style={S.grid}>
      <div>
        <Card style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={S.h3}>Live Event Radar</h3>
            <Badge variant="success">LIVE TELEMETRY ACTIVE</Badge>
          </div>
          <p style={{ color: '#8b949e', marginBottom: '24px', lineHeight: 1.6 }}>Monitor match progression in real-time. Use the scoring clickers to simulate match points.</p>

          {liveMatches.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', background: '#0d1117', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)', color: '#8b949e' }}>
              <p style={{ margin: '0 0 16px' }}>No matches are currently active on physical courts.</p>
              <Button variant="primary" onClick={() => window.location.href = `/sandbox/host/tournament/${tournament.id}/dispatcher`}>
                Open Match Dispatcher
              </Button>
            </div>
          ) : (
            liveMatches.map(m => (
              <div key={m.id} style={S.matchCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#8b949e', marginBottom: '12px' }}>
                  <span>{m.courtName || 'Unassigned'} • Pool {m.category}</span>
                  <Badge variant={m.status === 'IN_PROGRESS' ? 'success' : 'default'}>{m.status}</Badge>
                </div>
                
                {/* Team A Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{m.teamA.franchiseName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {m.status === 'IN_PROGRESS' && (
                      <button 
                        style={{ padding: '2px 8px', background: 'rgba(63,185,80,0.15)', border: '1px solid #3fb950', color: '#3fb950', cursor: 'pointer', borderRadius: '4px', fontSize: '0.75rem' }}
                        onClick={() => handleScorePoint(m.id, true)}
                      >
                        +1 Game
                      </button>
                    )}
                    <span style={S.scoreBox}>{getScoreValue(m.scoreState, true)}</span>
                  </div>
                </div>

                {/* Team B Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{m.teamB.franchiseName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {m.status === 'IN_PROGRESS' && (
                      <button 
                        style={{ padding: '2px 8px', background: 'rgba(63,185,80,0.15)', border: '1px solid #3fb950', color: '#3fb950', cursor: 'pointer', borderRadius: '4px', fontSize: '0.75rem' }}
                        onClick={() => handleScorePoint(m.id, false)}
                      >
                        +1 Game
                      </button>
                    )}
                    <span style={S.scoreBox}>{getScoreValue(m.scoreState, false)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </Card>

        <Card style={S.card}>
          <h3 style={S.h3}>Pool Stages Completion</h3>
          <div style={S.progressTrack}>
            <div style={S.progressBar(completionPercentage)} />
          </div>
          <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: 0 }}>
            {completionPercentage}% of matches completed ({completedMatches.length} of {totalMatchesCount} total matches).
          </p>
        </Card>
      </div>

      <div>
        <Card style={S.card}>
          <h3 style={S.h3}>Action Center</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tournament.globalState === 'SUSPENDED' ? (
              <Button 
                variant="success" 
                onClick={() => updateTournament({ globalState: 'NORMAL' })}
              >
                Resume Tournament
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                onClick={() => updateTournament({ globalState: 'SUSPENDED' })}
              >
                Pause Tournament
              </Button>
            )}

            <Button 
              variant="danger" 
              onClick={() => {
                updateTournament({ status: 'COMPLETED' });
                alert('Tournament completed successfully!');
              }}
            >
              Force Complete Event
            </Button>
          </div>
        </Card>

        <Card style={S.card}>
          <h4 style={{ color: '#fff', fontSize: '0.9rem', margin: '0 0 12px', fontWeight: 600 }}>Activity Log</h4>
          <div style={{ fontSize: '0.8rem', color: '#8b949e', lineHeight: 1.6 }}>
            <div>• Dispatcher ready for queues.</div>
            {completedMatches.map(m => (
              <div key={m.id}>• Match completed: {m.teamA.franchiseName} vs {m.teamB.franchiseName}</div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

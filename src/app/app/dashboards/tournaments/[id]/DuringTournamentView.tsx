'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Props {
  tournament: any;
  stats: any;
  updateTournament: (updates: any) => Promise<void>;
  mutate: () => void;
}

export default function DuringTournamentView({ tournament, stats, updateTournament, mutate }: Props) {
  if (!tournament.isActive) {
    return (
      <Card style={{ background: '#161b22', border: '1px dashed rgba(255,255,255,0.2)', padding: '48px', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '8px' }}>Event is not Active</h2>
        <p style={{ color: '#8b949e', marginBottom: '24px' }}>You must launch the tournament in the Pre-Tournament view to begin the event and access live radar telemetry.</p>
      </Card>
    );
  }

  const liveMatches = tournament.matches?.filter((m: any) => m.status === 'IN_PROGRESS' || m.status === 'PENDING' || m.status === 'SCHEDULED') || [];
  const completionPercentage = stats?.completionPercentage || 0;

  const S = {
    grid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' } as React.CSSProperties,
    card: { background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', marginBottom: '24px' } as React.CSSProperties,
    h3: { margin: '0 0 16px', color: '#fff', fontSize: '1.2rem', fontWeight: 700 } as React.CSSProperties,
    matchCard: { background: '#0d1117', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px' } as React.CSSProperties,
    scoreBox: { background: '#21262d', padding: '4px 12px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold', color: '#fff' } as React.CSSProperties,
    progressTrack: { width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', margin: '16px 0 8px' } as React.CSSProperties,
    progressBar: (pct: number) => ({ width: `${pct}%`, height: '100%', background: '#3fb950', transition: 'width 0.4s ease' } as React.CSSProperties),
  };

  const getScoreValue = (scoreState: string, isTeamA: boolean) => {
    try {
      const parsed = JSON.parse(scoreState || '{}');
      if (isTeamA) {
        return `${parsed.setsA || 0} Sets (${parsed.gamesA || 0} Games)`;
      } else {
        return `${parsed.setsB || 0} Sets (${parsed.gamesB || 0} Games)`;
      }
    } catch {
      return '0';
    }
  };

  return (
    <div style={S.grid}>
      <div>
        <Card style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={S.h3}>Live Event Radar</h3>
            <Badge variant="success">LIVE TELEMETRY ACTIVE</Badge>
          </div>
          <p style={{ color: '#8b949e', marginBottom: '24px', lineHeight: 1.6 }}>Monitor match progression in real-time. Referees and Umpires are updating scores simultaneously.</p>

          {liveMatches.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', background: '#0d1117', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <p style={{ color: '#8b949e', margin: '0 0 16px' }}>No matches are currently active or pending queue.</p>
              <Button variant="primary" onClick={() => window.location.href = `/app/dashboards/tournaments/${tournament.id}/dispatcher`}>
                Open Match Dispatcher
              </Button>
            </div>
          ) : (
            liveMatches.map((match: any) => (
              <div key={match.id} style={S.matchCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#8b949e', marginBottom: '12px' }}>
                  <span>{match.court?.name || 'Unassigned Court'} • {match.stage}</span>
                  <Badge variant={match.status === 'IN_PROGRESS' ? 'success' : 'default'}>{match.status}</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{match.teamA?.franchiseName || 'Team A'}</span>
                  {match.status === 'IN_PROGRESS' && (
                    <span style={S.scoreBox}>{getScoreValue(match.scoreState, true)}</span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{match.teamB?.franchiseName || 'Team B'}</span>
                  {match.status === 'IN_PROGRESS' && (
                    <span style={S.scoreBox}>{getScoreValue(match.scoreState, false)}</span>
                  )}
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
          <p style={{ color: '#8b949e', fontSize: '0.9rem', margin: 0 }}>{completionPercentage}% of matches completed ({stats?.completedMatches} of {stats?.totalMatches} total matches).</p>
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
                Resume Event
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                onClick={() => updateTournament({ globalState: 'SUSPENDED' })}
              >
                Pause Event (Emergency)
              </Button>
            )}

            <Button 
              variant="secondary" 
              onClick={() => window.location.href = `/app/dashboards/tournaments/${tournament.id}/operations`}
            >
              Court Telemetry & Ops
            </Button>

            <Button 
              variant="danger" 
              onClick={async () => {
                const conf = window.confirm("Are you sure you want to complete this tournament? This will end the live event radar and move the tournament to Post-Tournament reporting.");
                if (conf) {
                  await updateTournament({ isActive: false, lifecyclePhase: 'POST_TOURNAMENT' });
                }
              }}
            >
              Conclude Tournament (Move to Post-Event) →
            </Button>
          </div>
        </Card>

        <Card style={{ ...S.card, padding: '16px' }}>
          <h4 style={{ color: '#fff', fontSize: '0.9rem', margin: '0 0 12px', fontWeight: 600 }}>Active Status</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#8b949e' }}>
            <div>• Global State: <span style={{ color: tournament.globalState === 'SUSPENDED' ? '#ef4444' : '#3fb950', fontWeight: 'bold' }}>{tournament.globalState}</span></div>
            <div>• Court Count: <span style={{ color: '#fff' }}>{tournament.courts?.length || 0}</span></div>
            <div>• Registered Teams: <span style={{ color: '#fff' }}>{tournament.teams?.length || 0}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AgentChat } from '@/components/AgentChat';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function TeamDashboard() {
  const { data, error, isLoading } = useSWR('/api/player/dashboard', fetcher);

  if (isLoading) return <div style={{ padding: '48px', color: '#8b949e' }}>Loading Walled Garden...</div>;
  if (error || !data?.success) return <div style={{ padding: '48px', color: '#f85149' }}>Failed to load profile. Are you logged in?</div>;

  const { user, team, schedule } = data;

  return (
    <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>Player Profile</h1>
        <p style={{ color: '#8b949e', marginTop: '8px', fontSize: '1.1rem' }}>Welcome back, {user.name}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        {/* Left Col: Gamification & Team */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Gamification Status</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#7ee787' }}>{user.globalXp}</span>
              <span style={{ color: '#8b949e', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 700 }}>Global XP</span>
            </div>
            
            <h3 style={{ fontSize: '0.9rem', color: '#8b949e', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700 }}>Earned Badges</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {user.badges.map((badge: string, i: number) => (
                <Badge key={i} variant={i % 2 === 0 ? 'accent' : 'warning'}>{badge}</Badge>
              ))}
              {user.badges.length === 0 && <span style={{ color: '#484f58', fontSize: '0.9rem' }}>No badges yet.</span>}
            </div>
          </Card>

          <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Active Franchise</h2>
            {team ? (
              <>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 4px 0', color: '#58a6ff' }}>{team.franchiseName}</p>
                <p style={{ color: '#8b949e', fontSize: '0.9rem', margin: 0 }}>Registered for: {team.tournamentName}</p>
              </>
            ) : (
              <p style={{ color: '#8b949e' }}>You are not registered to any active teams.</p>
            )}
          </Card>

          <Card style={{ background: '#161b22', border: '1px solid #d2a8ff', padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', color: '#d2a8ff' }}>Premium Upgrades</h2>
            <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.5 }}>
              Unlock high-resolution camera angles and deep match telemetry data for your portfolio.
            </p>
            <Button 
              variant="primary" 
              onClick={async () => {
                await fetch('/api/upsell', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ itemName: 'High-Res Telemetry', quantity: 1 })
                });
                alert('Mock Upsell Complete! Ledgers updated.');
              }}
              style={{ width: '100%', background: '#d2a8ff', color: '#000' }}
            >
              Purchase Telemetry ($50.00)
            </Button>
          </Card>
        </div>

        {/* Right Col: Match Schedule & Agent OS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Your Schedule</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {schedule.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '12px', color: '#8b949e' }}>
                  No matches scheduled yet.
                </div>
              )}
              {schedule.map((match: any) => (
                <Card key={match.id} style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      {match.status === 'IN_PROGRESS' && <Badge variant="warning">LIVE</Badge>}
                      {match.status === 'COMPLETED' && <Badge variant="success">FINAL</Badge>}
                      {match.status === 'SCHEDULED' && <Badge variant="accent">UPCOMING</Badge>}
                      {match.court && <span style={{ fontSize: '0.85rem', color: '#8b949e' }}>• {match.court.name}</span>}
                    </div>
                    <div style={{ fontSize: '1.2rem' }}>
                      <span style={{ color: '#8b949e' }}>vs</span> <strong style={{ fontWeight: 700 }}>{match.opponent}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {(match.status === 'IN_PROGRESS' || match.status === 'COMPLETED') && (
                      <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, color: match.status === 'COMPLETED' ? '#7ee787' : '#58a6ff' }}>
                        {JSON.parse(match.scoreState).setsA} - {JSON.parse(match.scoreState).setsB}
                      </div>
                    )}
                    {match.status === 'SCHEDULED' && (
                      <Button variant="secondary" size="sm">View Details</Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Agent OS</h2>
            <AgentChat playerId={user.id} tournamentId={team?.tournamentId || ''} />
          </div>
        </div>
      </div>
    </div>
  );
}

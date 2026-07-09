'use client';
import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function RefereeHub() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR('/api/referee/hub', fetcher);

  if (isLoading) return <div style={{ padding: '24px', color: '#8b949e' }}>Loading Referee Hub...</div>;
  if (error || !data?.success) return <div style={{ padding: '24px', color: '#f85149' }}>Failed to load assignments.</div>;

  const tournaments = data.tournaments || [];

  return (
    <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: '#58a6ff' }}>Referee Hub</h1>
        <p style={{ color: '#8b949e', margin: 0 }}>Select an active match below to enter the Scoring Arena.</p>
      </header>

      {tournaments.length === 0 ? (
        <Card style={{ background: '#161b22', padding: '32px', textAlign: 'center' }}>
          <p style={{ color: '#8b949e' }}>You are not currently assigned to any active tournaments.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {tournaments.map((tournament: any) => (
            <div key={tournament.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{tournament.name}</h2>
                <Link href={`/tournaments/${tournament.id}`}>
                  <Button variant="outline" size="sm">
                    Open Command Center →
                  </Button>
                </Link>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tournament.courts.length === 0 ? (
                  <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>No courts assigned.</p>
                ) : (
                  tournament.courts.map((court: any) => (
                    <Card key={court.id} style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px' }}>
                      <h3 style={{ margin: '0 0 16px', color: '#fff' }}>{court.name} <Badge variant="secondary">Assigned</Badge></h3>
                      
                      {court.matches.length === 0 ? (
                        <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>No matches currently queued on this court.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {court.matches.map((match: any) => (
                            <div key={match.id} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              background: '#0d1117',
                              padding: '16px',
                              borderRadius: '6px',
                              border: match.status === 'IN_PROGRESS' ? '1px solid #d2a8ff' : '1px solid rgba(255,255,255,0.1)'
                            }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase' }}>{match.stage} Match</span>
                                  {match.status === 'IN_PROGRESS' && <Badge variant="primary">LIVE</Badge>}
                                  {match.status === 'SCHEDULED' && <Badge variant="secondary">UPCOMING</Badge>}
                                  {match.status === 'REQUIRES_INTERVENTION' && <Badge variant="destructive">PAUSED</Badge>}
                                </div>
                                <div style={{ color: '#fff', fontSize: '1.1rem' }}>
                                  {match.teamA?.franchiseName || match.placeholderA || 'TBD'} vs {match.teamB?.franchiseName || match.placeholderB || 'TBD'}
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {(match.status === 'IN_PROGRESS' || match.status === 'SCHEDULED') && (
                                  <>
                                    <Button 
                                      variant={match.status === 'IN_PROGRESS' ? 'primary' : 'secondary'}
                                      onClick={() => router.push(`/referee/matches/${match.tournamentId}/${match.id}`)}
                                    >
                                      Score Match
                                    </Button>
                                    {!match.umpireCode ? (
                                      <Button 
                                        variant="outline"
                                        style={{ borderColor: '#d2a8ff', color: '#d2a8ff' }}
                                        onClick={async () => {
                                          const res = await fetch(`/api/referee/matches/${match.id}/umpire-pin`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ action: 'GENERATE' })
                                          });
                                          const data = await res.json();
                                          if (data.success) {
                                            alert(`Umpire PIN generated: ${data.pin}\n\nGive this PIN to the player. They can claim the match from their dashboard.`);
                                            // The SWR polling will refresh the data automatically
                                          } else {
                                            alert(data.error || 'Failed to generate PIN');
                                          }
                                        }}
                                      >
                                        Assign Player Ump
                                      </Button>
                                    ) : (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #d2a8ff', padding: '4px 12px', borderRadius: '6px', background: 'rgba(210,168,255,0.1)' }}>
                                        <span style={{ color: '#d2a8ff', fontSize: '0.85rem' }}>PIN: <strong>{match.umpireCode}</strong></span>
                                        <button 
                                          style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '0.8rem' }}
                                          onClick={async () => {
                                            await fetch(`/api/referee/matches/${match.id}/umpire-pin`, {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ action: 'REVOKE' })
                                            });
                                          }}
                                        >
                                          Revoke
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

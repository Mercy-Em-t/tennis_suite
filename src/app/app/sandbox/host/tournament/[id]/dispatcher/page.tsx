'use client';

import React, { useState, use } from 'react';
import { useSandboxTournaments, SandboxMatch, TournamentSandboxData, SandboxPool } from '../../../useSandboxState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const mockCourts = [
  { id: 'ct-1', name: 'Court 1' },
  { id: 'ct-2', name: 'Court 2' },
  { id: 'ct-3', name: 'Court 3' },
  { id: 'ct-4', name: 'Court 4' }
];

export default function SandboxMatchDispatcher({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { tournaments, updateTournament, loaded } = useSandboxTournaments();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!loaded) return <div style={{ padding: '48px', color: '#8b949e', background: '#0d1117', minHeight: '100vh' }}>Loading Match Dispatcher...</div>;

  const tournament = tournaments.find((t: TournamentSandboxData) => t.id === resolvedParams.id);
  if (!tournament) return <div style={{ padding: '48px', color: '#f85149', background: '#0d1117', minHeight: '100vh' }}>Tournament not found</div>;

  // Gatekeeping
  if (!tournament.poolsPublished) {
    return (
      <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Pools Not Published</h2>
        <p style={{ color: '#8b949e', marginBottom: '24px' }}>You must generate and publish pools in the Pools Workspace before scheduling match queues.</p>
        <Button variant="secondary" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const allCategories = Array.from(new Set((tournament.matches || []).map((m: SandboxMatch) => m.category))) as string[];
  const categories = ['All', ...allCategories];

  const handleGenerateMatches = () => {
    // Generate Round Robin matches for all pools
    const generated: SandboxMatch[] = [];
    let matchIdCounter = 1;

    (tournament.pools || []).forEach((pool: SandboxPool) => {
      const poolTeams = pool.poolTeams.map((pt: any) => pt.team);
      // Pairwise combinations
      for (let i = 0; i < poolTeams.length; i++) {
        for (let j = i + 1; j < poolTeams.length; j++) {
          generated.push({
            id: `mt-sandbox-${matchIdCounter++}`,
            courtId: null,
            courtName: null,
            stage: 'POOL',
            category: pool.category,
            status: 'PENDING',
            teamA: poolTeams[i],
            teamB: poolTeams[j],
            scoreState: '{"setsA":0,"setsB":0,"gamesA":0,"gamesB":0}',
            durationSec: 0
          });
        }
      }
    });

    if (generated.length === 0) {
      alert('No teams or pools found. Please ensure you have generated pools with teams first.');
      return;
    }

    updateTournament(tournament.id, { matches: generated });
    alert(`Successfully generated ${generated.length} round-robin matches!`);
  };

  const handleAssignCourt = (matchId: string, courtId: string | null) => {
    const court = mockCourts.find(c => c.id === courtId);
    const nextMatches = (tournament.matches || []).map((m: SandboxMatch) => {
      if (m.id === matchId) {
        return {
          ...m,
          courtId,
          courtName: court ? court.name : null,
          status: courtId ? ('IN_PROGRESS' as const) : ('PENDING' as const)
        };
      }
      return m;
    });
    updateTournament(tournament.id, { matches: nextMatches });
  };

  const handlePublishSchedule = () => {
    updateTournament(tournament.id, { 
      schedulePublished: true,
      status: 'ACTIVE' 
    });
    alert('Match schedule published and tournament event set to ACTIVE!');
  };

  const filteredMatches = (tournament.matches || []).filter((m: SandboxMatch) => selectedCategory === 'All' || m.category === selectedCategory);
  const readyQueue = filteredMatches.filter((m: SandboxMatch) => !m.courtId);

  const S = {
    page: { padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' } as React.CSSProperties,
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' } as React.CSSProperties,
    title: { fontSize: '2rem', fontWeight: 900, margin: 0, color: '#fff' } as React.CSSProperties,
    grid: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '32px' } as React.CSSProperties,
    matchCard: { background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', borderRadius: '8px', marginBottom: '12px' } as React.CSSProperties,
    courtRow: { background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', padding: '24px', borderRadius: '8px', marginBottom: '16px' } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div>
          <Button variant="secondary" onClick={() => window.history.back()} style={{ marginBottom: '16px' }}>
            ← Back to Command Center
          </Button>
          <h1 style={S.title}>Match Dispatcher (Sandbox)</h1>
          <p style={{ color: '#8b949e', margin: 0 }}>Assign generated match events to physical courts to start active score telemetry.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={handleGenerateMatches}>
            Generate Pool Matches
          </Button>
          <Button variant="success" onClick={handlePublishSchedule} disabled={tournament.matches?.length === 0}>
            Publish Schedule & Start Event
          </Button>
        </div>
      </header>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {categories.map((cat: string) => (
          <Button 
            key={cat} 
            variant={selectedCategory === cat ? 'primary' : 'secondary'}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {tournament.matches?.length === 0 ? (
        <Card style={{ background: '#161b22', padding: '48px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#fff' }}>No matches generated yet</h3>
          <p style={{ color: '#8b949e', marginBottom: '24px' }}>
            Click "Generate Pool Matches" to automatically construct a round-robin schedule based on your pool configurations.
          </p>
          <Button variant="success" onClick={handleGenerateMatches}>
            Generate Pool Matches
          </Button>
        </Card>
      ) : (
        <div style={S.grid}>
          {/* Left Column: Ready Queue */}
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#58a6ff', fontWeight: 700 }}>Ready Queue</h2>
            <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', paddingRight: '8px' }}>
              {readyQueue.map((m: SandboxMatch) => (
                <div key={m.id} style={S.matchCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8b949e', marginBottom: '8px' }}>
                    <span>{m.category} Division</span>
                    <Badge variant="default">{m.status}</Badge>
                  </div>
                  <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '12px' }}>
                    <strong>{m.teamA.franchiseName}</strong> vs <strong>{m.teamB.franchiseName}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select 
                      style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', flex: 1 }}
                      defaultValue=""
                      onChange={e => handleAssignCourt(m.id, e.target.value)}
                    >
                      <option value="" disabled>Assign Court...</option>
                      {mockCourts.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {readyQueue.length === 0 && (
                <div style={{ color: '#8b949e', fontSize: '0.9rem', textAlign: 'center', padding: '24px' }}>
                  No matches in ready queue.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Courts */}
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#fff', fontWeight: 700 }}>Active Courts</h2>
            <div>
              {mockCourts.map(court => {
                const courtMatches = filteredMatches.filter((m: SandboxMatch) => m.courtId === court.id);
                return (
                  <div key={court.id} style={S.courtRow}>
                    <h3 style={{ color: '#fff', fontSize: '1.05rem', margin: '0 0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px', fontWeight: 600 }}>
                      {court.name}
                    </h3>
                    
                    <div>
                      {courtMatches.map((m: SandboxMatch) => (
                        <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d1117', padding: '12px 18px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#8b949e', display: 'block', marginBottom: '4px' }}>{m.category} • {m.stage} Match</span>
                            <span style={{ color: '#fff', fontWeight: 500 }}>{m.teamA.franchiseName} vs {m.teamB.franchiseName}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Badge variant={m.status === 'IN_PROGRESS' ? 'success' : 'default'}>{m.status}</Badge>
                            <Button variant="danger" size="sm" onClick={() => handleAssignCourt(m.id, null)}>
                              Unassign
                            </Button>
                          </div>
                        </div>
                      ))}
                      {courtMatches.length === 0 && (
                        <div style={{ color: '#8b949e', fontSize: '0.85rem', padding: '12px 0' }}>
                          Court is currently vacant. Assign a match from the ready queue to dispatch.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

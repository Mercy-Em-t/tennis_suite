'use client';

import React, { useState, use } from 'react';
import { useSandboxTournaments, SandboxPool, SandboxTeam, TournamentSandboxData } from '../../../useSandboxState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function SandboxPoolsWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { tournaments, updateTournament, loaded } = useSandboxTournaments();
  const [selectedCategory, setSelectedCategory] = useState<string>('Open');

  if (!loaded) return <div style={{ padding: '48px', color: '#8b949e', background: '#0d1117', minHeight: '100vh' }}>Loading Pools Workspace...</div>;

  const tournament = tournaments.find((t: TournamentSandboxData) => t.id === resolvedParams.id);
  if (!tournament) return <div style={{ padding: '48px', color: '#f85149', background: '#0d1117', minHeight: '100vh' }}>Tournament not found</div>;

  // Gatekeeping
  if (tournament.registrationPhase !== 'CLOSED') {
    return (
      <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Registration is still Open</h2>
        <p style={{ color: '#8b949e', marginBottom: '24px' }}>You must close main registrations in the Pre-Tournament dashboard before entering the Pools Workspace.</p>
        <Button variant="secondary" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const getTeamCategoryList = (team: SandboxTeam): string[] => {
    try {
      return JSON.parse(team.categories || '["Open"]');
    } catch {
      return ['Open'];
    }
  };

  // Get categories from actual registered teams
  const allCategories = Array.from(new Set(
    (tournament.teams || []).flatMap((t: SandboxTeam) => getTeamCategoryList(t))
  )) as string[];
  if (allCategories.length === 0) allCategories.push('Open');

  const visiblePools = (tournament.pools || []).filter((p: SandboxPool) => p.category === selectedCategory);

  const handleGeneratePools = () => {
    const categoryTeams = (tournament.teams || []).filter((t: SandboxTeam) => getTeamCategoryList(t).includes(selectedCategory));
    
    if (categoryTeams.length === 0) {
      alert(`No registered teams found in category: ${selectedCategory}. Simulating registration first is recommended.`);
      return;
    }

    // Serpentine Distribution Algorithm
    const poolATeams: any[] = [];
    const poolBTeams: any[] = [];
    
    // Sort categoryTeams (can assume standard register order for sandbox)
    categoryTeams.forEach((team: SandboxTeam, index: number) => {
      // Serpentine sequence:
      // Index 0 (seed 1) -> A
      // Index 1 (seed 2) -> B
      // Index 2 (seed 3) -> B
      // Index 3 (seed 4) -> A
      // Index 4 (seed 5) -> A
      // Index 5 (seed 6) -> B
      // Index 6 (seed 7) -> B
      // Index 7 (seed 8) -> A
      const remainder = index % 4;
      if (remainder === 0 || remainder === 3) {
        poolATeams.push({
          id: `pt-${team.id}-a`,
          seed: poolATeams.length + 1,
          team
        });
      } else {
        poolBTeams.push({
          id: `pt-${team.id}-b`,
          seed: poolBTeams.length + 1,
          team
        });
      }
    });

    const newPools: SandboxPool[] = [
      ...(tournament.pools || []).filter((p: SandboxPool) => p.category !== selectedCategory),
      {
        id: `pl-${tournament.id}-a-${selectedCategory}`,
        name: 'Pool A',
        category: selectedCategory,
        versionId: 'v1.0',
        poolTeams: poolATeams
      },
      {
        id: `pl-${tournament.id}-b-${selectedCategory}`,
        name: 'Pool B',
        category: selectedCategory,
        versionId: 'v1.0',
        poolTeams: poolBTeams
      }
    ];

    updateTournament(tournament.id, { pools: newPools });
  };

  const handleMoveTeam = (teamId: string, sourcePoolId: string, targetPoolId: string) => {
    const nextPools = (tournament.pools || []).map((p: SandboxPool) => {
      if (p.id === sourcePoolId) {
        const remaining = p.poolTeams.filter((pt: any) => pt.team.id !== teamId);
        // reseed
        const reseeded = remaining.map((pt: any, idx: number) => ({ ...pt, seed: idx + 1 }));
        return { ...p, poolTeams: reseeded, versionId: `v${(parseFloat(p.versionId.replace('v', '')) + 0.1).toFixed(1)}` };
      }
      if (p.id === targetPoolId) {
        const sourcePool = (tournament.pools || []).find((src: SandboxPool) => src.id === sourcePoolId);
        const movingTeam = sourcePool?.poolTeams.find((pt: any) => pt.team.id === teamId);
        if (!movingTeam) return p;
        const newTeams = [...p.poolTeams, { ...movingTeam, seed: p.poolTeams.length + 1 }];
        return { ...p, poolTeams: newTeams, versionId: `v${(parseFloat(p.versionId.replace('v', '')) + 0.1).toFixed(1)}` };
      }
      return p;
    });

    updateTournament(tournament.id, { pools: nextPools });
  };

  const handlePublish = () => {
    updateTournament(tournament.id, { poolsPublished: true });
    alert('Pools structure successfully published!');
  };

  const S = {
    page: { padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' } as React.CSSProperties,
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' } as React.CSSProperties,
    title: { fontSize: '2rem', fontWeight: 900, margin: 0, color: '#fff' } as React.CSSProperties,
    poolGrid: { display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '24px' } as React.CSSProperties,
    poolCard: { background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', width: '320px', minHeight: '300px' } as React.CSSProperties,
    teamRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d1117', padding: '10px 14px', borderRadius: '6px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div>
          <Button variant="secondary" onClick={() => window.history.back()} style={{ marginBottom: '16px' }}>
            ← Back to Command Center
          </Button>
          <h1 style={S.title}>Pools Workspace (Sandbox)</h1>
          <p style={{ color: '#8b949e', margin: 0 }}>Review seeding. Leverage the Serpentine Algorithm to automatically generate pool boards.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={() => alert('CSV Export triggered!')}>Export CSV</Button>
          <Button variant="secondary" onClick={() => alert('PDF Export triggered!')}>Export PDF</Button>
          <Button variant="success" onClick={handlePublish} disabled={visiblePools.length === 0}>
            Publish Pools
          </Button>
        </div>
      </header>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        {allCategories.map(cat => (
          <Button 
            key={cat} 
            variant={selectedCategory === cat ? 'primary' : 'secondary'}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {visiblePools.length === 0 ? (
        <Card style={{ background: '#161b22', padding: '48px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#fff' }}>No pools generated for {selectedCategory}</h3>
          <p style={{ color: '#8b949e', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
            Generate pools for <strong>{selectedCategory}</strong> using a Serpentine seeding layout.
          </p>
          <Button variant="success" onClick={handleGeneratePools}>
            Auto-Generate Pools
          </Button>
        </Card>
      ) : (
        <div style={S.poolGrid}>
          {visiblePools.map((pool: SandboxPool) => {
            const siblingPool = visiblePools.find((p: SandboxPool) => p.id !== pool.id);
            return (
              <Card key={pool.id} style={S.poolCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                  <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>{pool.name}</h4>
                  <Badge variant="default">{pool.versionId}</Badge>
                </div>
                
                <div>
                  {pool.poolTeams.map((pt: any) => (
                    <div key={pt.id} style={S.teamRow}>
                      <div>
                        <span style={{ color: '#58a6ff', fontWeight: 'bold', marginRight: '8px' }}>#{pt.seed}</span>
                        <span style={{ color: '#fff', fontSize: '0.9rem' }}>{pt.team.franchiseName}</span>
                      </div>
                      
                      {siblingPool && (
                        <button 
                          style={{ background: 'rgba(88,166,255,0.1)', border: '1px solid rgba(88,166,255,0.2)', color: '#58a6ff', cursor: 'pointer', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}
                          onClick={() => handleMoveTeam(pt.team.id, pool.id, siblingPool.id)}
                        >
                          Move →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

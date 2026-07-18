'use client';

import React, { useState, use } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function MatchOverrideWorkspace({ params }: { params: Promise<{ id: string, matchId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const { data, error, isLoading } = useSWR(`/api/tournaments/${resolvedParams.id}`, fetcher);
  const [submitting, setSubmitting] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  if (isLoading) return <div style={{ padding: '24px', color: '#8b949e' }}>Loading Override Workspace...</div>;
  if (error || !data?.success) return <div style={{ padding: '24px', color: '#f85149' }}>Failed to load tournament data.</div>;

  const match = data.tournament.matches.find((m: any) => m.id === resolvedParams.matchId);
  if (!match) return <div style={{ padding: '24px', color: '#f85149' }}>Match not found.</div>;

  const teamA = match.teamA;
  const teamB = match.teamB;
  let withdrawnTeam = null;

  if (teamA && teamA.status === 'WITHDRAWN') withdrawnTeam = teamA;
  else if (teamB && teamB.status === 'WITHDRAWN') withdrawnTeam = teamB;

  if (!withdrawnTeam) {
    return (
      <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh' }}>
        <h2>No Withdrawals Detected</h2>
        <p>This match is marked for intervention but neither team has a WITHDRAWN status.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  let eligibleReplacements: any[] = [];
  const tournament = data.tournament;
  let sourcePool = null;

  for (const pool of tournament.pools) {
    if (pool.poolTeams.some((pt: any) => pt.teamId === withdrawnTeam.id)) {
      sourcePool = pool;
      break;
    }
  }

  if (sourcePool) {
    const poolTeams = sourcePool.poolTeams.filter((pt: any) => pt.team.status !== 'WITHDRAWN');
    const advancedTeamIds = new Set(
      tournament.matches
        .filter((m: any) => m.stage === 'KNOCKOUTS' || m.stage === 'SEMI' || m.stage === 'FINAL')
        .flatMap((m: any) => [m.teamAId, m.teamBId])
        .filter(Boolean)
    );

    eligibleReplacements = poolTeams.filter((pt: any) => !advancedTeamIds.has(pt.teamId));
    
    // Sort logic: use seed if available, otherwise fallback to stats
    eligibleReplacements.sort((a, b) => {
      if (a.seed !== null && b.seed !== null) return a.seed - b.seed;
      // Dummy stats logic for MVP sorting
      return -1; 
    });
  }

  const recommendedCandidate = eligibleReplacements.length > 0 ? eligibleReplacements[0] : null;
  const alternativeCandidates = eligibleReplacements.slice(1);

  const handleOverride = async (replacementTeamId: string) => {
    if (!confirm("Are you sure you want to substitute this team into the knockout bracket? This will lift the intervention lock.")) return;

    setSubmitting(true);
    const res = await fetch(`/api/tournaments/${resolvedParams.id}/matches/${match.id}/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replacementTeamId, originalTeamId: withdrawnTeam.id })
    });

    const d = await res.json();
    setSubmitting(false);

    if (d.success) {
      alert("Substitution applied successfully.");
      router.push(`/app/dashboards/tournaments/${resolvedParams.id}/dispatcher`);
    } else {
      alert(`Error: ${d.error}`);
    }
  };

  return (
    <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: '#f85149' }}>Exception Management</h1>
        <p style={{ color: '#8b949e', margin: 0 }}>Tournament progression paused due to player withdrawal.</p>
      </header>

      <Card style={{ background: '#3b1c1c', border: '1px solid #f85149', padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', margin: '0 0 16px', color: '#ff7b72' }}>Intervention Required</h3>
        <p><strong>{withdrawnTeam.franchiseName}</strong> has been marked as WITHDRAWN, triggering an automatic pause on this {match.stage} match.</p>
        <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>Reason: {match.interventionReason}</p>
      </Card>

      {recommendedCandidate ? (
        <>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Recommended Replacement</h2>
          <Card style={{ background: '#161b22', border: '2px solid #58a6ff', padding: '32px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Badge variant="default">Next Highest Ranked</Badge>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.5rem' }}>{recommendedCandidate.team.franchiseName}</h3>
              <p style={{ margin: 0, color: '#8b949e' }}>Source: {sourcePool?.name} • Seed: {recommendedCandidate.seed || 'Unseeded'}</p>
            </div>
            <Button 
              onClick={() => handleOverride(recommendedCandidate.teamId)}
              disabled={submitting}
              style={{ padding: '16px 32px', fontSize: '1.2rem', background: '#58a6ff', color: '#000', fontWeight: 'bold' }}
            >
              Approve Replacement
            </Button>
          </Card>

          {alternativeCandidates.length > 0 && (
            <div style={{ marginBottom: '48px' }}>
              <Button 
                variant="secondary" 
                onClick={() => setShowAlternatives(!showAlternatives)}
                style={{ marginBottom: '24px' }}
              >
                {showAlternatives ? 'Hide Alternatives' : 'Explore Alternatives'}
              </Button>

              {showAlternatives && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  {alternativeCandidates.map((pt: any) => (
                    <Card key={pt.teamId} style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px' }}>{pt.team.franchiseName}</h4>
                        <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>Seed: {pt.seed || 'Unseeded'}</span>
                      </div>
                      <Button variant="secondary" onClick={() => handleOverride(pt.teamId)} disabled={submitting}>
                        Select
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <Card style={{ background: '#161b22', padding: '24px', textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ color: '#8b949e' }}>No eligible replacements found in the source pool.</p>
        </Card>
      )}

      <Button variant="secondary" onClick={() => router.back()}>Cancel & Return to Dispatcher</Button>

    </div>
  );
}

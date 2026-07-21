'use client';

import React, { useState, use } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function MatchScoringMVP({ params }: { params: Promise<{ id: string, matchId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  // We use the main tournament fetcher and filter for our match to ensure we get hydrated team data
  const { data, error, isLoading } = useSWR(`/api/tournaments/${resolvedParams.id}`, fetcher);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return <div style={{ padding: '24px', color: '#8b949e' }}>Loading Scoring Interface...</div>;
  if (error || !data?.success) return <div style={{ padding: '24px', color: '#f85149' }}>Failed to load match data.</div>;

  const match = data.tournament.matches.find((m: any) => m.id === resolvedParams.matchId);
  if (!match) return <div style={{ padding: '24px', color: '#f85149' }}>Match not found.</div>;

  const getTeamName = (teamId: string | null, placeholder: string | null, m: any) => {
    if (teamId) {
      if (m.teamAId === teamId && m.teamA) return m.teamA.franchiseName;
      if (m.teamBId === teamId && m.teamB) return m.teamB.franchiseName;
      return "TBD";
    }
    return placeholder || "TBD";
  };

  const nameA = getTeamName(match.teamAId, match.placeholderA, match);
  const nameB = getTeamName(match.teamBId, match.placeholderB, match);

  const handleCompleteMatch = async (winnerId: string | null, scoreStateOverride?: any, forceStatus?: string) => {
    if (!winnerId && !forceStatus) {
      alert("You must select a winner before completing the match.");
      return;
    }
    
    if (winnerId && !forceStatus) {
      if (!confirm(`Are you sure you want to mark ${winnerId === match.teamAId ? nameA : nameB} as the winner? This will lock the result and may progress the tournament bracket.`)) return;
    } else if (forceStatus === 'CANCELLED') {
      if (!confirm(`Are you sure you want to permanently abandon/cancel this match? Neither team will receive points.`)) return;
    } else if (scoreStateOverride?.walkover) {
      if (!confirm(`Are you sure you want to award a Walkover to ${winnerId === match.teamAId ? nameA : nameB}?`)) return;
    }

    setSubmitting(true);
    const res = await fetch(`/api/tournaments/${resolvedParams.id}/matches/${match.id}/score`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status: forceStatus || 'COMPLETED', 
        winnerId, 
        scoreState: scoreStateOverride || {} 
      })
    });

    const d = await res.json();
    setSubmitting(false);

    if (d.success) {
      alert("Match completed successfully!");
      router.push(`/app/dashboards/tournaments/${resolvedParams.id}/dispatcher`);
    } else {
      alert(`Error: ${d.error}`);
    }
  };

  return (
    <div style={{ padding: '24px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#58a6ff' }}>Referee Terminal</h1>
        <p style={{ color: '#8b949e', margin: 0 }}>Match ID: {match.id}</p>
        <div style={{ marginTop: '8px' }}>
          <Badge variant="default">{match.stage}</Badge>
          <span style={{ marginLeft: '12px', color: '#8b949e' }}>Status: {match.status}</span>
        </div>
      </header>

      <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '32px' }}>Who won the match?</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <Button 
            onClick={() => handleCompleteMatch(match.teamAId)} 
            disabled={submitting || match.status === 'COMPLETED' || !match.teamAId}
            style={{ padding: '32px', fontSize: '1.2rem', background: '#21262d', border: '1px solid #d2a8ff' }}
          >
            {nameA} Won
          </Button>
          
          <Button 
            onClick={() => handleCompleteMatch(match.teamBId)} 
            disabled={submitting || match.status === 'COMPLETED' || !match.teamBId}
            style={{ padding: '32px', fontSize: '1.2rem', background: '#21262d', border: '1px solid #58a6ff' }}
          >
            {nameB} Won
          </Button>
        </div>

        {match.status === 'COMPLETED' && (
          <div style={{ marginTop: '32px', color: '#3fb950', fontWeight: 'bold' }}>
            This match is already completed. Winner ID: {match.winnerId}
            {match.scoreState?.includes('walkover') && " (via Walkover)"}
          </div>
        )}
        
        {match.status === 'CANCELLED' && (
          <div style={{ marginTop: '32px', color: '#8b949e', fontWeight: 'bold' }}>
            This match was abandoned/cancelled.
          </div>
        )}
      </Card>

      <Card style={{ background: '#3b1c1c', border: '1px solid #f85149', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
        <h3 style={{ color: '#ff7b72', margin: '0 0 16px', fontSize: '1.2rem' }}>Exceptions & Overrides</h3>
        <p style={{ color: '#8b949e', marginBottom: '24px', fontSize: '0.9rem' }}>
          Use these options only if the match cannot be played conventionally.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '16px' }}>
          <Button 
            variant="secondary"
            onClick={() => handleCompleteMatch(match.teamAId, { walkover: true, setsA: 2, setsB: 0, gamesA: 12, gamesB: 0 })} 
            disabled={submitting || match.status === 'COMPLETED' || match.status === 'CANCELLED'}
          >
            Award Walkover to {nameA}
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => handleCompleteMatch(match.teamBId, { walkover: true, setsA: 2, setsB: 0, gamesA: 12, gamesB: 0 })} 
            disabled={submitting || match.status === 'COMPLETED' || match.status === 'CANCELLED'}
          >
            Award Walkover to {nameB}
          </Button>
        </div>

        <Button 
          variant="danger"
          style={{ width: '100%' }}
          onClick={() => handleCompleteMatch(null, {}, 'CANCELLED')} 
          disabled={submitting || match.status === 'COMPLETED' || match.status === 'CANCELLED'}
        >
          Abandon Match (No Winner / 0 Points)
        </Button>
      </Card>

      <Button variant="secondary" onClick={() => router.back()}>Return to Dispatcher</Button>

    </div>
  );
}

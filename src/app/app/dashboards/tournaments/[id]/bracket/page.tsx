'use client';

import React, { useState, use } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Trophy, Medal, Grid } from 'lucide-react';
import { motion } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface ScoreState {
  setsA?: number; setsB?: number;
  gamesA?: number; gamesB?: number;
  pointsA?: string; pointsB?: string;
}

const parseScore = (raw: string | any): ScoreState => {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw;
};

const STAGE_ORDER = ['ROUND_OF_16', 'QUARTER', 'SEMI', 'FINAL'];

export default function BracketDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tournamentId = resolvedParams.id;

  const { data, error, isLoading } = useSWR(`/api/tournaments/${tournamentId}/bracket`, fetcher, { refreshInterval: 5000 });
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  React.useEffect(() => {
    if (data?.categories && data.categories.length > 0 && !selectedCategory) {
      setSelectedCategory(data.categories[0]);
    }
  }, [data, selectedCategory]);

  if (isLoading) return <div style={{ padding: '48px', color: '#8b949e', background: '#0d1117', minHeight: '100vh' }}>Loading Results Workspace...</div>;
  if (error || !data?.success) return <div style={{ padding: '48px', color: '#f85149', background: '#0d1117', minHeight: '100vh' }}>Failed to load results.</div>;

  const categories: string[] = data.categories || [];
  
  if (categories.length === 0) {
    return (
      <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <Link href={`/app/dashboards/tournaments/${tournamentId}`} style={{ color: '#58a6ff', textDecoration: 'none', fontSize: '0.875rem' }}>&larr; Back to Command Center</Link>
        <div style={{ marginTop: '48px', textAlign: 'center', color: '#8b949e' }}>No Pools or Brackets generated yet.</div>
      </div>
    );
  }

  // Filter Data
  const pools = (data.pools || []).filter((p: any) => p.category === selectedCategory || !p.category);
  const knockouts = (data.knockouts || []).filter((k: any) => k.category === selectedCategory || !k.category);

  // Group knockouts by stage
  const groupedKnockouts: Record<string, any[]> = {};
  STAGE_ORDER.forEach(stage => {
    const stageMatches = knockouts.filter((k: any) => k.stage === stage);
    if (stageMatches.length > 0) {
      groupedKnockouts[stage] = stageMatches;
    }
  });

  const renderScore = (scoreRaw: any, isWinner: boolean) => {
    const score = parseScore(scoreRaw);
    if (score.setsA === undefined) return <span style={{ color: '#8b949e' }}>-</span>;
    return (
      <span style={{ fontWeight: isWinner ? 800 : 500, color: isWinner ? '#3fb950' : '#c9d1d9' }}>
        {score.setsA}-{score.setsB}
      </span>
    );
  };

  const MatchNode = ({ match }: { match: any }) => {
    const score = parseScore(match.scoreState);
    const winnerId = match.winnerId;
    return (
      <Card style={{ 
        background: '#161b22', 
        border: '1px solid rgba(255,255,255,0.08)',
        width: '260px',
        padding: '0',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {match.status === 'IN_PROGRESS' && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#58a6ff' }} />
        )}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: winnerId === match.teamAId ? 'rgba(63,185,80,0.05)' : 'transparent' }}>
          <span style={{ fontWeight: winnerId === match.teamAId ? 700 : 500, color: winnerId === match.teamAId ? '#fff' : '#c9d1d9', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {match.teamA || 'TBD'}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
            {score.setsA !== undefined ? score.setsA : '-'}
          </span>
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: winnerId === match.teamBId ? 'rgba(63,185,80,0.05)' : 'transparent' }}>
          <span style={{ fontWeight: winnerId === match.teamBId ? 700 : 500, color: winnerId === match.teamBId ? '#fff' : '#c9d1d9', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {match.teamB || 'TBD'}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
            {score.setsB !== undefined ? score.setsB : '-'}
          </span>
        </div>
      </Card>
    );
  };

  return (
    <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '24px', marginBottom: '32px' }}>
        <div>
          <Link href={`/app/dashboards/tournaments/${tournamentId}`} style={{ color: '#58a6ff', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-block', marginBottom: '12px' }}>&larr; Back to Command Center</Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Trophy color="#e3b341" /> Results & Brackets
          </h1>
          <p style={{ color: '#8b949e', margin: '8px 0 0 0' }}>Live standings and knockout progression.</p>
        </div>
      </header>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        {categories.map(cat => (
          <Button 
            key={cat} 
            variant={selectedCategory === cat ? 'primary' : 'secondary'}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Pool Standings */}
      {pools.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Grid size={20} color="#58a6ff" /> Pool Standings
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
            {pools.map((pool: any) => (
              <Card key={pool.id} style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{pool.name}</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#8b949e', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 20px', fontWeight: 600 }}>Team</th>
                      <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'center' }}>W-L</th>
                      <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'center' }}>Set Diff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pool.standings.map((team: any, index: number) => {
                      const w = team.stats?.wins || 0;
                      const l = team.stats?.losses || 0;
                      const sf = team.stats?.setsFor || 0;
                      const sa = team.stats?.setsAgainst || 0;
                      return (
                        <tr key={team.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px 20px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: index < 2 ? '#3fb950' : '#8b949e', fontWeight: 700, width: '16px' }}>{index + 1}</span>
                            {team.name}
                          </td>
                          <td style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 600 }}>{w}-{l}</td>
                          <td style={{ padding: '12px 20px', textAlign: 'center', color: sf - sa > 0 ? '#3fb950' : (sf - sa < 0 ? '#f85149' : '#8b949e') }}>
                            {sf - sa > 0 ? '+' : ''}{sf - sa}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Knockout Bracket */}
      {Object.keys(groupedKnockouts).length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Medal size={20} color="#e3b341" /> Knockout Stage
          </h2>
          <div style={{ display: 'flex', gap: '48px', overflowX: 'auto', paddingBottom: '24px' }}>
            {STAGE_ORDER.map(stage => {
              const matches = groupedKnockouts[stage];
              if (!matches) return null;
              
              let label = stage;
              if (stage === 'ROUND_OF_16') label = 'Round of 16';
              if (stage === 'QUARTER') label = 'Quarterfinals';
              if (stage === 'SEMI') label = 'Semifinals';
              if (stage === 'FINAL') label = 'Final';

              return (
                <div key={stage} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div style={{ color: '#8b949e', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.05em' }}>
                    {label}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: 1, justifyContent: 'space-around' }}>
                    {matches.map(match => (
                      <MatchNode key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

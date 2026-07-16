'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import PreTournamentView from './PreTournamentView';
import DuringTournamentView from './DuringTournamentView';
import PostTournamentView from './PostTournamentView';

const fetcher = (url: string) => fetch(url).then(r => r.json());

type Tab = 'PRE' | 'DURING' | 'POST';

export default function TournamentDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR(`/api/tournaments/${resolvedParams.id}`, fetcher, { refreshInterval: 5000 });
  const [activeTab, setActiveTab] = useState<Tab>('PRE');

  React.useEffect(() => {
    if (data?.tournament) {
      const phase = data.tournament.lifecyclePhase;
      if (phase === 'DURING_TOURNAMENT') setActiveTab('DURING');
      else if (phase === 'POST_TOURNAMENT' || phase === 'ARCHIVED') setActiveTab('POST');
      else setActiveTab('PRE');
    }
  }, [data?.tournament?.lifecyclePhase]);

  const updateTournament = async (updates: any) => {
    try {
      const res = await fetch(`/api/tournaments/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        mutate();
      } else {
        alert('Failed to update tournament settings.');
      }
    } catch (err) {
      alert('A network error occurred while updating tournament.');
    }
  };

  if (isLoading) return <div style={{ padding: '48px', color: '#8b949e', background: '#0d1117', minHeight: '100vh' }}>Loading Command Center...</div>;
  if (error || !data?.success) return <div style={{ padding: '48px', color: '#f85149', background: '#0d1117', minHeight: '100vh' }}>Failed to load tournament data.</div>;

  const { tournament, stats } = data;

  const S = {
    page: { padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' } as React.CSSProperties,
    header: { display: 'flex', flexDirection: 'column', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '24px', marginBottom: '32px' } as React.CSSProperties,
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as React.CSSProperties,
    h1: { fontSize: '2rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '16px', color: '#fff' } as React.CSSProperties,
    nav: { display: 'flex', gap: '2px', background: '#161b22', padding: '4px', borderRadius: '8px', alignSelf: 'flex-start' } as React.CSSProperties,
    tab: (isActive: boolean) => ({
      padding: '8px 24px', 
      borderRadius: '6px', 
      cursor: 'pointer', 
      fontSize: '0.9rem', 
      fontWeight: isActive ? 600 : 500,
      background: isActive ? '#21262d' : 'transparent',
      color: isActive ? '#f0f6fc' : '#8b949e',
      border: 'none',
      outline: 'none'
    }) as React.CSSProperties,
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' } as React.CSSProperties,
    statCard: { background: '#161b22', border: '1px solid rgba(255,255,255,0.07)', padding: '18px 20px' } as React.CSSProperties,
  };

  const fmt = (s: number) => Math.floor(s / 60) + 'm ' + (s % 60) + 's';

  const statCards = [
    { label: 'Completion', value: (stats?.completionPercentage || 0) + '%', color: '#58a6ff' },
    { label: 'Matches', value: (stats?.completedMatches || 0) + ' / ' + (stats?.totalMatches || 0), color: '#3fb950' },
    { label: 'Avg Duration', value: fmt(stats?.avgDurationSec || 0), color: '#d2a8ff' },
    { label: 'Teams', value: String((tournament.teams || []).length), color: '#f5a623' },
  ];

  return (
    <div style={S.page}>
      <Button 
        variant="secondary" 
        onClick={() => router.push('/app/dashboards/host')} 
        style={{ marginBottom: '24px' }}
      >
        ← Back to Dashboard
      </Button>

      <header style={S.header}>
        <div style={S.topRow}>
          <div>
            <h1 style={S.h1}>
              {tournament.name}
              <Badge variant={tournament.isActive ? 'success' : 'warning'}>
                {tournament.isActive ? 'ACTIVE' : 'DRAFT'}
              </Badge>
              {tournament.isArchived && <Badge variant="default">ARCHIVED (READ-ONLY)</Badge>}
            </h1>
            <p style={{ color: '#8b949e', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
              {tournament.location || 'Location TBA'} | ID: <span style={{ fontFamily: 'monospace', color: '#58a6ff' }}>{tournament.id}</span>
            </p>
          </div>
          <Button
            variant="secondary"
            disabled={tournament.isArchived}
            onClick={() => !tournament.isArchived && router.push(`/app/dashboards/tournaments/${resolvedParams.id}/settings`)}
          >
            Tournament Settings
          </Button>
        </div>

        <div style={S.statGrid}>
          {statCards.map((s) => (
            <Card key={s.label} style={S.statCard}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: s.color, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{s.value}</div>
            </Card>
          ))}
        </div>

        <div style={S.nav}>
          <button style={S.tab(activeTab === 'PRE')} onClick={() => setActiveTab('PRE')}>Pre-Tournament</button>
          <button style={S.tab(activeTab === 'DURING')} onClick={() => setActiveTab('DURING')}>During Tournament</button>
          <button style={S.tab(activeTab === 'POST')} onClick={() => setActiveTab('POST')}>Post-Tournament</button>
        </div>
      </header>

      {activeTab === 'PRE' && (
        <PreTournamentView 
          tournament={tournament} 
          stats={stats}
          updateTournament={updateTournament} 
          mutate={mutate}
        />
      )}
      
      {activeTab === 'DURING' && (
        <DuringTournamentView 
          tournament={tournament} 
          stats={stats}
          updateTournament={updateTournament} 
          mutate={mutate}
        />
      )}

      {activeTab === 'POST' && (
        <PostTournamentView 
          tournament={tournament} 
          stats={stats}
          updateTournament={updateTournament} 
          mutate={mutate}
        />
      )}
    </div>
  );
}

'use client';

import React, { useState, use } from 'react';
import { useSandboxTournaments } from '../../useSandboxState';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import PreTournamentView from './PreTournamentView';
import DuringTournamentView from './DuringTournamentView';
import PostTournamentView from './PostTournamentView';

type Tab = 'PRE' | 'DURING' | 'POST';

export default function TournamentInstanceSandbox({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { tournaments, updateTournament, loaded } = useSandboxTournaments();
  const [activeTab, setActiveTab] = useState<Tab>('PRE');

  if (!loaded) return <div style={{ padding: '48px', color: '#8b949e', background: '#0d1117', minHeight: '100vh' }}>Loading...</div>;

  const tournament = tournaments.find(t => t.id === resolvedParams.id);
  if (!tournament) return <div style={{ padding: '48px', color: '#f85149', background: '#0d1117', minHeight: '100vh' }}>Tournament not found</div>;

  const S = {
    page: { padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' } as React.CSSProperties,
    header: { display: 'flex', flexDirection: 'column', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '24px', marginBottom: '32px' } as React.CSSProperties,
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as React.CSSProperties,
    h1: { fontSize: '2rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '16px' } as React.CSSProperties,
    nav: { display: 'flex', gap: '2px', background: '#161b22', padding: '4px', borderRadius: '8px', alignSelf: 'flex-start' } as React.CSSProperties,
    tab: (isActive: boolean) => ({
      padding: '8px 24px', 
      borderRadius: '6px', 
      cursor: 'pointer', 
      fontSize: '0.9rem', 
      fontWeight: isActive ? 600 : 500,
      background: isActive ? '#21262d' : 'transparent',
      color: isActive ? '#f0f6fc' : '#8b949e',
    }) as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <Button variant="secondary" onClick={() => window.location.href = '/sandbox/host'} style={{ marginBottom: '24px', fontSize: '0.8rem' }}>
        ← Back to Dashboard
      </Button>
      
      <header style={S.header}>
        <div style={S.topRow}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 style={S.h1}>
              {tournament.name}
              <Badge variant={tournament.status === 'ACTIVE' ? 'primary' : 'warning'}>{tournament.status}</Badge>
              {tournament.isArchived && <Badge variant="secondary">ARCHIVED (READ-ONLY)</Badge>}
            </h1>
            {tournament.isArchived && <span style={{ color: '#ff7b72', fontSize: '0.85rem' }}>This tournament has been archived. No further modifications are permitted.</span>}
          </div>
          <Button variant="secondary" disabled={tournament.isArchived}>Tournament Settings</Button>
        </div>
        
        <div style={S.nav}>
          <div style={S.tab(activeTab === 'PRE')} onClick={() => setActiveTab('PRE')}>Pre-Tournament</div>
          <div style={S.tab(activeTab === 'DURING')} onClick={() => setActiveTab('DURING')}>During Tournament</div>
          <div style={S.tab(activeTab === 'POST')} onClick={() => setActiveTab('POST')}>Post-Tournament</div>
        </div>
      </header>

      {activeTab === 'PRE' && <PreTournamentView tournament={tournament} updateTournament={(u) => updateTournament(tournament.id, u)} />}
      {activeTab === 'DURING' && <DuringTournamentView tournament={tournament} updateTournament={(u) => updateTournament(tournament.id, u)} />}
      {activeTab === 'POST' && <PostTournamentView tournament={tournament} updateTournament={(u) => updateTournament(tournament.id, u)} />}

    </div>
  );
}

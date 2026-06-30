'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function TournamentDashboard({ params }: { params: { id: string } }) {
  const { data, error, isLoading, mutate } = useSWR(`/api/tournaments/${params.id}`, fetcher, { refreshInterval: 5000 });
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    await fetch(`/api/tournaments/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: true })
    });
    mutate();
    setPublishing(false);
  };

  if (isLoading) return <div style={{ padding: '48px', color: '#8b949e' }}>Loading Tournament Data...</div>;
  if (error || !data?.success) return <div style={{ padding: '48px', color: '#f85149' }}>Failed to load tournament data.</div>;

  const { tournament, stats } = data;
  const magicLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?t=${tournament.id}`;

  return (
    <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>{tournament.name}</h1>
            {tournament.isActive ? <Badge variant="success">LIVE</Badge> : <Badge variant="warning">DRAFT</Badge>}
          </div>
          <p style={{ color: '#8b949e', margin: 0, fontSize: '1.1rem' }}>ID: {tournament.id}</p>
        </div>
        {!tournament.isActive && (
          <Button onClick={handlePublish} variant="success">{publishing ? 'Publishing...' : 'Publish Tournament'}</Button>
        )}
      </header>

      {/* Analytics Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
        <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: '#8b949e', fontSize: '0.875rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Completion Ratio</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{stats.completionPercentage}%</h2>
            <span style={{ color: '#8b949e' }}>({stats.completedMatches} / {stats.totalMatches})</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '16px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${stats.completionPercentage}%`, background: '#7ee787', transition: 'width 1s ease-in-out' }}></div>
          </div>
        </Card>
        
        <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: '#8b949e', fontSize: '0.875rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Average Match Time</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#d2a8ff' }}>
            {Math.floor(stats.avgDurationSec / 60)}m {stats.avgDurationSec % 60}s
          </h2>
        </Card>

        <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: '#8b949e', fontSize: '0.875rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Signups</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{tournament.teams.length}</h2>
            <span style={{ color: '#8b949e' }}>/ {tournament.maxTeams} Teams</span>
          </div>
        </Card>

        <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: '#8b949e', fontSize: '0.875rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Active Courts</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{tournament.courts.length}</h2>
        </Card>
      </div>

      {/* Localization Tools */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Localization & Ingestion</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
        
        <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Shareable Magic Link</h3>
          <p style={{ color: '#8b949e', marginBottom: '16px', lineHeight: 1.5 }}>
            Send this URL to players. It will lock them into this exact tournament during registration, completely bypassing the manual franchise discovery step.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input readOnly value={magicLink} style={{ flex: 1, padding: '12px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.2)', color: '#58a6ff', borderRadius: '6px', fontFamily: 'monospace' }} />
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(magicLink)}>Copy</Button>
          </div>
        </Card>

        <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Bulk Ingestion (CSV)</h3>
          <p style={{ color: '#8b949e', marginBottom: '16px', lineHeight: 1.5 }}>
            Upload an Excel/CSV file containing your roster. We will automatically provision User accounts and construct the Teams for this tournament.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="file" accept=".csv" style={{ padding: '8px', color: '#8b949e' }} />
            <Button variant="primary">Process CSV</Button>
          </div>
        </Card>

        <Card style={{ background: '#161b22', border: '1px solid #7ee787', padding: '24px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: '#7ee787' }}>Communication Highway</h3>
              <p style={{ color: '#8b949e', margin: 0 }}>
                Broadcast magic login links to all players currently ingested into this tournament database.
              </p>
            </div>
            <Button variant="success">Broadcast Invites to {tournament.teams.length * 2} Players</Button>
          </div>
        </Card>

      </div>
    </div>
  );
}

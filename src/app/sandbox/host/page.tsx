'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useSandboxTournaments } from './useSandboxState';

export default function GlobalHostDashboard() {
  const { tournaments, createTournament, loaded } = useSandboxTournaments();
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState('ALL');

  if (!loaded) return <div style={{ padding: '48px', color: '#8b949e', background: '#0d1117', minHeight: '100vh' }}>Loading...</div>;

  const activeUpcoming = tournaments.filter(t => t.status === 'UPCOMING' || t.status === 'ACTIVE');
  
  let displayedTournaments = showAll ? tournaments : activeUpcoming;
  if (filter !== 'ALL') displayedTournaments = displayedTournaments.filter(t => t.status === filter);

  const handleCreate = () => {
    const name = prompt('Enter new tournament name:');
    if (name) {
      const id = createTournament(name);
      window.location.href = `/sandbox/host/tournament/${id}`;
    }
  };

  const S = {
    page: { padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' } as React.CSSProperties,
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '24px', marginBottom: '32px' } as React.CSSProperties,
    h1: { fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 } as React.CSSProperties,
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' } as React.CSSProperties,
    card: { background: '#161b22', border: '1px solid rgba(255,255,255,0.07)', padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div>
          <h1 style={S.h1}>Host Dashboard</h1>
          <p style={{ color: '#8b949e', margin: 0, marginTop: '8px' }}>Manage your tennis tournaments globally.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Host" alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#21262d' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Host Jane</span>
              <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>Settings & Profile</span>
            </div>
          </div>
          <Button variant="success" onClick={handleCreate}>+ Provision New Tournament</Button>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
          {showAll ? 'All Tournaments' : 'Priority (Active & Upcoming)'}
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          {showAll && (
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ background: '#161b22', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          )}
          <Button variant="secondary" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show Priority Only' : 'View All Tournaments'}
          </Button>
        </div>
      </div>

      <div style={S.grid}>
        {displayedTournaments.map(t => (
          <Card 
            key={t.id} 
            style={S.card} 
            hoverable 
            onClick={() => window.location.href = `/sandbox/host/tournament/${t.id}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f0f6fc' }}>{t.name}</h3>
              <Badge variant={t.status === 'ACTIVE' ? 'primary' : t.status === 'COMPLETED' ? 'secondary' : 'warning'}>
                {t.status}
              </Badge>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#8b949e', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>📅 {t.date}</span>
              <span>👥 {t.teamsRegistered} Teams Registered</span>
              <span style={{ fontFamily: 'monospace', marginTop: '8px' }}>ID: {t.id}</span>
            </div>
          </Card>
        ))}
        {displayedTournaments.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '48px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', color: '#8b949e' }}>
            No tournaments found matching the criteria.
          </div>
        )}
      </div>

    </div>
  );
}

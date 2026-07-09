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

  if (!loaded) return <div >Loading...</div>;

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
          <p >Manage your tennis tournaments globally.</p>
        </div>
        <div >
          <div >
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Host" alt="Profile"  />
            <div >
              <span >Host Jane</span>
              <span >Settings & Profile</span>
            </div>
          </div>
          <Button variant="success" onClick={handleCreate}>+ Provision New Tournament</Button>
        </div>
      </header>

      <div >
        <h2 >
          {showAll ? 'All Tournaments' : 'Priority (Active & Upcoming)'}
        </h2>
        <div >
          {showAll && (
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              
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
            <div >
              <h3 >{t.name}</h3>
              <Badge variant="default">
                {t.status}
              </Badge>
            </div>
            <div >
              <span>📅 {t.date}</span>
              <span>👥 {t.teamsRegistered} Teams Registered</span>
              <span >ID: {t.id}</span>
            </div>
          </Card>
        ))}
        {displayedTournaments.length === 0 && (
          <div >
            No tournaments found matching the criteria.
          </div>
        )}
      </div>

    </div>
  );
}

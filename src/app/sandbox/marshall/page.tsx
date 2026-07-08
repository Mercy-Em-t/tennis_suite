'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function GlobalMarshallDashboard() {
  const [tournaments, setTournaments] = useState<{ id: string, name: string, status: string }[]>([]);

  useEffect(() => {
    // Mock assigned tournaments for Marshall
    setTournaments([
      { id: 'T-1001', name: 'Summer Open 2026', status: 'ACTIVE' },
      { id: 'T-1002', name: 'Winter Classic 2026', status: 'UPCOMING' },
    ]);
  }, []);

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
          <h1 style={S.h1}>Marshall Dashboard</h1>
          <p style={{ color: '#8b949e', margin: 0, marginTop: '8px' }}>Select an assigned tournament to manage courts.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marshall" alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#21262d' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Marshall Alex</span>
            <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>Settings & Profile</span>
          </div>
        </div>
      </header>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 24px' }}>My Assigned Tournaments</h2>

      <div style={S.grid}>
        {tournaments.map(t => (
          <Card 
            key={t.id} 
            style={S.card} 
            hoverable 
            onClick={() => window.location.href = `/sandbox/marshall/tournament/${t.id}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f0f6fc' }}>{t.name}</h3>
              <Badge variant={t.status === 'ACTIVE' ? 'primary' : 'warning'}>
                {t.status}
              </Badge>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#8b949e', marginTop: '12px' }}>
              <span style={{ fontFamily: 'monospace' }}>ID: {t.id}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

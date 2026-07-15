'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface SandboxRoute {
  path: string;
  name: string;
  description: string;
  category: 'Host Admin' | 'Match Play' | 'System Ops' | 'Demos';
}

const sandboxRoutes: SandboxRoute[] = [
  {
    path: '/sandbox/host',
    name: 'Host Control Dashboard',
    description: 'Entry point for tournament hosts. Mock clubs, court statuses, and register new tournaments.',
    category: 'Host Admin'
  },
  {
    path: '/sandbox/host/tournament/T-1001',
    name: 'Tournament Command Center',
    description: 'Structured 3-tab hub (Pre-Tournament pipeline, live scoring telemetry radar, post-tournament archives).',
    category: 'Host Admin'
  },
  {
    path: '/sandbox/host/tournament/T-1001/pools',
    name: 'Pools & Seeding Workspace',
    description: 'Simulate serpentine pool partitioning algorithm and manually seed franchises.',
    category: 'Host Admin'
  },
  {
    path: '/sandbox/host/tournament/T-1001/dispatcher',
    name: 'Match Dispatcher Grid',
    description: 'Generate round-robin matches and queue them onto physical active courts.',
    category: 'Host Admin'
  },
  {
    path: '/sandbox/host/tournament/T-1001/invite?role=REFEREE',
    name: 'Staff Invite Page',
    description: 'Onboarding link for referees and marshalls to register their credentials.',
    category: 'Host Admin'
  },
  {
    path: '/sandbox/tournament',
    name: 'Tournament Public Hub',
    description: 'Guest-facing dashboard showing live brackets, completed matches, and active courts.',
    category: 'Match Play'
  },
  {
    path: '/sandbox/draws',
    name: 'Brackets & Draws Sandbox',
    description: 'Generate knockout seeds and configure serpentine distributions.',
    category: 'Match Play'
  },
  {
    path: '/sandbox/team',
    name: 'Team Registration Hub',
    description: 'Onboarding and registration checklist flow for teams and coaches.',
    category: 'Match Play'
  },
  {
    path: '/sandbox/registration',
    name: 'Franchise Registration Pipeline',
    description: 'Checklist for team registration approvals and fee collections.',
    category: 'Match Play'
  },
  {
    path: '/sandbox/operations',
    name: 'Court Telemetry Operations',
    description: 'Physical court latency, umpire terminal health logs, and connectivity checkers.',
    category: 'System Ops'
  },
  {
    path: '/sandbox/network',
    name: 'WebSocket Network Monitor',
    description: 'WebSocket latency windows and event emitter payload monitors.',
    category: 'System Ops'
  },
  {
    path: '/sandbox/compliance',
    name: 'Audits & Ledger Compliance',
    description: 'Marshall interventions log and treasury double-booking collision overrides.',
    category: 'System Ops'
  },
  {
    path: '/sandbox/monitor',
    name: 'System Monitor',
    description: 'CPU load averages, database query benchmarks, and system logs.',
    category: 'System Ops'
  },
  {
    path: '/sandbox/automaton',
    name: 'Automaton AI Draw Scheduler',
    description: 'Algorithmic scheduler test board.',
    category: 'Demos'
  },
  {
    path: '/sandbox/broadcaster',
    name: 'Live Broadcaster Overlay',
    description: 'Simulated live broadcast overlays and streaming status indicators.',
    category: 'Demos'
  },
  {
    path: '/sandbox/delegate',
    name: 'Delegate Dashboard',
    description: 'Mock interface for regional representatives and national delegates.',
    category: 'Demos'
  },
  {
    path: '/sandbox/director',
    name: 'Tournament Director Panel',
    description: 'Global configurations for court scheduling limits and referee licenses.',
    category: 'Demos'
  },
  {
    path: '/sandbox/marshall',
    name: 'Marshall Score Console',
    description: 'Interface for marshalls to resolve score conflicts and input tiebreaker outcomes.',
    category: 'Demos'
  }
];

export default function SandboxRoutesIndex() {
  const S = {
    page: { padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' } as React.CSSProperties,
    header: { borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '24px', marginBottom: '32px' } as React.CSSProperties,
    title: { fontSize: '2.5rem', fontWeight: 900, margin: 0, color: '#fff', letterSpacing: '-0.02em' } as React.CSSProperties,
    subtitle: { color: '#8b949e', margin: '8px 0 0 0', fontSize: '1.1rem' } as React.CSSProperties,
    section: { marginBottom: '40px' } as React.CSSProperties,
    secTitle: { fontSize: '1.3rem', fontWeight: 700, color: '#58a6ff', margin: '0 0 16px', borderBottom: '1px solid rgba(88,166,255,0.15)', paddingBottom: '6px' } as React.CSSProperties,
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' } as React.CSSProperties,
    card: { background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px' } as React.CSSProperties,
  };

  const categories = ['Host Admin', 'Match Play', 'System Ops', 'Demos'] as const;

  return (
    <div style={S.page}>
      <header style={S.header}>
        <h1 style={S.title}>Sandbox Directory Index</h1>
        <p style={S.subtitle}>Browse and test the fully operational sandbox mock workspaces across the Tennis Suite.</p>
      </header>

      {categories.map(cat => {
        const routes = sandboxRoutes.filter(r => r.category === cat);
        if (routes.length === 0) return null;

        return (
          <div key={cat} style={S.section}>
            <h2 style={S.secTitle}>{cat}</h2>
            <div style={S.grid}>
              {routes.map(route => (
                <Card key={route.path} style={S.card} hoverable>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: '0 0 8px', fontWeight: 700 }}>
                      {route.name}
                    </h3>
                    <p style={{ color: '#8b949e', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                      {route.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <code style={{ fontSize: '0.75rem', color: '#58a6ff', background: 'rgba(88,166,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                      {route.path}
                    </code>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => window.location.href = route.path}
                    >
                      Open →
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

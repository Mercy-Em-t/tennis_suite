'use client';

import React from 'react';
import Link from 'next/link';

interface SandboxRoute {
  path: string;
  name: string;
  description: string;
  category: 'Host Admin' | 'Match Play' | 'System Ops' | 'Demos';
  badge?: string;
}

const sandboxRoutes: SandboxRoute[] = [
  {
    path: '/sandbox/host',
    name: 'Host Control Dashboard',
    description: 'Entry point for tournament hosts. Mock clubs, court statuses, and register new tournaments.',
    category: 'Host Admin',
    badge: 'Live'
  },
  {
    path: '/sandbox/host/tournament/T-1001',
    name: 'Tournament Command Center',
    description: 'Structured 3-tab hub (Pre-Tournament pipeline, live scoring telemetry radar, post-tournament archives).',
    category: 'Host Admin',
    badge: 'Live'
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
    name: 'Staff Invite Page (Referee)',
    description: 'Onboarding link for referees to register their credentials for a tournament.',
    category: 'Host Admin'
  },
  {
    path: '/sandbox/host/tournament/T-1001/invite?role=MARSHALL',
    name: 'Staff Invite Page (Marshall)',
    description: 'Onboarding link for marshalls to register their credentials for a tournament.',
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
    path: '/sandbox/monitor/dashboard',
    name: 'System Monitor Dashboard',
    description: 'CPU load averages, database query benchmarks, and system logs.',
    category: 'System Ops'
  },
  {
    path: '/sandbox/monitor/court',
    name: 'Court Monitor',
    description: 'Per-court health, latency, and umpire terminal connectivity views.',
    category: 'System Ops'
  },
  {
    path: '/sandbox/automaton',
    name: 'Automaton AI Draw Scheduler',
    description: 'Algorithmic scheduler test board for AI-driven draw generation.',
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
  },
  {
    path: '/sandbox/play6ump/player',
    name: 'Play6Ump — Player View',
    description: 'Player-facing live match experience with score updates and umpire pings.',
    category: 'Demos'
  },
  {
    path: '/sandbox/play6ump/referee',
    name: 'Play6Ump — Referee View',
    description: 'Referee console for controlling set progression and submitting final scores.',
    category: 'Demos'
  }
];

const categoryColors: Record<string, string> = {
  'Host Admin': '#58a6ff',
  'Match Play': '#3fb950',
  'System Ops': '#d29922',
  'Demos': '#bc8cff'
};

export default function SandboxRoutesIndex() {
  const categories = ['Host Admin', 'Match Play', 'System Ops', 'Demos'] as const;

  return (
    <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '28px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '2rem' }}>🧪</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>
            Sandbox Directory
          </h1>
        </div>
        <p style={{ color: '#8b949e', margin: 0, fontSize: '1.05rem' }}>
          Click any card to open that workspace. All routes run on local mock state — nothing here touches the live database.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <span key={cat} style={{
              fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px',
              borderRadius: '20px', border: `1px solid ${categoryColors[cat]}22`,
              background: `${categoryColors[cat]}11`, color: categoryColors[cat]
            }}>
              {cat}
            </span>
          ))}
        </div>
      </header>

      {categories.map(cat => {
        const routes = sandboxRoutes.filter(r => r.category === cat);
        if (routes.length === 0) return null;
        const color = categoryColors[cat];

        return (
          <div key={cat} style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.1rem', fontWeight: 700, color, margin: '0 0 16px',
              display: 'flex', alignItems: 'center', gap: '8px',
              textTransform: 'uppercase', letterSpacing: '0.08em'
            }}>
              <span style={{ width: '3px', height: '16px', background: color, borderRadius: '2px', display: 'inline-block' }} />
              {cat}
              <span style={{ color: '#8b949e', fontWeight: 400, fontSize: '0.85rem', textTransform: 'none', letterSpacing: 0 }}>
                — {routes.length} workspace{routes.length !== 1 ? 's' : ''}
              </span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {routes.map(route => (
                <Link
                  key={route.path}
                  href={route.path}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div style={{
                    background: '#161b22',
                    border: `1px solid rgba(255,255,255,0.07)`,
                    borderLeft: `3px solid ${color}`,
                    padding: '20px 22px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    minHeight: '140px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease, border-color 0.15s ease, transform 0.1s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background = '#1c2128';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background = '#161b22';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ color: '#e6edf3', fontSize: '0.95rem', margin: 0, fontWeight: 700, lineHeight: 1.3 }}>
                        {route.name}
                      </h3>
                      {route.badge && (
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                          borderRadius: '20px', background: '#238636', color: '#fff',
                          letterSpacing: '0.04em', flexShrink: 0, marginLeft: '8px'
                        }}>
                          {route.badge}
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#8b949e', fontSize: '0.82rem', lineHeight: 1.55, margin: 0, flexGrow: 1 }}>
                      {route.description}
                    </p>
                    <code style={{
                      fontSize: '0.7rem', color: color, background: `${color}0d`,
                      padding: '3px 7px', borderRadius: '4px', display: 'inline-block', width: 'fit-content'
                    }}>
                      {route.path}
                    </code>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

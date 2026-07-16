'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Trophy, Radio, ShieldAlert, Settings,
  LogOut, Menu, X, ClipboardList, Users, Layers,
  Zap, MapPin, ChevronRight, FlaskConical, Home
} from 'lucide-react';

type Persona = 'HOST' | 'PLAYER' | 'DIRECTOR';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description?: string;
}

function getNavItems(persona: Persona): { section: string; items: NavItem[] }[] {
  if (persona === 'HOST') {
    return [
      {
        section: 'Dashboard',
        items: [
          { name: 'Host Dashboard', path: '/sandbox/host', icon: <LayoutDashboard size={17} />, description: 'Overview & tournament list' },
        ]
      },
      {
        section: 'Tournament T-1001',
        items: [
          { name: 'Command Center', path: '/sandbox/host/tournament/T-1001', icon: <ClipboardList size={17} />, description: 'Pre / During / Post tabs' },
          { name: 'Pools Workspace', path: '/sandbox/host/tournament/T-1001/pools', icon: <Layers size={17} />, description: 'Seed & partition teams' },
          { name: 'Match Dispatcher', path: '/sandbox/host/tournament/T-1001/dispatcher', icon: <Zap size={17} />, description: 'Assign matches to courts' },
        ]
      },
      {
        section: 'Staff Onboarding',
        items: [
          { name: 'Invite Referee', path: '/sandbox/host/tournament/T-1001/invite?role=REFEREE', icon: <Users size={17} />, description: 'Generate referee invite link' },
          { name: 'Invite Marshall', path: '/sandbox/host/tournament/T-1001/invite?role=MARSHALL', icon: <Users size={17} />, description: 'Generate marshall invite link' },
        ]
      }
    ];
  }

  if (persona === 'PLAYER') {
    return [
      {
        section: 'Player',
        items: [
          { name: 'Team Hub', path: '/sandbox/team', icon: <LayoutDashboard size={17} />, description: 'Your team profile & stats' },
          { name: 'Tournament Browser', path: '/sandbox/tournament', icon: <Trophy size={17} />, description: 'Browse & register for events' },
          { name: 'Registration', path: '/sandbox/registration', icon: <ClipboardList size={17} />, description: 'Registration pipeline' },
        ]
      }
    ];
  }

  // DIRECTOR
  return [
    {
      section: 'Director',
      items: [
        { name: 'Crisis Control', path: '/sandbox/director', icon: <ShieldAlert size={17} />, description: 'Emergency overrides' },
        { name: 'Broadcast Mgmt', path: '/sandbox/broadcaster', icon: <Radio size={17} />, description: 'Live overlay management' },
        { name: 'Compliance', path: '/sandbox/compliance', icon: <Settings size={17} />, description: 'Audit & ledger tools' },
        { name: 'Delegate Hub', path: '/sandbox/delegate', icon: <Users size={17} />, description: 'Regional delegate actions' },
      ]
    }
  ];
}

const personaColors: Record<Persona, string> = {
  HOST: '#58a6ff',
  PLAYER: '#3fb950',
  DIRECTOR: '#d29922',
};

const personaLabels: Record<Persona, string> = {
  HOST: '🏟️ Host',
  PLAYER: '🎾 Player',
  DIRECTOR: '🎬 Director',
};

export default function SandboxLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [persona, setPersona] = useState<Persona>('HOST');

  const navSections = getNavItems(persona);
  const accentColor = personaColors[persona];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background-base)' }}>

      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', top: '16px', left: '16px', zIndex: 50,
          background: 'rgba(13,17,23,0.9)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '8px', color: '#fff', cursor: 'pointer', display: 'none'
        }}
        className="mobile-toggle"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      {isOpen && (
        <aside style={{
          background: 'rgba(13, 17, 23, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '260px',
          overflow: 'hidden',
          flexShrink: 0,
        }}>

          {/* Logo + Sandbox badge */}
          <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Link href="/sandbox" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FlaskConical size={18} color={accentColor} />
                <h1 style={{
                  fontSize: '1.1rem', fontWeight: 800, margin: 0,
                  background: 'linear-gradient(90deg, #fff, #8b949e)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}>
                  Tennis Suite
                </h1>
              </div>
            </Link>
            <span style={{
              fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
              color: accentColor, textTransform: 'uppercase',
              background: `${accentColor}15`, padding: '2px 8px',
              borderRadius: '4px', border: `1px solid ${accentColor}30`
            }}>
              Sandbox Mode
            </span>
          </div>

          {/* Persona Switcher */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8b949e', marginBottom: '8px', fontWeight: 700 }}>
              Active Persona
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['HOST', 'PLAYER', 'DIRECTOR'] as Persona[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPersona(p)}
                  style={{
                    flex: 1, padding: '5px 4px', fontSize: '0.7rem', fontWeight: 600,
                    borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease',
                    border: persona === p ? `1px solid ${personaColors[p]}` : '1px solid rgba(255,255,255,0.08)',
                    background: persona === p ? `${personaColors[p]}20` : 'transparent',
                    color: persona === p ? personaColors[p] : '#8b949e',
                  }}
                >
                  {personaLabels[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Nav Sections */}
          <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
            {navSections.map(section => (
              <div key={section.section}>
                <div style={{
                  fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: accentColor, marginBottom: '6px', paddingLeft: '8px', fontWeight: 700
                }}>
                  {section.section}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {section.items.map(item => {
                    const isActive = pathname === item.path || pathname?.startsWith(item.path.split('?')[0]);
                    return (
                      <Link href={item.path} key={item.path} style={{ textDecoration: 'none' }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '9px 10px', borderRadius: '7px',
                          color: isActive ? '#fff' : '#8b949e',
                          background: isActive ? `${accentColor}18` : 'transparent',
                          border: isActive ? `1px solid ${accentColor}40` : '1px solid transparent',
                          fontWeight: isActive ? 600 : 400,
                          fontSize: '0.875rem',
                          transition: 'all 0.15s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                        >
                          <span style={{ color: isActive ? accentColor : '#6e7681', flexShrink: 0 }}>{item.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                            {item.description && !isActive && (
                              <div style={{ fontSize: '0.68rem', color: '#6e7681', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.description}
                              </div>
                            )}
                          </div>
                          {isActive && <ChevronRight size={14} color={accentColor} style={{ flexShrink: 0 }} />}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div style={{ padding: '12px 12px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link href="/sandbox" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px',
                borderRadius: '7px', color: '#8b949e', fontSize: '0.875rem',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
              >
                <MapPin size={17} color="#8b949e" />
                All Sandbox Routes
              </div>
            </Link>

            <Link href="/app" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px',
                borderRadius: '7px', color: '#8b949e', fontSize: '0.875rem',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
              >
                <Home size={17} color="#8b949e" />
                Exit to Live App
              </div>
            </Link>
          </div>
        </aside>
      )}

      {/* Collapse toggle (visible always) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '24px', left: isOpen ? '228px' : '12px',
          zIndex: 40, background: 'rgba(22,27,34,0.95)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%',
          width: '28px', height: '28px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', color: '#8b949e',
          transition: 'left 0.2s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
        }}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isOpen ? <X size={13} /> : <Menu size={13} />}
      </button>

      {/* Main Content */}
      <main style={{ flex: 1, position: 'relative', overflowY: 'auto' }}>
        {children}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .mobile-toggle { display: flex !important; }
        }
      `}} />
    </div>
  );
}

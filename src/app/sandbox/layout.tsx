'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Trophy, Radio, ShieldAlert, Settings, LogOut, Menu, X, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SandboxLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  // Mock persona toggler for sandbox
  const [persona, setPersona] = useState<'PLAYER' | 'DIRECTOR' | 'HOST'>('PLAYER');

  const navItems = persona === 'PLAYER' ? [
    { name: 'Player Hub', path: '/sandbox/team', icon: <LayoutDashboard size={20} /> },
    { name: 'Tournaments', path: '/sandbox/tournaments', icon: <Trophy size={20} /> },
  ] : persona === 'HOST' ? [
    { name: 'Host Dashboard', path: '/sandbox/host', icon: <ClipboardList size={20} /> },
  ] : [
    { name: 'Crisis Control', path: '/sandbox/director', icon: <ShieldAlert size={20} /> },
    { name: 'Broadcast Mgmt', path: '/sandbox/director/broadcast', icon: <Radio size={20} /> },
    { name: 'Settings', path: '/sandbox/director/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background-base)' }}>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 50, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '8px', color: 'var(--text-main)', display: 'none' }}
        className="mobile-toggle"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            style={{
              background: 'rgba(13, 17, 23, 0.7)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRight: '1px solid var(--card-border)',
              display: 'flex',
              flexDirection: 'column',
              position: 'sticky',
              top: 0,
              height: '100vh',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <Link href="/sandbox" style={{ textDecoration: 'none' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(90deg, #fff, #8b949e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
                  Tennis <span style={{ color: 'var(--primary)', WebkitTextFillColor: 'initial' }}>Suite</span>
                </h1>
              </Link>
            </div>

            <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '8px', fontWeight: 700 }}>
                {persona} NAVIGATION
              </div>
              
              {navItems.map(item => {
                const isActive = pathname === item.path || (pathname?.startsWith(item.path) && item.path !== '/sandbox');
                return (
                  <Link href={item.path} key={item.path} style={{ textDecoration: 'none' }}>
                    <motion.div
                      whileHover={{ x: 4, background: 'rgba(255,255,255,0.05)' }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                        background: isActive ? 'var(--primary-glow)' : 'transparent',
                        border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                        fontWeight: isActive ? 600 : 500,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>{item.icon}</span>
                      {item.name}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            <div style={{ padding: '24px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {/* Sandbox Persona Toggler */}
              <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px dashed var(--accent)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>SANDBOX MODE</span>
                <select 
                  value={persona} 
                  onChange={(e) => setPersona(e.target.value as any)}
                  style={{ background: '#000', color: '#fff', border: '1px solid #333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}
                >
                  <option value="PLAYER">Player Persona</option>
                  <option value="HOST">Host Persona</option>
                  <option value="DIRECTOR">Director Persona</option>
                </select>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                color: '#f85149',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}>
                <LogOut size={20} />
                <span style={{ fontWeight: 500 }}>Exit Walled Garden</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main style={{ flex: 1, position: 'relative', overflowY: 'auto' }}>
        {children}
      </main>

      {/* Basic responsive styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .mobile-toggle { display: block !important; }
        }
      `}} />
    </div>
  );
}

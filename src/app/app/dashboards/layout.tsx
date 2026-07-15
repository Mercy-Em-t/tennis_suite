import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Trophy, Radio, ShieldAlert, Settings, LogOut, Menu, X } from 'lucide-react';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { GlobalSuspensionOverlay } from '@/components/ui/GlobalSuspensionOverlay';
import { LogoutButton } from '@/components/ui/LogoutButton';

export default async function DashboardsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  let role = '';
  
  if (token) {
    const payload = await verifyToken(token);
    role = payload?.roles?.[0] || '';
  }

  // Define navigation based on actual role
  let navItems: { name: string, path: string, icon: React.ReactNode }[] = [];
  
  if (role === 'PLAYER') {
    navItems = [
      { name: 'Player Hub', path: '/team', icon: <LayoutDashboard size={20} /> },
      { name: 'Tournaments', path: '/tournaments', icon: <Trophy size={20} /> },
    ];
  } else if (role === 'DIRECTOR' || role === 'ADMIN' || role === 'HOST') {
    navItems = [
      { name: 'Crisis Control', path: '/director/crisis', icon: <ShieldAlert size={20} /> },
      { name: 'Broadcast Mgmt', path: '/director/broadcast', icon: <Radio size={20} /> },
      { name: 'Settings', path: '/director/settings', icon: <Settings size={20} /> },
    ];
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background-base)' }}>
      <GlobalSuspensionOverlay />
      
      {/* Sidebar */}
      <aside
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
          width: '280px',
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(90deg, #fff, #8b949e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
              Tennis <span style={{ color: 'var(--primary)', WebkitTextFillColor: 'initial' }}>Suite</span>
            </h1>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '8px', fontWeight: 700 }}>
            {role} NAVIGATION
          </div>
          
          {navItems.map(item => (
            <Link href={item.path} key={item.path} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: 'var(--text-muted)',
                  border: '1px solid transparent',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
                className="hover:bg-white/5 hover:text-white"
              >
                <span>{item.icon}</span>
                {item.name}
              </div>
            </Link>
          ))}
        </nav>

        <div style={{ padding: '24px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
            <span style={{ fontWeight: 500 }}>
              <LogoutButton />
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, position: 'relative', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

import React from 'react';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { GlobalSuspensionOverlay } from '@/components/ui/GlobalSuspensionOverlay';
import { Sidebar } from '@/components/ui/Sidebar';

export default async function DashboardsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  let role = 'PLAYER';
  
  if (token) {
    const payload = await verifyToken(token);
    role = payload?.roles?.[0] || 'PLAYER';
  }

  // Define navigation based on actual route structure and role
  let navItems: { name: string, path: string, iconName: string }[] = [];
  const upperRole = role.toUpperCase();
  
  if (upperRole === 'PLAYER') {
    navItems = [
      { name: 'Player Hub', path: '/app/dashboards/player', iconName: 'LayoutDashboard' },
      { name: 'Tournaments', path: '/tournaments', iconName: 'Trophy' },
    ];
  } else if (upperRole === 'HOST') {
    navItems = [
      { name: 'Host Command', path: '/app/dashboards/host', iconName: 'Briefcase' },
      { name: 'My Tournaments', path: '/tournaments', iconName: 'Trophy' },
    ];
  } else if (upperRole === 'REFEREE') {
    navItems = [
      { name: 'Referee Console', path: '/app/dashboards/referee', iconName: 'Gavel' },
      { name: 'Tournaments', path: '/tournaments', iconName: 'Trophy' },
    ];
  } else if (upperRole === 'MARSHALL') {
    navItems = [
      { name: 'Court Dispatcher', path: '/app/dashboards/marshal', iconName: 'Activity' },
      { name: 'Tournaments', path: '/tournaments', iconName: 'Trophy' },
    ];
  } else if (upperRole === 'DIRECTOR' || upperRole === 'ADMIN') {
    navItems = [
      { name: 'Crisis Control', path: '/director/crisis', iconName: 'ShieldAlert' },
      { name: 'Broadcast Mgmt', path: '/director/broadcast', iconName: 'Radio' },
      { name: 'Settings', path: '/director/settings', iconName: 'Settings' },
      { name: 'Tournaments', path: '/tournaments', iconName: 'Trophy' },
    ];
  } else if (upperRole === 'BROADCAST' || upperRole === 'NETWORK') {
    navItems = [
      { name: 'Graphics Engine', path: '/app/dashboards/broadcast', iconName: 'Video' },
    ];
  } else if (upperRole === 'DELEGATE') {
    navItems = [
      { name: 'Delegate Console', path: '/app/dashboards/delegate', iconName: 'Key' },
    ];
  } else if (upperRole === 'UMPIRE') {
    navItems = [
      { name: 'Match Officiating', path: '/app/dashboards/umpire', iconName: 'Users' },
    ];
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background-base)' }}>
      <GlobalSuspensionOverlay />
      
      <Sidebar role={upperRole} navItems={navItems} />

      {/* Main Content Area */}
      <main style={{ flex: 1, position: 'relative', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

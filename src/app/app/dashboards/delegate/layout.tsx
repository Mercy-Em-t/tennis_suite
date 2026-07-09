import React from 'react';
import { DirectorHeader } from '@/components/director/DirectorHeader';
import { TournamentProvider } from '@/lib/context/TournamentContext';

export default function DirectorNestedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TournamentProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
        {/* The permanent Global Status Bar */}
        <DirectorHeader />
        
        {/* The specific Command Area Grid Workspace */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </TournamentProvider>
  );
}

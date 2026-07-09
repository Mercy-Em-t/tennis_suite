import React from 'react';
import { DisqualificationPanel } from '@/components/director/DisqualificationPanel';
import { TournamentArchive } from '@/components/director/TournamentArchive';

export default function CompliancePage() {
  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#60a5fa' }}>ARCHIVE & COMPLIANCE</h1>
        <p style={{ margin: '0.5rem 0 0 0', color: '#9ca3af' }}>Formal disqualifications, auditing, and database sealing.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
        gap: '2rem',
        alignItems: 'start'
      }}>
        <DisqualificationPanel />
        <TournamentArchive />
      </div>
    </div>
  );
}

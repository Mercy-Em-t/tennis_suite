import React from 'react';
import { SystemHealthDashboard } from '@/components/director/SystemHealthDashboard';
import { DisputeQueue } from '@/components/director/DisputeQueue';
import { StaffRapidSwap } from '@/components/director/StaffRapidSwap';

export default function OperationsPage() {
  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#10b981' }}>OPERATIONS & HEALTH</h1>
        <p style={{ margin: '0.5rem 0 0 0', color: '#9ca3af' }}>Live system telemetry, dispute mediation, and personnel logistics.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '350px 1fr', 
        gap: '2rem',
        alignItems: 'start',
        flex: 1
      }}>
        {/* Left Column: Health and Staff */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <SystemHealthDashboard />
          <StaffRapidSwap />
        </div>

        {/* Right Column: Full-height Dispute Queue */}
        <div style={{ height: '100%' }}>
          <DisputeQueue />
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { EmergencyBroadcast } from '@/components/director/EmergencyBroadcast';
import { BroadcastQualityAlert } from '@/components/director/BroadcastQualityAlert';
import { BracketReseeder } from '@/components/director/BracketReseeder';

export default function CrisisControlPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#ef4444' }}>CRISIS CONTROL</h1>
        <p style={{ margin: '0.5rem 0 0 0', color: '#9ca3af' }}>Emergency interventions and global event flow management.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Priority 1: PA System and Quality */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <EmergencyBroadcast />
          <BroadcastQualityAlert />
        </div>

        {/* Priority 2: Structural Integrity */}
        <div>
          <BracketReseeder />
        </div>
      </div>
    </div>
  );
}

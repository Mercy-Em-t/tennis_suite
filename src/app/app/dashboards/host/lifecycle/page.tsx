'use client';

import React from 'react';
import { LifecycleVisualizer } from '@/components/lifecycle/LifecycleVisualizer';

export default function LifecycleDashboardPage() {
  // Hardcoding role for now, in a real app this would be extracted from the JWT token via context/hooks
  const role = 'HOST';

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>Lifecycle State Machine</h1>
        <p style={{ color: '#8b949e', marginTop: '8px', margin: 0 }}>
          Interactive 3D timeline mapping for the tournament lifecycle. Actions are locked according to your persona matrix.
        </p>
      </header>
      
      <LifecycleVisualizer role={role} />
    </div>
  );
}

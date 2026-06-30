'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export default function TeamDashboard() {
  return (
    <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '24px' }}>Player Dashboard</h1>
      <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Welcome to your Walled Garden</h2>
        <p style={{ color: '#8b949e', lineHeight: 1.6 }}>
          Your registration was successful. In Phase 4, this space will populate with your live tournament brackets, upcoming match schedules, and dynamic gamification (Global XP & badges).
        </p>
      </Card>
    </div>
  );
}

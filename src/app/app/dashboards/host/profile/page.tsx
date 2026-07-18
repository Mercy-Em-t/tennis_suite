'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export default function HostProfileSettings() {
  return (
    <div style={{ padding: '40px 48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Host Profile & Settings</h1>
        <p style={{ color: '#8b949e', margin: 0 }}>Manage your organizational details, billing, and host preferences.</p>
      </header>

      <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.07)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#8b949e', fontWeight: 600 }}>Organization Name</label>
          <input type="text" placeholder="Tennis Academy" style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#8b949e', fontWeight: 600 }}>Support Email</label>
          <input type="email" placeholder="support@tennis.com" style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
        </div>
        <div style={{ marginTop: '16px' }}>
          <button style={{ background: '#1f6feb', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
            Save Changes
          </button>
        </div>
      </Card>
    </div>
  );
}

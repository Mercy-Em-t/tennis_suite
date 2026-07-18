import React from 'react';

export default function MarshallDashboard() {
  return (
    <div style={{ padding: '48px', color: '#fff', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Court Marshall Hub</h1>
      <p style={{ color: '#8b949e', marginTop: '16px' }}>Manage court allocations, match readiness, and player check-ins.</p>
      
      <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Pending Check-ins</h2>
          <p style={{ color: '#8b949e' }}>All players checked in.</p>
        </div>
        
        <div style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Court Status</h2>
          <p style={{ color: '#8b949e' }}>All courts active.</p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export default function NetworkDashboard() {
  return (
    <div style={{ padding: '48px', color: '#fff', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Network Operations Center (NOC)</h1>
      <p style={{ color: '#8b949e', marginTop: '16px' }}>Network infrastructure monitoring and API telemetry.</p>
      
      <div style={{ marginTop: '32px', background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '32px', borderRadius: '12px' }}>
        <p>No active incidents.</p>
      </div>
    </div>
  );
}

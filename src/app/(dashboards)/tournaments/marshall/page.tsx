"use client";

import { useState } from 'react';

export default function MarshallDashboard() {
  const [courts] = useState([
    { id: '1', name: 'Center Court', status: 'IN_USE', currentMatch: 'The Baseline Bashers vs Topspin Titans' },
    { id: '2', name: 'Court 2', status: 'AVAILABLE', currentMatch: null },
  ]);

  const [staff] = useState([
    { id: '1', name: 'James T.', role: 'BALL_BOY', assignment: 'Center Court' },
    { id: '2', name: 'Sarah L.', role: 'BALL_BOY', assignment: 'Unassigned' },
  ]);

  const handleLogout = () => {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/';
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Court Marshall Logistics</h1>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--card-border)', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Venue Management */}
        <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
          <h2>Venue Management</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Assign scheduled matches to available courts.</p>
          
          {courts.map(court => (
            <div key={court.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', marginBottom: '1rem', border: `1px solid ${court.status === 'AVAILABLE' ? 'var(--accent)' : 'var(--card-border)'}` }}>
              <div>
                <strong>{court.name}</strong>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{court.currentMatch || 'Empty'}</div>
              </div>
              <div style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', background: court.status === 'AVAILABLE' ? 'rgba(34, 211, 238, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: court.status === 'AVAILABLE' ? 'var(--accent)' : 'var(--error)' }}>
                {court.status}
              </div>
            </div>
          ))}
        </div>

        {/* Support Staffing */}
        <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
          <h2>Support Staffing</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Dispatch ball kids and equipment concierges.</p>

          {staff.map(person => (
            <div key={person.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--card-border)' }}>
              <div>
                <strong>{person.name}</strong>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{person.role.replace('_', ' ')}</div>
              </div>
              <div style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>{person.assignment}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

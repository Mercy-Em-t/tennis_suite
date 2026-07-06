'use client';

import React from 'react';
import useSWR from 'swr';
import { AlertOctagon, MapPin } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CrisisMap() {
  const { data } = useSWR('/api/system/status', fetcher, {
    refreshInterval: 3000,
  });

  const isSuspended = data?.state === 'SUSPENDED';

  if (!isSuspended) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#1f2937', // dark background for host dashboard takeover
      color: 'white',
      padding: '2rem',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '2px solid #ef4444', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <AlertOctagon size={48} color="#ef4444" />
        <div>
          <h1 style={{ margin: 0, color: '#ef4444', letterSpacing: '2px' }}>CRISIS MANAGEMENT MODE</h1>
          <p style={{ margin: 0, color: '#9ca3af' }}>{data.message}</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', flex: 1 }}>
        {/* Mocked Court Grid */}
        {[1, 2, 3, 4, 5, 6].map(courtNum => (
          <div key={courtNum} style={{ background: '#374151', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Court {courtNum}</span>
              <MapPin color="#ef4444" />
            </div>
            <div style={{ background: '#111827', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
              <strong>Status:</strong> Evacuation Protocol Active<br/>
              <strong>Marshal:</strong> Dispatching SMS...
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

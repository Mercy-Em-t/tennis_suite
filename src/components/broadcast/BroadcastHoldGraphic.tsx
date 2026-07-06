'use client';

import React from 'react';
import useSWR from 'swr';
import { Radio } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function BroadcastHoldGraphic() {
  const { data } = useSWR('/api/system/status', fetcher, {
    refreshInterval: 3000,
  });

  const isSuspended = data?.state === 'SUSPENDED';

  if (!isSuspended) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '5%',
      left: '5%',
      background: 'rgba(0,0,0,0.85)',
      border: '2px solid #ef4444',
      padding: '1rem 2rem',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      color: 'white',
      fontFamily: 'sans-serif',
      zIndex: 1000,
      boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)'
    }}>
      <Radio size={32} color="#ef4444" className="animate-pulse" />
      <div>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#ef4444', textTransform: 'uppercase' }}>
          BROADCAST HOLD
        </h2>
        <span style={{ fontSize: '0.9rem', color: '#fca5a5' }}>
          {data.message}
        </span>
      </div>
    </div>
  );
}

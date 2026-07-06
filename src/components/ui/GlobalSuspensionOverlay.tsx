'use client';

import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { ShieldAlert } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function GlobalSuspensionOverlay() {
  // Poll the lightweight status endpoint every 3 seconds
  const { data, error } = useSWR('/api/system/status', fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: true,
  });

  const isSuspended = data?.state === 'SUSPENDED';

  useEffect(() => {
    if (isSuspended) {
      document.body.style.border = '4px solid #ef4444'; // red-500
      document.body.style.boxShadow = 'inset 0 0 50px rgba(239, 68, 68, 0.2)';
    } else {
      document.body.style.border = 'none';
      document.body.style.boxShadow = 'none';
    }

    return () => {
      document.body.style.border = 'none';
      document.body.style.boxShadow = 'none';
    };
  }, [isSuspended]);

  if (!isSuspended && !data?.globalMessage) return null;

  if (!isSuspended && data?.globalMessage) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        background: '#ef4444',
        color: 'white',
        padding: '0.5rem',
        textAlign: 'center',
        zIndex: 99999,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        {data.globalMessage}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textAlign: 'center',
      pointerEvents: 'none' // Allows clicking underneath if strictly necessary for directors, but visually locks UI
    }}>
      <ShieldAlert size={64} style={{ color: '#ef4444', marginBottom: '1rem' }} />
      <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '2px', color: '#ef4444', margin: '0 0 1rem 0' }}>
        TEMPORARY SUSPENSION
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#fca5a5', maxWidth: '600px' }}>
        {data?.message || 'All matches are currently halted. Please await further instructions from the Tournament Delegate.'}
      </p>
      
      <div style={{ marginTop: '2rem', padding: '1rem 2rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px' }}>
        <strong>Referees:</strong> Await the "Ready-Up" signal before resuming play.
      </div>
    </div>
  );
}

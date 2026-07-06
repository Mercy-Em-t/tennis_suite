'use client';

import React, { useState } from 'react';
import { Tv, Zap } from 'lucide-react';
import { useTournamentContext } from '@/lib/context/TournamentContext';

export function BroadcastQualityAlert() {
  const { activeTournamentId } = useTournamentContext();
  const [alertType, setAlertType] = useState('MISSING_TELEMETRY');
  const [details, setDetails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSendAlert = async () => {
    if (!details) return;
    setIsProcessing(true);
    setMsg('');
    
    try {
      const res = await fetch('/api/director/broadcast-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tournamentId: activeTournamentId,
          alertType,
          details
        })
      });
      const data = await res.json();
      
      if (data.error) setMsg(`Error: ${data.error}`);
      else {
        setMsg('Quality Alert pushed to production lead.');
        setDetails('');
      }
    } catch (err) {
      setMsg('Failed to send broadcast alert.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ background: '#1f2937', padding: '1.5rem', borderRadius: '12px', color: 'white', maxWidth: '500px', border: '1px solid #374151' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#c084fc' }}>
        <Tv size={24} />
        <h3 style={{ margin: 0 }}>BROADCAST QUALITY CONTROL</h3>
      </div>
      
      <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Issue direct technical alerts to the television production truck if the external feed is failing to meet tournament standards.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <select 
          value={alertType} 
          onChange={e => setAlertType(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563' }}
        >
          <option value="MISSING_TELEMETRY">Missing Speed Gun / Sensor Data</option>
          <option value="AUDIO_SYNC">Audio Desynchronization</option>
          <option value="GRAPHIC_ERROR">On-Screen Graphic Error</option>
          <option value="FEED_DROPOUT">Signal Degradation / Dropout</option>
        </select>
        
        <input 
          type="text" 
          placeholder="Specific details (e.g. Court 3 radar gun feed is frozen)" 
          value={details} 
          onChange={e => setDetails(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563' }}
        />
      </div>

      <button
        onClick={handleSendAlert}
        disabled={isProcessing || !details}
        style={{
          width: '100%', background: '#c084fc', color: 'white', border: 'none',
          padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          cursor: isProcessing || !details ? 'not-allowed' : 'pointer',
          opacity: isProcessing || !details ? 0.5 : 1
        }}
      >
        <Zap size={18} />
        {isProcessing ? 'PUSHING ALERT...' : 'ISSUE QUALITY ALERT'}
      </button>

      {msg && (
        <div style={{ marginTop: '1rem', color: msg.includes('Error') ? '#ef4444' : '#10b981', fontSize: '0.85rem', textAlign: 'center' }}>
          {msg}
        </div>
      )}
    </div>
  );
}

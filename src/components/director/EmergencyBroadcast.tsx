'use client';

import React, { useState } from 'react';
import { Mic, Send, AlertTriangle } from 'lucide-react';
import { useTournamentContext } from '@/lib/context/TournamentContext';

export function EmergencyBroadcast() {
  const { activeTournamentId } = useTournamentContext();
  const [message, setMessage] = useState('');
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const templates = [
    "Attention: Please suspend play and head to the clubhouse.",
    "Tournament play is delayed by 60 minutes.",
    "Facility evacuation in progress. Follow Marshal instructions.",
    "Matches moved to Indoor Courts due to rain."
  ];

  const handleSend = async () => {
    if (!message) return;
    setIsSending(true);
    
    try {
      await fetch('/api/director/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: activeTournamentId, message, isPushEnabled })
      });
      setMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ background: '#1f2937', padding: '2rem', borderRadius: '12px', color: 'white', maxWidth: '600px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#ef4444' }}>
        <Mic size={24} />
        <h2 style={{ margin: 0 }}>PUBLIC ADDRESS SYSTEM</h2>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>Quick Templates</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {templates.map((tmpl, idx) => (
            <button 
              key={idx}
              onClick={() => setMessage(tmpl)}
              style={{
                background: '#374151', border: '1px solid #4b5563', color: 'white',
                padding: '0.75rem', borderRadius: '4px', textAlign: 'left', cursor: 'pointer'
              }}
            >
              {tmpl}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>Custom Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input 
          type="checkbox" 
          id="pushCheckbox" 
          checked={isPushEnabled} 
          onChange={(e) => setIsPushEnabled(e.target.checked)}
          style={{ width: '1.2rem', height: '1.2rem' }}
        />
        <label htmlFor="pushCheckbox" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
          <AlertTriangle size={16} /> Urgent: Also push to Player Mobile App
        </label>
      </div>

      <button
        onClick={handleSend}
        disabled={isSending || !message}
        style={{
          width: '100%', background: '#3b82f6', color: 'white', border: 'none',
          padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          cursor: isSending || !message ? 'not-allowed' : 'pointer',
          opacity: isSending || !message ? 0.5 : 1
        }}
      >
        <Send size={20} />
        {isSending ? 'DISPATCHING...' : 'BROADCAST MESSAGE'}
      </button>
    </div>
  );
}

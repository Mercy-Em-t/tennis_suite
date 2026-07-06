'use client';

import React, { useState } from 'react';
import { UserX, AlertOctagon } from 'lucide-react';

export function DisqualificationPanel() {
  const [teamId, setTeamId] = useState('');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState('');

  const handleDisqualify = async () => {
    if (!teamId || !reason) return;
    
    // Aggressive confirmation lock
    if (!window.confirm(`CRITICAL WARNING: You are about to permanently disqualify Team ${teamId}. This will automatically award walkovers to all their scheduled opponents and cannot be easily undone. Proceed?`)) {
      return;
    }

    setIsProcessing(true);
    setMsg('');
    
    try {
      const res = await fetch('/api/director/disqualify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, reason })
      });
      const data = await res.json();
      
      if (data.error) setMsg(`Error: ${data.error}`);
      else {
        setMsg(`SUCCESS: Team ${teamId} has been disqualified and removed from active brackets.`);
        setTeamId('');
        setReason('');
      }
    } catch (err) {
      setMsg('Failed to process disqualification.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ background: '#1f2937', padding: '2rem', borderRadius: '12px', color: 'white', maxWidth: '600px', border: '1px solid #7f1d1d' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#ef4444' }}>
        <UserX size={28} />
        <h2 style={{ margin: 0 }}>FORMAL DISQUALIFICATION</h2>
      </div>

      <div style={{ background: '#7f1d1d', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <AlertOctagon size={24} color="#fca5a5" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#fca5a5', lineHeight: '1.4' }}>
          This is a definitive Delegate action. Executing this will instantly fail the target team, award a "Walkover" victory to any current or scheduled opponents, and stamp the permanent audit log.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>Target Team ID</label>
          <input 
            type="text" 
            placeholder="e.g. tm_1042" 
            value={teamId} 
            onChange={e => setTeamId(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>Official Ruling / Reason</label>
          <input 
            type="text" 
            placeholder="e.g. Unsportsmanlike Conduct (Rule 4.2)" 
            value={reason} 
            onChange={e => setReason(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563' }}
          />
        </div>
      </div>

      <button
        onClick={handleDisqualify}
        disabled={isProcessing || !teamId || !reason}
        style={{
          width: '100%', background: '#b91c1c', color: 'white', border: 'none',
          padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold',
          cursor: isProcessing || !teamId || !reason ? 'not-allowed' : 'pointer',
          opacity: isProcessing || !teamId || !reason ? 0.5 : 1
        }}
      >
        {isProcessing ? 'EXECUTING RULING...' : 'ENFORCE DISQUALIFICATION'}
      </button>

      {msg && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#111827', border: '1px solid #374151', borderRadius: '4px', textAlign: 'center', color: msg.includes('SUCCESS') ? '#10b981' : '#ef4444' }}>
          {msg}
        </div>
      )}
    </div>
  );
}

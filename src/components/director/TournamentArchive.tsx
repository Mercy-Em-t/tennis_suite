'use client';

import React, { useState } from 'react';
import { Archive, Lock } from 'lucide-react';
import { useTournamentContext } from '@/lib/context/TournamentContext';

export function TournamentArchive() {
  const { activeTournamentId } = useTournamentContext();
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState('');

  const handleArchive = async () => {
    if (confirmText !== 'ARCHIVE' || !reason) return;
    setIsProcessing(true);
    setMsg('');
    
    try {
      const res = await fetch('/api/director/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: activeTournamentId, reason })
      });
      const data = await res.json();
      
      if (data.error) setMsg(`Error: ${data.error}`);
      else setMsg('THE GOLDEN SEAL: Tournament successfully archived and locked. No further modifications can be made.');
    } catch (err) {
      setMsg('Failed to archive tournament.');
    } finally {
      setIsProcessing(false);
      setConfirmText('');
    }
  };

  return (
    <div style={{ background: '#1f2937', padding: '2rem', borderRadius: '12px', color: 'white', maxWidth: '600px', border: '2px dashed #4b5563' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#60a5fa' }}>
        <Archive size={28} />
        <h2 style={{ margin: 0 }}>TOURNAMENT CLOSURE & ARCHIVE</h2>
      </div>

      <p style={{ color: '#9ca3af', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
        This is the "Golden Seal." Initiating this process will verify that all matches are complete, generate the final PDF report, and permanently lock the database. <strong>Once locked, this tournament cannot be reopened.</strong>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>Closure Note (For the final audit log)</label>
          <input 
            type="text" 
            placeholder="e.g. All matches complete. Final payouts issued." 
            value={reason} 
            onChange={e => setReason(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ef4444', fontSize: '0.9rem', fontWeight: 'bold' }}>
            Type "ARCHIVE" to unlock the seal
          </label>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="ARCHIVE" 
              value={confirmText} 
              onChange={e => setConfirmText(e.target.value.toUpperCase())}
              style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', borderRadius: '4px', background: '#111827', color: 'white', border: `1px solid ${confirmText === 'ARCHIVE' ? '#10b981' : '#4b5563'}` }}
            />
            <Lock size={18} color={confirmText === 'ARCHIVE' ? '#10b981' : '#9ca3af'} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>
      </div>

      <button
        onClick={handleArchive}
        disabled={isProcessing || confirmText !== 'ARCHIVE' || !reason}
        style={{
          width: '100%', background: '#2563eb', color: 'white', border: 'none',
          padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold',
          cursor: isProcessing || confirmText !== 'ARCHIVE' || !reason ? 'not-allowed' : 'pointer',
          opacity: isProcessing || confirmText !== 'ARCHIVE' || !reason ? 0.5 : 1
        }}
      >
        {isProcessing ? 'SEALING DATABASE...' : 'APPLY GOLDEN SEAL'}
      </button>

      {msg && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#111827', border: '1px solid #374151', borderRadius: '4px', textAlign: 'center', color: msg.includes('GOLDEN SEAL') ? '#10b981' : '#ef4444' }}>
          {msg}
        </div>
      )}
    </div>
  );
}

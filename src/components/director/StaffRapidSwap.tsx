'use client';

import React, { useState } from 'react';
import { UserCog, ArrowRightLeft } from 'lucide-react';
import { useTournamentContext } from '@/lib/context/TournamentContext';

export function StaffRapidSwap() {
  const { activeTournamentId } = useTournamentContext();
  const [courtId, setCourtId] = useState('');
  const [newRefereeId, setNewRefereeId] = useState('');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSwap = async () => {
    if (!courtId || !newRefereeId || !reason) return;
    setIsProcessing(true);
    setMsg('');
    
    try {
      const res = await fetch('/api/director/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tournamentId: activeTournamentId,
          courtId,
          refereeId: newRefereeId,
          reason
        })
      });
      const data = await res.json();
      
      if (data.error) setMsg(`Error: ${data.error}`);
      else {
        setMsg(`SUCCESS: Staff assigned to Court ${courtId} has been updated.`);
        setCourtId(''); setNewRefereeId(''); setReason('');
      }
    } catch (err) {
      setMsg('Failed to reassign staff.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ background: '#1f2937', padding: '1.5rem', borderRadius: '12px', color: 'white', maxWidth: '500px', border: '1px solid #374151' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#10b981' }}>
        <UserCog size={24} />
        <h3 style={{ margin: 0 }}>STAFF RAPID SWAP</h3>
      </div>
      
      <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Instantly override personnel assignments. The new official will immediately receive digital tablet access for the designated court.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Court ID (e.g. C1)" 
            value={courtId} 
            onChange={e => setCourtId(e.target.value)}
            style={{ width: '120px', padding: '0.75rem', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563' }}
          />
          <ArrowRightLeft size={20} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="New Referee ID (e.g. R_402)" 
            value={newRefereeId} 
            onChange={e => setNewRefereeId(e.target.value)}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563' }}
          />
        </div>
        <input 
          type="text" 
          placeholder="Reason (e.g. Medical Emergency, Shift Change)" 
          value={reason} 
          onChange={e => setReason(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563' }}
        />
      </div>

      <button
        onClick={handleSwap}
        disabled={isProcessing || !courtId || !newRefereeId || !reason}
        style={{
          width: '100%', background: '#10b981', color: 'white', border: 'none',
          padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold',
          cursor: isProcessing || !courtId || !newRefereeId || !reason ? 'not-allowed' : 'pointer',
          opacity: isProcessing || !courtId || !newRefereeId || !reason ? 0.5 : 1
        }}
      >
        {isProcessing ? 'UPDATING ASSIGNMENT...' : 'EXECUTE RAPID SWAP'}
      </button>

      {msg && (
        <div style={{ marginTop: '1rem', color: msg.includes('Error') ? '#ef4444' : '#10b981', fontSize: '0.85rem', textAlign: 'center' }}>
          {msg}
        </div>
      )}
    </div>
  );
}

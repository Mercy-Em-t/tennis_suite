'use client';

import React, { useState } from 'react';
import { Undo2, AlertTriangle } from 'lucide-react';
import { useTournamentContext } from '@/lib/context/TournamentContext';

export function MassRefundTrigger() {
  const { activeTournamentId } = useTournamentContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleMassRefund = async () => {
    if (!isConfirmed) return;
    setIsProcessing(true);
    setMsg('');
    
    try {
      // Hitting the ledger API with a custom mock action for demonstration
      const res = await fetch('/api/director/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tournamentId: activeTournamentId,
          action: 'MASS_REFUND', 
          amount: 0,
          details: `Global CANCELLATION refund issued to all participants.`
        })
      });
      const data = await res.json();
      
      if (data.error) setMsg(`Error: ${data.error}`);
      else setMsg('SUCCESS: Mass refund batch processing initiated.');
    } catch (err) {
      setMsg('Failed to process mass refund.');
    } finally {
      setIsProcessing(false);
      setIsConfirmed(false); // Reset lock
    }
  };

  return (
    <div style={{ background: '#1f2937', padding: '2rem', borderRadius: '12px', color: 'white', maxWidth: '600px', border: '1px solid #374151' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#f59e0b' }}>
        <Undo2 size={28} />
        <h2 style={{ margin: 0 }}>TRANSACTION RECONCILIATION</h2>
      </div>

      <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
        Use this protocol only when a tournament has been permanently canceled (e.g., severe weather). This will query the user ledger and automatically reverse all entry fees back to the original payment methods.
      </p>

      <div style={{ background: '#111827', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <input 
          type="checkbox" 
          id="confirmRefund" 
          checked={isConfirmed}
          onChange={e => setIsConfirmed(e.target.checked)}
          style={{ width: '1.5rem', height: '1.5rem' }}
        />
        <label htmlFor="confirmRefund" style={{ color: '#fca5a5', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} /> I confirm that this event is canceled and authorize the release of all funds.
        </label>
      </div>

      <button
        onClick={handleMassRefund}
        disabled={isProcessing || !isConfirmed}
        style={{
          width: '100%', background: '#b45309', color: 'white', border: 'none',
          padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold',
          cursor: isProcessing || !isConfirmed ? 'not-allowed' : 'pointer',
          opacity: isProcessing || !isConfirmed ? 0.5 : 1
        }}
      >
        {isProcessing ? 'PROCESSING BATCH REFUND...' : 'INITIATE MASS REFUND'}
      </button>

      {msg && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#111827', border: '1px solid #374151', borderRadius: '4px', textAlign: 'center', color: msg.includes('SUCCESS') ? '#10b981' : '#ef4444' }}>
          {msg}
        </div>
      )}
    </div>
  );
}

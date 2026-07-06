'use client';

import React, { useState } from 'react';
import { DollarSign, AlertCircle, Unlock, Search } from 'lucide-react';
import { useTournamentContext } from '@/lib/context/TournamentContext';

export function FinancialLedger() {
  const { activeTournamentId } = useTournamentContext();
  const [teamId, setTeamId] = useState('');
  const [fineAmount, setFineAmount] = useState('');
  const [fineReason, setFineReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState('');

  // Mock data for the dashboard metrics
  const metrics = {
    totalEntryFees: 25000,
    totalFinesCollected: 1200,
    netPrizePool: 26200,
  };

  const handleApplyFine = async () => {
    if (!teamId || !fineAmount || !fineReason) return;
    setIsProcessing(true);
    setMsg('');
    
    try {
      const res = await fetch('/api/director/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tournamentId: activeTournamentId,
          action: 'FINE_DEDUCTION', 
          amount: parseFloat(fineAmount),
          details: `Team ${teamId}: ${fineReason}`
        })
      });
      const data = await res.json();
      if (data.error) setMsg(`Error: ${data.error}`);
      else {
        setMsg('Fine successfully applied to ledger.');
        setTeamId(''); setFineAmount(''); setFineReason('');
      }
    } catch (err) {
      setMsg('Failed to process fine.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlockPayouts = async () => {
    setIsProcessing(true);
    setMsg('');
    try {
      const res = await fetch('/api/director/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: activeTournamentId })
      });
      const data = await res.json();
      if (data.error) setMsg(`Error: ${data.error}`);
      else setMsg('Prize pool unlocked for distribution.');
    } catch (err) {
      setMsg('Failed to unlock payouts.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ background: '#1f2937', padding: '2rem', borderRadius: '12px', color: 'white', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: '#10b981' }}>
        <DollarSign size={28} />
        <h2 style={{ margin: 0 }}>FINANCIAL LEDGER</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#111827', padding: '1.5rem', borderRadius: '8px', border: '1px solid #374151', textAlign: 'center' }}>
          <div style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Entry Fees</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${metrics.totalEntryFees.toLocaleString()}</div>
        </div>
        <div style={{ background: '#111827', padding: '1.5rem', borderRadius: '8px', border: '1px solid #374151', textAlign: 'center' }}>
          <div style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Fines Collected</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${metrics.totalFinesCollected.toLocaleString()}</div>
        </div>
        <div style={{ background: '#111827', padding: '1.5rem', borderRadius: '8px', border: '1px solid #10b981', textAlign: 'center', color: '#10b981' }}>
          <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Net Prize Pool</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${metrics.netPrizePool.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ background: '#374151', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} color="#ef4444" /> Apply Fine / Deduction
        </h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input 
            type="text" placeholder="Team/Player ID" value={teamId} onChange={e => setTeamId(e.target.value)}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563' }}
          />
          <input 
            type="number" placeholder="Amount ($)" value={fineAmount} onChange={e => setFineAmount(e.target.value)}
            style={{ width: '150px', padding: '0.75rem', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563' }}
          />
        </div>
        <input 
          type="text" placeholder="Reason (e.g. Code Violation, Mid-Tournament Disqualification)" value={fineReason} onChange={e => setFineReason(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563', marginBottom: '1rem' }}
        />
        <button onClick={handleApplyFine} disabled={isProcessing || !teamId || !fineAmount || !fineReason} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
          Deduct from Ledger
        </button>
      </div>

      <div style={{ borderTop: '1px solid #374151', paddingTop: '2rem' }}>
        <button onClick={handleUnlockPayouts} disabled={isProcessing} style={{ width: '100%', background: '#10b981', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
          <Unlock size={20} /> UNLOCK FINAL PAYOUTS
        </button>
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          *This action requires the Tournament Host to have verified all final matches.
        </p>
      </div>

      {msg && <div style={{ marginTop: '1rem', padding: '1rem', background: '#111827', border: '1px solid #3b82f6', borderRadius: '4px', textAlign: 'center' }}>{msg}</div>}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { EyeOff, FileText } from 'lucide-react';
import { useTournamentContext } from '@/lib/context/TournamentContext';

export function SponsorVisibilityTracker() {
  const { activeTournamentId } = useTournamentContext();
  const [sponsorName, setSponsorName] = useState('');
  const [outageDuration, setOutageDuration] = useState('');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState('');

  const handleLogOutage = async () => {
    if (!sponsorName || !outageDuration || !reason) return;
    setIsProcessing(true);
    setMsg('');
    
    try {
      const res = await fetch('/api/director/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tournamentId: activeTournamentId,
          action: 'SPONSOR_ADJUSTMENT', 
          amount: 0, // Logic: The actual financial penalty is calculated during post-tournament billing based on the duration metric.
          details: `VISIBILITY OUTAGE: ${sponsorName} - ${outageDuration} mins. Reason: ${reason}`
        })
      });
      const data = await res.json();
      
      if (data.error) setMsg(`Error: ${data.error}`);
      else {
        setMsg('Outage metric successfully logged to financial ledger for reconciliation.');
        setSponsorName(''); setOutageDuration(''); setReason('');
      }
    } catch (err) {
      setMsg('Failed to log visibility metric.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ background: '#1f2937', padding: '1.5rem', borderRadius: '12px', color: 'white', maxWidth: '500px', border: '1px solid #374151' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#60a5fa' }}>
        <EyeOff size={24} />
        <h3 style={{ margin: 0 }}>SPONSOR VISIBILITY TRACKER</h3>
      </div>
      
      <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Log technical glitches that disrupted sponsor branding on the broadcast feed. These metrics are appended to the ledger for post-tournament billing adjustments.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Sponsor Name (e.g. Rolex)" 
          value={sponsorName} 
          onChange={e => setSponsorName(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563' }}
        />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="number" 
            placeholder="Duration (Mins)" 
            value={outageDuration} 
            onChange={e => setOutageDuration(e.target.value)}
            style={{ width: '150px', padding: '0.75rem', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563' }}
          />
          <input 
            type="text" 
            placeholder="Reason (e.g. Graphic Engine Failure)" 
            value={reason} 
            onChange={e => setReason(e.target.value)}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563' }}
          />
        </div>
      </div>

      <button
        onClick={handleLogOutage}
        disabled={isProcessing || !sponsorName || !outageDuration || !reason}
        style={{
          width: '100%', background: '#3b82f6', color: 'white', border: 'none',
          padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          cursor: isProcessing || !sponsorName || !outageDuration || !reason ? 'not-allowed' : 'pointer',
          opacity: isProcessing || !sponsorName || !outageDuration || !reason ? 0.5 : 1
        }}
      >
        <FileText size={18} />
        {isProcessing ? 'LOGGING METRIC...' : 'LOG OUTAGE TO LEDGER'}
      </button>

      {msg && (
        <div style={{ marginTop: '1rem', color: msg.includes('Error') ? '#ef4444' : '#10b981', fontSize: '0.85rem', textAlign: 'center' }}>
          {msg}
        </div>
      )}
    </div>
  );
}

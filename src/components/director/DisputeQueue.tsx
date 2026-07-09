'use client';

import React, { useState } from 'react';
import { ShieldAlert, Gavel, Radio, CheckCircle } from 'lucide-react';
import { useTournamentContext } from '@/lib/context/TournamentContext';

interface MockIncident {
  id: string;
  matchId: string;
  court: string;
  referee: string;
  reason: string;
  timestamp: string;
}

export function DisputeQueue() {
  const { activeTournamentId } = useTournamentContext();
  const [incidents, setIncidents] = useState<MockIncident[]>([
    { id: 'inc_01', matchId: 'm_102', court: 'Court 1', referee: 'John Doe', reason: 'Aggressive behavior / Code Violation dispute', timestamp: '10:42 AM' },
    { id: 'inc_02', matchId: 'm_105', court: 'Court 4', referee: 'Jane Smith', reason: 'Line call override requested by player', timestamp: '10:45 AM' },
  ]);
  const [activeIncident, setActiveIncident] = useState<MockIncident | null>(null);
  const [rulingNotes, setRulingNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEnforceRuling = async () => {
    if (!activeIncident || !rulingNotes) return;
    setIsProcessing(true);
    
    try {
      const res = await fetch('/api/director/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tournamentId: activeTournamentId,
          incidentId: activeIncident.id,
          resolutionNotes: rulingNotes,
          actionTaken: 'RESOLVED_BY_DELEGATE'
        })
      });
      const data = await res.json();
      if (!data.error) {
        setIncidents(incidents.filter(i => i.id !== activeIncident.id));
        setActiveIncident(null);
        setRulingNotes('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', height: '600px', maxWidth: '1000px', color: 'white' }}>
      
      {/* LEFT PANEL: Queue */}
      <div style={{ flex: '1', background: '#1f2937', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#ef4444' }}>
          <ShieldAlert size={24} />
          <h2 style={{ margin: 0 }}>ESCALATION QUEUE</h2>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {incidents.length === 0 ? (
            <div style={{ color: '#9ca3af', textAlign: 'center', marginTop: '2rem' }}>No active disputes.</div>
          ) : (
            incidents.map(inc => (
              <div 
                key={inc.id} 
                onClick={() => setActiveIncident(inc)}
                style={{
                  background: activeIncident?.id === inc.id ? '#374151' : '#111827',
                  border: `1px solid ${activeIncident?.id === inc.id ? '#ef4444' : '#374151'}`,
                  padding: '1rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#fca5a5' }}>{inc.court}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{inc.timestamp}</span>
                </div>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Ref: {inc.referee}</div>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{inc.reason}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Mediation & Action */}
      <div style={{ flex: '1.5', background: '#1f2937', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        {!activeIncident ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
            Select an incident to mediate.
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #374151' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Incident: {activeIncident.id}</h3>
              <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{activeIncident.reason}</div>
            </div>

            {/* Simulated Radio Chat */}
            <div style={{ flex: 1, background: '#111827', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 'bold' }}>
                <Radio size={16} /> RADIO CHANNEL OPEN: {activeIncident.referee}
              </div>
              <div style={{ background: '#374151', padding: '0.75rem', borderRadius: '8px', alignSelf: 'flex-start', maxWidth: '80%' }}>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{activeIncident.referee}</div>
                "Delegate, I need you on Court 1. Player is refusing to play after a code violation for racquet abuse. Needs final ruling."
              </div>
              <div style={{ background: '#3b82f6', padding: '0.75rem', borderRadius: '8px', alignSelf: 'flex-end', maxWidth: '80%' }}>
                <div style={{ fontSize: '0.75rem', color: '#93c5fd', marginBottom: '0.25rem' }}>You (Delegate)</div>
                "Copy that. I am reviewing the log now."
              </div>
            </div>

            {/* Final Ruling Form */}
            <div>
              <label style={{ marginBottom: '0.5rem', color: '#fca5a5', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Gavel size={18} /> OFFICIAL RULING
              </label>
              <textarea
                value={rulingNotes}
                onChange={(e) => setRulingNotes(e.target.value)}
                placeholder="Enter final decision to be logged and sent to scoreboard..."
                rows={3}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563', marginBottom: '1rem' }}
              />
              <button
                onClick={handleEnforceRuling}
                disabled={isProcessing || !rulingNotes}
                style={{
                  width: '100%', background: '#ef4444', color: 'white', border: 'none',
                  padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  cursor: isProcessing || !rulingNotes ? 'not-allowed' : 'pointer',
                  opacity: isProcessing || !rulingNotes ? 0.5 : 1
                }}
              >
                <CheckCircle size={20} /> ENFORCE RULING & CLOSE DISPUTE
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

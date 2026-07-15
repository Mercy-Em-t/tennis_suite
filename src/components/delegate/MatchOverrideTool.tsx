'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function MatchOverrideTool({ tournamentId }: { tournamentId?: string }) {
  const [matchId, setMatchId] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // We could fetch a list of completed matches if tournamentId is provided, 
  // but for a global crisis tool, allowing direct matchId input is very powerful.
  // We'll also fetch the match details if a matchId is entered.
  const { data: matchData, error: matchError } = useSWR(
    matchId.length > 5 ? `/api/tournaments/${tournamentId || 'all'}/matches/${matchId}` : null,
    fetcher
  );

  const match = matchData?.match;

  const handleOverride = async (newWinnerId: string) => {
    if (!reason) {
      setErrorMsg('You must provide a reason for the Audit Log.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/delegate/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, newWinnerId, reason })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(`Match successfully overridden. Winner is now ${newWinnerId === match.teamAId ? match.teamA?.franchiseName : match.teamB?.franchiseName}.`);
        setReason('');
      } else {
        setErrorMsg(data.error || 'Failed to override match.');
      }
    } catch (err) {
      setErrorMsg('Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card style={{ background: '#161b22', border: '1px solid #ef4444', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#ef4444' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '1.5rem' }}>⚖️</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>Dispute Resolution (God Mode)</h3>
          <p style={{ margin: 0, color: '#8b949e', fontSize: '0.875rem' }}>Override COMPLETED match results.</p>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#c9d1d9', textTransform: 'uppercase', marginBottom: '8px' }}>Target Match ID</label>
        <input 
          type="text" 
          value={matchId} 
          onChange={(e) => setMatchId(e.target.value)} 
          placeholder="Enter Match ID to inspect..."
          style={{ width: '100%', padding: '10px 14px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontFamily: 'monospace' }}
        />
      </div>

      <AnimatePresence mode="wait">
        {matchId.length > 5 && !match && !matchError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: '#8b949e', fontSize: '0.875rem' }}>
            Locating match...
          </motion.div>
        )}

        {match && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', color: '#8b949e', fontWeight: 600, textTransform: 'uppercase' }}>Current Status: <span style={{ color: match.status === 'COMPLETED' ? '#3fb950' : '#d2a8ff' }}>{match.status}</span></span>
              {match.winnerId && <span style={{ fontSize: '0.75rem', color: '#e3b341', fontWeight: 600, textTransform: 'uppercase' }}>Winner: {match.winnerId === match.teamAId ? match.teamA?.franchiseName : match.teamB?.franchiseName}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', padding: '12px', background: match.winnerId === match.teamAId ? 'rgba(63,185,80,0.1)' : 'rgba(255,255,255,0.02)', borderRadius: '6px', border: match.winnerId === match.teamAId ? '1px solid #3fb950' : '1px solid transparent' }}>
                <strong style={{ display: 'block', color: '#fff', marginBottom: '8px' }}>{match.teamA?.franchiseName || 'Team A'}</strong>
                <Button variant="secondary" size="sm" onClick={() => handleOverride(match.teamAId)} disabled={isSubmitting || match.winnerId === match.teamAId || match.status !== 'COMPLETED'}>
                  {match.winnerId === match.teamAId ? 'Current Winner' : 'Force Win'}
                </Button>
              </div>

              <span style={{ color: '#8b949e', fontWeight: 700 }}>VS</span>

              <div style={{ textAlign: 'center', padding: '12px', background: match.winnerId === match.teamBId ? 'rgba(63,185,80,0.1)' : 'rgba(255,255,255,0.02)', borderRadius: '6px', border: match.winnerId === match.teamBId ? '1px solid #3fb950' : '1px solid transparent' }}>
                <strong style={{ display: 'block', color: '#fff', marginBottom: '8px' }}>{match.teamB?.franchiseName || 'Team B'}</strong>
                <Button variant="secondary" size="sm" onClick={() => handleOverride(match.teamBId)} disabled={isSubmitting || match.winnerId === match.teamBId || match.status !== 'COMPLETED'}>
                  {match.winnerId === match.teamBId ? 'Current Winner' : 'Force Win'}
                </Button>
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#f85149', textTransform: 'uppercase', marginBottom: '8px' }}>Mandatory Audit Reason</label>
              <input 
                type="text" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                placeholder="e.g. Umpire error on match point..."
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(248,81,73,0.05)', border: '1px solid rgba(248,81,73,0.3)', color: '#fff', borderRadius: '6px', fontSize: '0.875rem' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {errorMsg && <div style={{ color: '#f85149', fontSize: '0.875rem', marginTop: '12px', padding: '12px', background: 'rgba(248,81,73,0.1)', borderRadius: '6px' }}>{errorMsg}</div>}
      {successMsg && <div style={{ color: '#3fb950', fontSize: '0.875rem', marginTop: '12px', padding: '12px', background: 'rgba(63,185,80,0.1)', borderRadius: '6px' }}>{successMsg}</div>}
    </Card>
  );
}

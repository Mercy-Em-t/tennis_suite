'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { Settings, AlertTriangle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DelegateOverrideDashboard() {
  const [sandboxState, setSandboxState] = useState<any>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [justification, setJustification] = useState('');
  const [overrideSetsA, setOverrideSetsA] = useState(0);
  const [overrideSetsB, setOverrideSetsB] = useState(0);
  const [overrideWinnerId, setOverrideWinnerId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadSandbox = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sandbox/delegate');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSandboxState(data);
      
      // Fetch initial match state
      const matchRes = await fetch(`/api/matches/${data.matchId}`);
      if (matchRes.ok) {
        const matchInfo = await matchRes.json();
        setMatchData(matchInfo);
        if (matchInfo.scoreState) {
          try {
            const s = JSON.parse(matchInfo.scoreState);
            setOverrideSetsA(s.setsA);
            setOverrideSetsB(s.setsB);
          } catch(e){}
        }
        setOverrideWinnerId(matchInfo.winnerId || '');
      }

      // Fetch audit logs
      const auditRes = await fetch(`/api/matches/${data.matchId}/audit`);
      if (auditRes.ok) {
        setAuditLogs(await auditRes.json());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSandbox();
  }, []);

  // Listen to Match Updates and Audit Logs
  useEffect(() => {
    if (!sandboxState?.matchId) return;
    
    // Match updates
    const matchEs = new EventSource(`/api/matches/${sandboxState.matchId}/stream`);
    matchEs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update' && data.match) {
        setMatchData(data.match);
      }
    };

    return () => matchEs.close();
  }, [sandboxState?.matchId]);

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (justification.trim().length < 10) {
      setError('Justification must be at least 10 characters.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Keep games and points as 0 for this test override, just alter sets.
      const newScoreState = JSON.stringify({
        setsA: overrideSetsA,
        setsB: overrideSetsB,
        gamesA: 0,
        gamesB: 0,
        pointsA: "0",
        pointsB: "0"
      });

      const res = await fetch('/api/delegate/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: sandboxState.matchId,
          delegateId: sandboxState.delegateId,
          justification,
          scoreState: newScoreState,
          winnerId: overrideWinnerId,
          status: 'COMPLETED'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg('Override successful. Standings have been recalculated.');
      setJustification(''); // Reset form
      
      // Refresh audit logs
      const auditRes = await fetch(`/api/matches/${sandboxState.matchId}/audit`);
      if (auditRes.ok) setAuditLogs(await auditRes.json());

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '48px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px', color: '#ff7b72' }}>
            <Settings size={36} />
            Delegate God-Mode
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>
            Redundant Verification & Master Override
          </p>
        </div>
        <DynamicButton variant="outline" onClick={loadSandbox} disabled={loading || submitting}>
          Reset Match Data
        </DynamicButton>
      </header>

      {error && (
        <div style={{ background: 'rgba(248,81,73,0.1)', color: '#ff7b72', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(248,81,73,0.2)' }}>
          {error}
        </div>
      )}
      
      {successMsg && (
        <div style={{ background: 'rgba(46,160,67,0.1)', color: 'var(--success)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(46,160,67,0.2)' }}>
          {successMsg}
        </div>
      )}

      {!sandboxState ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <Card style={{ padding: '32px', background: '#161b22', border: '1px solid #ff7b72' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#ff7b72' }}>
                <AlertTriangle size={24} />
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Force Mutation</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                WARNING: Overriding this match will forcefully cascade through the Automaton Engine and recalculate pool standings globally.
              </p>
              
              <form onSubmit={handleOverrideSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#fff' }}>{matchData?.teamA?.franchiseName} Sets</label>
                    <input 
                      type="number" 
                      min="0"
                      value={overrideSetsA}
                      onChange={(e) => setOverrideSetsA(Number(e.target.value))}
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#fff' }}>{matchData?.teamB?.franchiseName} Sets</label>
                    <input 
                      type="number" 
                      min="0"
                      value={overrideSetsB}
                      onChange={(e) => setOverrideSetsB(Number(e.target.value))}
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#fff' }}>Force Winner</label>
                  <select 
                    value={overrideWinnerId}
                    onChange={(e) => setOverrideWinnerId(e.target.value)}
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  >
                    <option value={matchData?.teamAId}>{matchData?.teamA?.franchiseName}</option>
                    <option value={matchData?.teamBId}>{matchData?.teamB?.franchiseName}</option>
                  </select>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#fff' }}>
                    Mandatory Justification <span style={{ color: '#ff7b72' }}>*</span>
                  </label>
                  <textarea 
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="e.g. Umpire incorrectly logged the final set."
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', minHeight: '100px' }}
                  />
                </div>

                <DynamicButton 
                  type="submit"
                  variant="primary" 
                  disabled={submitting || justification.trim().length < 10}
                  style={{ width: '100%', padding: '16px', fontSize: '1.1rem', background: '#ff7b72', color: '#000', fontWeight: 700 }}
                >
                  {submitting ? 'Cascading Mutation...' : 'Execute Override Transaction'}
                </DynamicButton>
              </form>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <Card style={{ padding: '24px', background: '#161b22', border: '1px solid rgba(255,255,255,0.05)', maxHeight: '600px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <FileText size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Immutable Audit Trail</h2>
              </div>
              
              {auditLogs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No logs recorded for this match.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <AnimatePresence>
                    {auditLogs.map(log => (
                      <motion.div 
                        key={log.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: '4px solid #ff7b72' }}
                      >
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                        <div style={{ fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                          {log.action}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#c9d1d9', wordBreak: 'break-word' }}>
                          {JSON.parse(log.details).justification}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </Card>
          </div>
          
        </div>
      )}

    </div>
  );
}

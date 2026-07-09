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
    <div >
      
      <header >
        <div>
          <h1 >
            <Settings size={36} />
            Delegate God-Mode
          </h1>
          <p >
            Redundant Verification & Master Override
          </p>
        </div>
        <DynamicButton variant="secondary" onClick={loadSandbox} disabled={loading || submitting}>
          Reset Match Data
        </DynamicButton>
      </header>

      {error && (
        <div >
          {error}
        </div>
      )}
      
      {successMsg && (
        <div >
          {successMsg}
        </div>
      )}

      {!sandboxState ? (
        <p>Loading...</p>
      ) : (
        <div >
          
          <div >
            <Card >
              <div >
                <AlertTriangle size={24} />
                <h2 >Force Mutation</h2>
              </div>
              <p >
                WARNING: Overriding this match will forcefully cascade through the Automaton Engine and recalculate pool standings globally.
              </p>
              
              <form onSubmit={handleOverrideSubmit}>
                <div >
                  <div>
                    <label >{matchData?.teamA?.franchiseName} Sets</label>
                    <input 
                      type="number" 
                      min="0"
                      value={overrideSetsA}
                      onChange={(e) => setOverrideSetsA(Number(e.target.value))}
                      
                    />
                  </div>
                  <div>
                    <label >{matchData?.teamB?.franchiseName} Sets</label>
                    <input 
                      type="number" 
                      min="0"
                      value={overrideSetsB}
                      onChange={(e) => setOverrideSetsB(Number(e.target.value))}
                      
                    />
                  </div>
                </div>

                <div >
                  <label >Force Winner</label>
                  <select 
                    value={overrideWinnerId}
                    onChange={(e) => setOverrideWinnerId(e.target.value)}
                    
                  >
                    <option value={matchData?.teamAId}>{matchData?.teamA?.franchiseName}</option>
                    <option value={matchData?.teamBId}>{matchData?.teamB?.franchiseName}</option>
                  </select>
                </div>

                <div >
                  <label >
                    Mandatory Justification <span >*</span>
                  </label>
                  <textarea 
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="e.g. Umpire incorrectly logged the final set."
                    
                  />
                </div>

                <DynamicButton 
                  type="submit"
                  variant="secondary" 
                  disabled={submitting || justification.trim().length < 10}
                  
                >
                  {submitting ? 'Cascading Mutation...' : 'Execute Override Transaction'}
                </DynamicButton>
              </form>
            </Card>
          </div>

          <div >
            <Card >
              <div >
                <FileText size={20} color="var(--primary)" />
                <h2 >Immutable Audit Trail</h2>
              </div>
              
              {auditLogs.length === 0 ? (
                <p >No logs recorded for this match.</p>
              ) : (
                <div >
                  <AnimatePresence>
                    {auditLogs.map(log => (
                      <motion.div 
                        key={log.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        
                      >
                        <div >
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                        <div >
                          {log.action}
                        </div>
                        <div >
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

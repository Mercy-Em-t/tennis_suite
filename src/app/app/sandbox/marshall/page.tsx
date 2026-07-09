'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarshallDispatcherSandbox() {
  const [sandboxState, setSandboxState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch Hardcoded State
  const loadSandbox = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sandbox/hardcode');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSandboxState(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSandbox();
  }, []);

  // 2. Dispatch the Match
  const handleDispatch = async () => {
    if (!sandboxState) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/tournaments/${sandboxState.tournamentId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: sandboxState.matchId,
          courtId: sandboxState.courtId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Update local state to reflect success
      setSandboxState((prev: any) => ({
        ...prev,
        match: data.match,
        court: data.court
      }));
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const S = {
    page: { padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' } as React.CSSProperties,
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '24px', marginBottom: '32px' } as React.CSSProperties,
    card: { background: '#161b22', border: '1px solid rgba(255,255,255,0.07)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div>
          <h1 >Marshall Dispatcher (Sandbox)</h1>
          <p >Test atomic dispatching to the Player Command Center.</p>
        </div>
        <DynamicButton variant="secondary" onClick={loadSandbox} disabled={loading}>
          Reset Sandbox
        </DynamicButton>
      </header>

      {error && (
        <div >
          {error}
        </div>
      )}

      {!sandboxState && loading ? (
        <p>Loading Sandbox...</p>
      ) : sandboxState ? (
        <div >
          
          <Card style={S.card}>
            <div >
              <h2 >Sandbox Match</h2>
              <Badge variant={sandboxState.match.status === 'READY' ? 'success' : 'default'}>
                {sandboxState.match.status}
              </Badge>
            </div>
            
            <div >
              <div >
                <span >Tournament</span>
                <span >{sandboxState.tournamentId}</span>
              </div>
              <div >
                <span >Target Court</span>
                <span >{sandboxState.court?.name || sandboxState.courtId}</span>
              </div>
              <div >
                <span >Court Status</span>
                <span >
                  {sandboxState.court?.status || 'IDLE'}
                </span>
              </div>
            </div>

            <AnimatePresence>
              {sandboxState.match.status === 'SCHEDULED' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <DynamicButton 
                    variant="secondary" 
                    
                    onClick={handleDispatch}
                    disabled={loading}
                  >
                    {loading ? 'Dispatching...' : 'Dispatch to Court'}
                  </DynamicButton>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {sandboxState.match.status === 'READY' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} >
              <h3 >Dispatch Successful!</h3>
              <p >The atomic transaction succeeded. The SSE payload should have been broadcasted to the Team sandbox.</p>
            </motion.div>
          )}

        </div>
      ) : null}
    </div>
  );
}

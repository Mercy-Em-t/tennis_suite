'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { Shield, ShieldAlert, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RefereeDelegator() {
  const [sandboxState, setSandboxState] = useState<any>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [delegating, setDelegating] = useState(false);
  const [error, setError] = useState('');

  const loadSandbox = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sandbox/play6ump');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSandboxState(data);
      // Fetch initial match state
      const matchRes = await fetch(`/api/matches/${data.matchId}`);
      if (matchRes.ok) {
        const matchInfo = await matchRes.json();
        setMatchData(matchInfo);
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

  // Listen to match updates to keep UI in sync
  useEffect(() => {
    if (!sandboxState?.matchId) return;
    const es = new EventSource(`/api/matches/${sandboxState.matchId}/stream`);
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update' && data.match) {
        setMatchData(data.match);
      }
    };
    return () => es.close();
  }, [sandboxState?.matchId]);

  const handleDelegate = async (action: 'ASSIGN' | 'REVOKE') => {
    if (!sandboxState) return;
    try {
      setDelegating(true);
      const res = await fetch(`/api/matches/${sandboxState.matchId}/delegate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          umpireId: sandboxState.playerId, 
          action 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // matchData is updated via SSE stream automatically!
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDelegating(false);
    }
  };

  const isDelegated = matchData?.umpireId === sandboxState?.playerId;

  return (
    <div style={{ padding: '48px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={36} color="var(--primary)" />
            Referee Command Center
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>
            Play6ump: Context Mutation Engine
          </p>
        </div>
        <DynamicButton variant="outline" onClick={loadSandbox} disabled={loading || delegating}>
          Reset Sandbox Data
        </DynamicButton>
      </header>

      {error && (
        <div style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--danger)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(248,81,73,0.2)' }}>
          {error}
        </div>
      )}

      {!sandboxState ? (
        <p>Initializing Engine...</p>
      ) : (
        <Card style={{ padding: '40px', background: '#161b22', border: '1px solid rgba(255,255,255,0.05)' }}>
          
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Target Match ID: {sandboxState.matchId}
            </div>
            <h2 style={{ fontSize: '2rem', margin: '0 0 8px 0' }}>{matchData?.teamA?.franchiseName} vs {matchData?.teamB?.franchiseName}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status:</span>
              <span style={{ color: matchData?.status === 'COMPLETED' ? 'var(--success)' : 'var(--primary)', fontWeight: 700 }}>{matchData?.status}</span>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '12px', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', color: '#fff' }}>Target Player</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Player ID:</span>
              <span style={{ fontFamily: 'monospace' }}>{sandboxState.playerId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Delegation Status:</span>
              {isDelegated ? (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ color: '#d29922', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={16} /> UMPIRE_GRANTED
                </motion.div>
              ) : (
                <span style={{ color: '#8b949e', fontWeight: 600 }}>READ_ONLY</span>
              )}
            </div>
          </div>

          {!isDelegated ? (
            <DynamicButton 
              variant="primary" 
              onClick={() => handleDelegate('ASSIGN')}
              disabled={delegating || matchData?.status === 'COMPLETED'}
              style={{ width: '100%', padding: '20px', fontSize: '1.2rem', background: '#d29922', color: '#000', boxShadow: '0 0 30px rgba(210,153,34,0.3)' }}
            >
              {delegating ? 'Pushing Token...' : 'Delegate Umpire Role to Player'}
            </DynamicButton>
          ) : (
            <DynamicButton 
              variant="outline" 
              onClick={() => handleDelegate('REVOKE')}
              disabled={delegating || matchData?.status === 'COMPLETED'}
              style={{ width: '100%', padding: '20px', fontSize: '1.2rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
            >
              <ShieldAlert size={20} style={{ marginRight: '8px' }} />
              Revoke Umpire Role
            </DynamicButton>
          )}

        </Card>
      )}
    </div>
  );
}

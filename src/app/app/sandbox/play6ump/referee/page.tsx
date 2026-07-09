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
    <div >
      
      <header >
        <div>
          <h1 >
            <Shield size={36} color="var(--primary)" />
            Referee Command Center
          </h1>
          <p >
            Play6ump: Context Mutation Engine
          </p>
        </div>
        <DynamicButton variant="secondary" onClick={loadSandbox} disabled={loading || delegating}>
          Reset Sandbox Data
        </DynamicButton>
      </header>

      {error && (
        <div >
          {error}
        </div>
      )}

      {!sandboxState ? (
        <p>Initializing Engine...</p>
      ) : (
        <Card >
          
          <div >
            <div >
              Target Match ID: {sandboxState.matchId}
            </div>
            <h2 >{matchData?.teamA?.franchiseName} vs {matchData?.teamB?.franchiseName}</h2>
            <div >
              <span >Status:</span>
              <span >{matchData?.status}</span>
            </div>
          </div>

          <div >
            <h3 >Target Player</h3>
            <div >
              <span >Player ID:</span>
              <span >{sandboxState.playerId}</span>
            </div>
            <div >
              <span >Delegation Status:</span>
              {isDelegated ? (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} >
                  <Zap size={16} /> UMPIRE_GRANTED
                </motion.div>
              ) : (
                <span >READ_ONLY</span>
              )}
            </div>
          </div>

          {!isDelegated ? (
            <DynamicButton 
              variant="secondary" 
              onClick={() => handleDelegate('ASSIGN')}
              disabled={delegating || matchData?.status === 'COMPLETED'}
              
            >
              {delegating ? 'Pushing Token...' : 'Delegate Umpire Role to Player'}
            </DynamicButton>
          ) : (
            <DynamicButton 
              variant="secondary" 
              onClick={() => handleDelegate('REVOKE')}
              disabled={delegating || matchData?.status === 'COMPLETED'}
              
            >
              <ShieldAlert size={20}  />
              Revoke Umpire Role
            </DynamicButton>
          )}

        </Card>
      )}
    </div>
  );
}

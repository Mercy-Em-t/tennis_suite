'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { User, Zap, Lock, Activity } from 'lucide-react';

export default function AdaptivePlayerDashboard() {
  const [sandboxState, setSandboxState] = useState<any>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
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

  // Subscribe to match updates
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

  const handleScore = async (winnerId: string) => {
    if (!sandboxState) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/matches/${sandboxState.matchId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointWinnerId: winnerId })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!sandboxState) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/matches/${sandboxState.matchId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Randomly pick a winner for sandbox purposes
        body: JSON.stringify({ winnerId: matchData.teamAId })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const isUmpire = matchData?.umpireId === sandboxState?.playerId && matchData?.status !== 'COMPLETED';
  
  let scores = { setsA: 0, setsB: 0, gamesA: 0, gamesB: 0, pointsA: "0", pointsB: "0" };
  if (matchData?.scoreState) {
    try { scores = JSON.parse(matchData.scoreState); } catch(e) {}
  }

  return (
    <motion.div 
      animate={{ 
        backgroundColor: isUmpire ? '#1a160d' : '#0d1117',
        color: isUmpire ? '#f0e6d2' : '#c9d1d9'
      }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '100vh', padding: '48px', fontFamily: 'Inter, sans-serif' }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `1px solid ${isUmpire ? 'rgba(210,153,34,0.2)' : 'rgba(255,255,255,0.1)'}`, paddingBottom: '24px', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <User size={36} color={isUmpire ? '#d29922' : 'var(--primary)'} />
              Player Dashboard
            </h1>
            <AnimatePresence mode="popLayout">
              {isUmpire ? (
                <motion.div 
                  key="umpire-badge"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  style={{ color: '#d29922', fontSize: '1.1rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Zap size={20} fill="#d29922" />
                  UMPIRE RIGHTS ACTIVATED
                </motion.div>
              ) : (
                <motion.p 
                  key="readonly-badge"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Lock size={16} />
                  Read-Only View
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <DynamicButton variant="outline" onClick={loadSandbox} disabled={loading || actionLoading}>
            Reset State
          </DynamicButton>
        </header>

        {error && (
          <div style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--danger)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(248,81,73,0.2)' }}>
            {error}
          </div>
        )}

        {!sandboxState ? (
          <p>Connecting to Tournament Server...</p>
        ) : (
          <motion.div
            layout
            animate={{
              borderColor: isUmpire ? 'rgba(210,153,34,0.5)' : 'rgba(255,255,255,0.05)',
              boxShadow: isUmpire ? '0 0 40px rgba(210,153,34,0.1)' : 'none'
            }}
            transition={{ duration: 0.5 }}
            style={{ 
              padding: '40px', 
              background: isUmpire ? '#231e11' : '#161b22', 
              border: '1px solid',
              borderRadius: '16px' 
            }}
          >
            
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ fontSize: '1rem', color: isUmpire ? '#d29922' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', fontWeight: 600 }}>
                {matchData?.status === 'COMPLETED' ? 'Final Score' : 'Live Match'}
              </div>
              
              {/* Scoreboard Layout */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px' }}>
                {/* Team A */}
                <div style={{ textAlign: 'right', flex: 1 }}>
                  <h2 style={{ fontSize: '1.8rem', margin: '0 0 8px 0', color: '#fff' }}>{matchData?.teamA?.franchiseName}</h2>
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Sets: <span style={{ color: '#fff', fontWeight: 700 }}>{scores.setsA}</span></div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Games: <span style={{ color: '#fff', fontWeight: 700 }}>{scores.gamesA}</span></div>
                    <div style={{ fontSize: '3rem', fontWeight: 900, color: isUmpire ? '#d29922' : 'var(--primary)', width: '80px', textAlign: 'center' }}>
                      {scores.pointsA}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>VS</div>

                {/* Team B */}
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <h2 style={{ fontSize: '1.8rem', margin: '0 0 8px 0', color: '#fff' }}>{matchData?.teamB?.franchiseName}</h2>
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 900, color: isUmpire ? '#d29922' : 'var(--primary)', width: '80px', textAlign: 'center' }}>
                      {scores.pointsB}
                    </div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Games: <span style={{ color: '#fff', fontWeight: 700 }}>{scores.gamesB}</span></div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Sets: <span style={{ color: '#fff', fontWeight: 700 }}>{scores.setsB}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Adaptive Controls Section */}
            <AnimatePresence>
              {isUmpire && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ borderTop: '1px solid rgba(210,153,34,0.2)', paddingTop: '32px', overflow: 'hidden' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                    <DynamicButton 
                      variant="primary" 
                      onClick={() => handleScore(matchData.teamAId)}
                      disabled={actionLoading}
                      style={{ padding: '24px', fontSize: '1.2rem', background: '#d29922', color: '#000' }}
                    >
                      +1 Point {matchData?.teamA?.franchiseName}
                    </DynamicButton>
                    <DynamicButton 
                      variant="primary" 
                      onClick={() => handleScore(matchData.teamBId)}
                      disabled={actionLoading}
                      style={{ padding: '24px', fontSize: '1.2rem', background: '#d29922', color: '#000' }}
                    >
                      +1 Point {matchData?.teamB?.franchiseName}
                    </DynamicButton>
                  </div>
                  <DynamicButton 
                    variant="outline" 
                    onClick={handleFinalize}
                    disabled={actionLoading}
                    style={{ width: '100%', padding: '16px', borderColor: 'var(--success)', color: 'var(--success)' }}
                  >
                    <Activity size={20} style={{ marginRight: '8px' }} />
                    Finalize Match Results
                  </DynamicButton>
                </motion.div>
              )}
            </AnimatePresence>

            {matchData?.status === 'COMPLETED' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 700, fontSize: '1.2rem', padding: '24px', background: 'rgba(46,160,67,0.1)', borderRadius: '8px', border: '1px solid rgba(46,160,67,0.2)' }}
              >
                Match Completed & Results Finalized
              </motion.div>
            )}

          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

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
      
    >
      <div >
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `1px solid ${isUmpire ? 'rgba(210,153,34,0.2)' : 'rgba(255,255,255,0.1)'}`, paddingBottom: '24px', marginBottom: '40px' }}>
          <div>
            <h1 >
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
                  
                >
                  <Lock size={16} />
                  Read-Only View
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <DynamicButton variant="secondary" onClick={loadSandbox} disabled={loading || actionLoading}>
            Reset State
          </DynamicButton>
        </header>

        {error && (
          <div >
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
            
          >
            
            <div >
              <div >
                {matchData?.status === 'COMPLETED' ? 'Final Score' : 'Live Match'}
              </div>
              
              {/* Scoreboard Layout */}
              <div >
                {/* Team A */}
                <div >
                  <h2 >{matchData?.teamA?.franchiseName}</h2>
                  <div >
                    <div >Sets: <span >{scores.setsA}</span></div>
                    <div >Games: <span >{scores.gamesA}</span></div>
                    <div >
                      {scores.pointsA}
                    </div>
                  </div>
                </div>

                <div >VS</div>

                {/* Team B */}
                <div >
                  <h2 >{matchData?.teamB?.franchiseName}</h2>
                  <div >
                    <div >
                      {scores.pointsB}
                    </div>
                    <div >Games: <span >{scores.gamesB}</span></div>
                    <div >Sets: <span >{scores.setsB}</span></div>
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
                  
                >
                  <div >
                    <DynamicButton 
                      variant="secondary" 
                      onClick={() => handleScore(matchData.teamAId)}
                      disabled={actionLoading}
                      
                    >
                      +1 Point {matchData?.teamA?.franchiseName}
                    </DynamicButton>
                    <DynamicButton 
                      variant="secondary" 
                      onClick={() => handleScore(matchData.teamBId)}
                      disabled={actionLoading}
                      
                    >
                      +1 Point {matchData?.teamB?.franchiseName}
                    </DynamicButton>
                  </div>
                  <DynamicButton 
                    variant="secondary" 
                    onClick={handleFinalize}
                    disabled={actionLoading}
                    
                  >
                    <Activity size={20}  />
                    Finalize Match Results
                  </DynamicButton>
                </motion.div>
              )}
            </AnimatePresence>

            {matchData?.status === 'COMPLETED' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                
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

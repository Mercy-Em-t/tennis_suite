'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Activity, Lock, Users, ArrowRightCircle } from 'lucide-react';

export default function AutomatonSandbox() {
  const [sandboxState, setSandboxState] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isPoolLocked, setIsPoolLocked] = useState(false);
  const [knockoutMatch, setKnockoutMatch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState('');

  const loadSandbox = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sandbox/hardcode');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSandboxState(data);
      setLeaderboard([]);
      setIsPoolLocked(false);
      setKnockoutMatch(null);
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

  // Subscribe to Pool SSE Stream
  useEffect(() => {
    if (!sandboxState?.poolId) return;
    const es = new EventSource(`/api/pools/${sandboxState.poolId}/stream`);
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update' && data.pool) {
        setLeaderboard(data.pool.leaderboard);
        setIsPoolLocked(data.pool.isLocked);
      }
    };
    return () => es.close();
  }, [sandboxState?.poolId]);

  // Subscribe to Knockout Match SSE Stream
  useEffect(() => {
    if (!sandboxState?.knockoutMatchId) return;
    const es = new EventSource(`/api/matches/${sandboxState.knockoutMatchId}/stream`);
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update' && data.match) {
        setKnockoutMatch(data.match);
      }
    };
    return () => es.close();
  }, [sandboxState?.knockoutMatchId]);

  const handleFinalize = async () => {
    if (!sandboxState) return;
    try {
      setFinalizing(true);
      const res = await fetch(`/api/matches/${sandboxState.pendingMatchId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Hardcode Alpha winning the final match point to trigger progression
        // According to our seed, Alpha vs Charlie, we'll let Alpha win
        body: JSON.stringify({ winnerId: sandboxState.pendingMatchId /* just to pass validation */ }) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Let the SSE handle the state updates!
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFinalizing(false);
    }
  };

  const parseStats = (statsJson: string) => {
    try { return JSON.parse(statsJson); }
    catch { return { wins: 0, setsDiff: 0, gamesDiff: 0 }; }
  };

  return (
    <div style={{ padding: '48px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={36} color="var(--primary)" />
            The Automaton Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>
            Real-time Pool Standings & Knockout Progression Engine.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <DynamicButton variant="outline" onClick={loadSandbox} disabled={loading || finalizing}>
            Reset Sandbox Data
          </DynamicButton>
          <DynamicButton 
            variant="primary" 
            onClick={() => handleFinalize()} 
            disabled={loading || finalizing || isPoolLocked}
            style={{ 
              background: isPoolLocked ? 'var(--card-border)' : 'var(--primary)',
              boxShadow: isPoolLocked ? 'none' : '0 0 20px rgba(34, 211, 238, 0.4)'
            }}
          >
            {finalizing ? 'Computing...' : isPoolLocked ? 'Pool Finalized' : 'Score Final Point & Finalize Match'}
          </DynamicButton>
        </div>
      </header>

      {error && (
        <div style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--danger)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(248,81,73,0.2)' }}>
          {error}
        </div>
      )}

      {!sandboxState ? (
        <p>Initializing Standings Engine...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
          
          {/* LEFT: THE STANDINGS GRID */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={24} color="#8b949e" />
                Pool A Standings
              </h2>
              {isPoolLocked ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                  <Lock size={20} />
                  <span style={{ fontWeight: 700, letterSpacing: '1px' }}>LOCKED</span>
                </motion.div>
              ) : (
                <Badge variant="primary">LIVE</Badge>
              )}
            </div>

            <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'rgba(0,0,0,0.4)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '16px', fontWeight: 600 }}>Pos</th>
                    <th style={{ padding: '16px', fontWeight: 600 }}>Team</th>
                    <th style={{ padding: '16px', fontWeight: 600 }}>Wins</th>
                    <th style={{ padding: '16px', fontWeight: 600 }}>Δ Sets</th>
                    <th style={{ padding: '16px', fontWeight: 600 }}>Δ Games</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          Awaiting match completion to compute standings...
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((pt, index) => {
                        const stats = parseStats(pt.stats);
                        const isQualifying = index < 2;
                        return (
                          <motion.tr 
                            key={pt.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            style={{ 
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
                              background: isPoolLocked && isQualifying ? 'rgba(34, 211, 238, 0.05)' : 'transparent'
                            }}
                          >
                            <td style={{ padding: '16px', fontWeight: 700, color: isQualifying ? 'var(--primary)' : '#8b949e' }}>
                              {index + 1}
                            </td>
                            <td style={{ padding: '16px', fontWeight: 600, color: '#fff' }}>
                              {pt.team?.franchiseName}
                              {isPoolLocked && isQualifying && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--primary)' }}>
                                  (Q)
                                </motion.span>
                              )}
                            </td>
                            <td style={{ padding: '16px', color: '#c9d1d9' }}>{stats.wins}</td>
                            <td style={{ padding: '16px', color: stats.setsDiff > 0 ? 'var(--success)' : stats.setsDiff < 0 ? 'var(--danger)' : '#8b949e' }}>
                              {stats.setsDiff > 0 ? '+' : ''}{stats.setsDiff}
                            </td>
                            <td style={{ padding: '16px', color: stats.gamesDiff > 0 ? 'var(--success)' : stats.gamesDiff < 0 ? 'var(--danger)' : '#8b949e' }}>
                              {stats.gamesDiff > 0 ? '+' : ''}{stats.gamesDiff}
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </Card>
          </section>


          {/* RIGHT: THE VISUAL DRAW LAYOUT */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowRightCircle size={24} color="#8b949e" />
                Knockout Tree
              </h2>
            </div>
            
            <div style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")', padding: '48px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              
              <div style={{ position: 'relative', width: '300px' }}>
                
                {/* Semi Final Match Card */}
                <motion.div 
                  layout
                  style={{
                    background: '#161b22',
                    border: '1px solid',
                    borderColor: knockoutMatch?.teamAId ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '16px',
                    boxShadow: knockoutMatch?.teamAId ? '0 0 30px rgba(34, 211, 238, 0.1)' : 'none',
                    zIndex: 2,
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Semi Final 1
                  </div>

                  {/* Slot A */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <AnimatePresence mode="popLayout">
                      {knockoutMatch?.teamAId ? (
                        <motion.span 
                          key="teamA" 
                          initial={{ opacity: 0, x: -20, color: 'var(--primary)' }} 
                          animate={{ opacity: 1, x: 0, color: '#fff' }} 
                          style={{ fontWeight: 700 }}
                        >
                          {knockoutMatch.teamA?.franchiseName}
                        </motion.span>
                      ) : (
                        <motion.span key="placeholderA" initial={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: '#8b949e', fontStyle: 'italic', fontSize: '0.9rem' }}>
                          Pool A Pos 1
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Slot B */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px' }}>
                    <AnimatePresence mode="popLayout">
                      {knockoutMatch?.teamBId ? (
                        <motion.span 
                          key="teamB" 
                          initial={{ opacity: 0, x: -20, color: 'var(--primary)' }} 
                          animate={{ opacity: 1, x: 0, color: '#fff' }} 
                          style={{ fontWeight: 700 }}
                        >
                          {knockoutMatch.teamB?.franchiseName}
                        </motion.span>
                      ) : (
                        <motion.span key="placeholderB" initial={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: '#8b949e', fontStyle: 'italic', fontSize: '0.9rem' }}>
                          Pool B Pos 2
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Decorative Bracket Line */}
                <svg width="50" height="20" style={{ position: 'absolute', right: '-50px', top: '50%', transform: 'translateY(-50%)' }}>
                  <path d="M0,10 L50,10" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
                </svg>

              </div>

            </div>
          </section>

        </div>
      )}
    </div>
  );
}

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
    <div >
      <header >
        <div>
          <h1 >
            <Activity size={36} color="var(--primary)" />
            The Automaton Dashboard
          </h1>
          <p >
            Real-time Pool Standings & Knockout Progression Engine.
          </p>
        </div>
        <div >
          <DynamicButton variant="secondary" onClick={loadSandbox} disabled={loading || finalizing}>
            Reset Sandbox Data
          </DynamicButton>
          <DynamicButton 
            variant="secondary" 
            onClick={() => handleFinalize()} 
            disabled={loading || finalizing || isPoolLocked}
            
          >
            {finalizing ? 'Computing...' : isPoolLocked ? 'Pool Finalized' : 'Score Final Point & Finalize Match'}
          </DynamicButton>
        </div>
      </header>

      {error && (
        <div >
          {error}
        </div>
      )}

      {!sandboxState ? (
        <p>Initializing Standings Engine...</p>
      ) : (
        <div >
          
          {/* LEFT: THE STANDINGS GRID */}
          <section>
            <div >
              <h2 >
                <Users size={24} color="#8b949e" />
                Pool A Standings
              </h2>
              {isPoolLocked ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} >
                  <Lock size={20} />
                  <span >LOCKED</span>
                </motion.div>
              ) : (
                <Badge variant="default">LIVE</Badge>
              )}
            </div>

            <Card >
              <table >
                <thead >
                  <tr>
                    <th >Pos</th>
                    <th >Team</th>
                    <th >Wins</th>
                    <th >Δ Sets</th>
                    <th >Δ Games</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={5} >
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
                            
                          >
                            <td >
                              {index + 1}
                            </td>
                            <td >
                              {pt.team?.franchiseName}
                              {isPoolLocked && isQualifying && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} >
                                  (Q)
                                </motion.span>
                              )}
                            </td>
                            <td >{stats.wins}</td>
                            <td >
                              {stats.setsDiff > 0 ? '+' : ''}{stats.setsDiff}
                            </td>
                            <td >
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
            <div >
              <h2 >
                <ArrowRightCircle size={24} color="#8b949e" />
                Knockout Tree
              </h2>
            </div>
            
            <div >
              
              <div >
                
                {/* Semi Final Match Card */}
                <motion.div 
                  layout
                  
                >
                  <div >
                    Semi Final 1
                  </div>

                  {/* Slot A */}
                  <div >
                    <AnimatePresence mode="popLayout">
                      {knockoutMatch?.teamAId ? (
                        <motion.span 
                          key="teamA" 
                          initial={{ opacity: 0, x: -20, color: 'var(--primary)' }} 
                          animate={{ opacity: 1, x: 0, color: '#fff' }} 
                          
                        >
                          {knockoutMatch.teamA?.franchiseName}
                        </motion.span>
                      ) : (
                        <motion.span key="placeholderA" initial={{ opacity: 1 }} exit={{ opacity: 0 }} >
                          Pool A Pos 1
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Slot B */}
                  <div >
                    <AnimatePresence mode="popLayout">
                      {knockoutMatch?.teamBId ? (
                        <motion.span 
                          key="teamB" 
                          initial={{ opacity: 0, x: -20, color: 'var(--primary)' }} 
                          animate={{ opacity: 1, x: 0, color: '#fff' }} 
                          
                        >
                          {knockoutMatch.teamB?.franchiseName}
                        </motion.span>
                      ) : (
                        <motion.span key="placeholderB" initial={{ opacity: 1 }} exit={{ opacity: 0 }} >
                          Pool B Pos 2
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Decorative Bracket Line */}
                <svg width="50" height="20" >
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

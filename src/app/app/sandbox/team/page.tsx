'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, CalendarDays, KeyRound, Zap, Medal, AlertTriangle } from 'lucide-react';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function PlayerHubSandbox() {
  const [sandboxState, setSandboxState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dispatchedCourt, setDispatchedCourt] = useState<string | null>(null);

  // 1. Fetch Hardcoded State
  const loadSandbox = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sandbox/hardcode');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSandboxState(data);
      setDispatchedCourt(null);
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

  // 2. Listen to SSE Stream
  useEffect(() => {
    if (!sandboxState?.matchId) return;

    const eventSource = new EventSource(`/api/matches/${sandboxState.matchId}/stream`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update' && data.match) {
        setSandboxState((prev: any) => ({
          ...prev,
          match: data.match
        }));
        
        // If the update came from the Dispatch API, flash the banner!
        if (data.match._dispatch_event && data.match.status === 'READY') {
          setDispatchedCourt(sandboxState.court?.name || data.match.courtId);
        }
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [sandboxState?.matchId]);

  return (
    <div >
      
      {/* ── Pulse Banner Notification ── */}
      <AnimatePresence>
        {dispatchedCourt && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            
          >
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              
            >
              <AlertTriangle size={32} color="#fff" />
              <h2 >
                Your match is READY. Report to {dispatchedCourt} immediately!
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header >
        <div>
          <h1 >
            Player Command Center
          </h1>
          <p >
            Listening to SSE Stream for Sandbox Match...
          </p>
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
        <p>Loading Sandbox Environment...</p>
      ) : sandboxState ? (
        <div >
          
          {/* ── Left Column: Tournaments ── */}
          <div >
            <section>
              <h2 >
                <Swords size={24} color="var(--primary)" />
                My Sandbox Match
              </h2>
              <div >
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  
                >
                  <div >
                    <h3 >Sandbox Tournament</h3>
                    <StatusBadge status={sandboxState.match.status === 'SCHEDULED' ? 'info' : 'success'} >{sandboxState.match.status}</StatusBadge>
                  </div>
                  <p >
                    Playing as: <span >Hardcode Team A</span>
                  </p>
                  
                  <div >
                    <div >
                      <span >Status</span>
                      <span >{sandboxState.match.status}</span>
                    </div>
                    <div >
                      <span >Match ID</span>
                      <span >{sandboxState.match.id}</span>
                    </div>
                  </div>
                </motion.div>

              </div>
            </section>
          </div>

          {/* ── Right Column: Placeholder ── */}
          <div >
            <motion.div 
              
            >
              <div >
                <KeyRound size={20} color="#d2a8ff" />
                <h3 >Assigned as Umpire?</h3>
              </div>
              <p >
                Enter the 6-digit PIN provided by your referee to securely access the scoring terminal.
              </p>
            </motion.div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

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
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* ── Pulse Banner Notification ── */}
      <AnimatePresence>
        {dispatchedCourt && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{
              background: 'linear-gradient(90deg, #b91c1c, #dc2626)',
              padding: '24px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.5)',
              border: '2px solid #f87171'
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
            >
              <AlertTriangle size={32} color="#fff" />
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Your match is READY. Report to {dispatchedCourt} immediately!
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 8px 0', background: 'linear-gradient(90deg, #fff, var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
            Player Command Center
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0, fontWeight: 500 }}>
            Listening to SSE Stream for Sandbox Match...
          </p>
        </div>
        <DynamicButton variant="outline" onClick={loadSandbox} disabled={loading}>
          Reset Sandbox
        </DynamicButton>
      </header>

      {error && (
        <div style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--danger)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(248,81,73,0.2)' }}>
          {error}
        </div>
      )}

      {!sandboxState && loading ? (
        <p>Loading Sandbox Environment...</p>
      ) : sandboxState ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', alignItems: 'start' }}>
          
          {/* ── Left Column: Tournaments ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <section>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Swords size={24} color="var(--primary)" />
                My Sandbox Match
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    border: dispatchedCourt ? '2px solid #dc2626' : '1px solid rgba(255,255,255,0.05)',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', fontWeight: 700 }}>Sandbox Tournament</h3>
                    <StatusBadge status={sandboxState.match.status === 'SCHEDULED' ? 'UPCOMING' : 'LIVE'} />
                  </div>
                  <p style={{ color: 'var(--text-muted)', margin: '0 0 20px 0', fontSize: '0.9rem' }}>
                    Playing as: <span style={{ color: '#fff', fontWeight: 600 }}>Hardcode Team A</span>
                  </p>
                  
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Status</span>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{sandboxState.match.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Match ID</span>
                      <span style={{ color: '#8b949e', fontWeight: 700, fontSize: '0.75rem' }}>{sandboxState.match.id}</span>
                    </div>
                  </div>
                </motion.div>

              </div>
            </section>
          </div>

          {/* ── Right Column: Placeholder ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', opacity: 0.5 }}>
            <motion.div 
              style={{ background: 'linear-gradient(145deg, rgba(210,168,255,0.1) 0%, rgba(210,168,255,0.02) 100%)', border: '1px solid rgba(210,168,255,0.3)', borderRadius: '16px', padding: '24px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <KeyRound size={20} color="#d2a8ff" />
                <h3 style={{ margin: 0, color: '#d2a8ff', fontSize: '1.2rem', fontWeight: 700 }}>Assigned as Umpire?</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
                Enter the 6-digit PIN provided by your referee to securely access the scoring terminal.
              </p>
            </motion.div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

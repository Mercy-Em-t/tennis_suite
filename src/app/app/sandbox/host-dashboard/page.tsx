'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { LayoutDashboard, Users } from 'lucide-react';

export default function HostDashboard() {
  const [sandboxState, setSandboxState] = useState<any>(null);
  const [registeredCount, setRegisteredCount] = useState(0);
  const maxTeams = 16;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSandbox = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sandbox/treasury');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSandboxState(data);
      setRegisteredCount(data.paidTeamsCount);
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

  // Subscribe to Registration SSE Stream
  useEffect(() => {
    if (!sandboxState?.tournamentId) return;
    const es = new EventSource(`/api/tournaments/${sandboxState.tournamentId}/registration-stream`);
    
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'SLOT_OCCUPIED') {
        // A new team successfully registered! Increment our counter.
        setRegisteredCount(prev => prev + 1);
      }
    };
    
    return () => es.close();
  }, [sandboxState?.tournamentId]);

  return (
    <div style={{ padding: '48px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LayoutDashboard size={36} color="var(--primary)" />
            Host Command Center
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>
            Rainmaker Open 2026 Dashboard
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <DynamicButton variant="outline" onClick={loadSandbox} disabled={loading}>
            Reset Sandbox Data
          </DynamicButton>
        </div>
      </header>

      {error && (
        <div style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--danger)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(248,81,73,0.2)' }}>
          {error}
        </div>
      )}

      {!sandboxState ? (
        <p>Loading Dashboard...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          
          <Card style={{ padding: '32px', background: '#161b22', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users size={24} color="var(--primary)" />
                <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Team Matrix</h2>
              </div>
              <Badge variant="primary">LIVE</Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Registered Teams:</span>
              
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={registeredCount}
                  initial={{ opacity: 0, y: 20, color: 'var(--primary)', scale: 1.5 }}
                  animate={{ opacity: 1, y: 0, color: '#fff', scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ fontSize: '3rem', fontWeight: 900, display: 'inline-block' }}
                >
                  {registeredCount}
                </motion.span>
              </AnimatePresence>
              
              <span style={{ fontSize: '2rem', color: 'var(--text-muted)', fontWeight: 300 }}>
                / {maxTeams}
              </span>
            </div>

            <div style={{ marginTop: '32px', background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div 
                animate={{ width: `${(registeredCount / maxTeams) * 100}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                style={{ height: '100%', background: 'var(--primary)', borderRadius: '4px' }}
              />
            </div>

          </Card>

        </div>
      )}

    </div>
  );
}

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
    <div >
      
      <header >
        <div>
          <h1 >
            <LayoutDashboard size={36} color="var(--primary)" />
            Host Command Center
          </h1>
          <p >
            Rainmaker Open 2026 Dashboard
          </p>
        </div>
        <div >
          <DynamicButton variant="secondary" onClick={loadSandbox} disabled={loading}>
            Reset Sandbox Data
          </DynamicButton>
        </div>
      </header>

      {error && (
        <div >
          {error}
        </div>
      )}

      {!sandboxState ? (
        <p>Loading Dashboard...</p>
      ) : (
        <div >
          
          <Card >
            
            <div >
              <div >
                <Users size={24} color="var(--primary)" />
                <h2 >Team Matrix</h2>
              </div>
              <Badge variant="default">LIVE</Badge>
            </div>

            <div >
              <span >Registered Teams:</span>
              
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={registeredCount}
                  initial={{ opacity: 0, y: 20, color: 'var(--primary)', scale: 1.5 }}
                  animate={{ opacity: 1, y: 0, color: '#fff', scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  
                >
                  {registeredCount}
                </motion.span>
              </AnimatePresence>
              
              <span >
                / {maxTeams}
              </span>
            </div>

            <div >
              <motion.div 
                animate={{ width: `${(registeredCount / maxTeams) * 100}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                
              />
            </div>

          </Card>

        </div>
      )}

    </div>
  );
}

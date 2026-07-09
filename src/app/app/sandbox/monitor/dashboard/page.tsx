'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Activity, Server, AlertOctagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TelemetryData {
  courtId: string;
  courtName: string;
  lastPingAt: number;
  latencyMs: number;
  status: 'ONLINE' | 'LATENCY_WARNING' | 'OFFLINE';
}

export default function TechnicalDashboard() {
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource('/api/monitor/stream');
    
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setTelemetry(data);
      } catch (e) {}
    };

    return () => es.close();
  }, []);

  const offlineCount = telemetry.filter(t => t.status === 'OFFLINE').length;
  const warningCount = telemetry.filter(t => t.status === 'LATENCY_WARNING').length;
  const hasCritical = offlineCount > 0 || warningCount > 0;

  return (
    <motion.div 
      animate={{ backgroundColor: hasCritical ? '#1f0d0d' : '#0d1117' }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '100vh', padding: '48px', fontFamily: 'Inter, sans-serif' }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `1px solid ${hasCritical ? 'rgba(248,81,73,0.3)' : 'rgba(255,255,255,0.1)'}`, paddingBottom: '24px', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px', color: hasCritical ? '#ff7b72' : '#c9d1d9' }}>
              <Server size={36} color={hasCritical ? '#ff7b72' : 'var(--primary)'} />
              Technical Director Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>
              Live Infrastructure Telemetry
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: connected ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
            <Activity size={20} />
            {connected ? 'SSE Stream Connected' : 'Stream Disconnected'}
          </div>
        </header>

        {telemetry.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '1.2rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
            Awaiting telemetry from courts... (Open the Court Client in another window to begin)
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            <AnimatePresence>
              {telemetry.map(court => {
                const isOffline = court.status === 'OFFLINE';
                const isWarning = court.status === 'LATENCY_WARNING';
                
                return (
                  <motion.div 
                    key={court.courtId}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card style={{ 
                      padding: '24px', 
                      background: isOffline ? 'rgba(248,81,73,0.05)' : isWarning ? 'rgba(210,153,34,0.05)' : '#161b22', 
                      border: `2px solid ${isOffline ? '#ff7b72' : isWarning ? '#d29922' : 'rgba(46,160,67,0.3)'}`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      
                      {isOffline && (
                        <motion.div 
                          animate={{ opacity: [0.5, 1, 0.5] }} 
                          transition={{ repeat: Infinity, duration: 2 }}
                          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#ff7b72' }}
                        />
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div>
                          <h2 style={{ fontSize: '1.4rem', margin: '0 0 4px 0', color: isOffline ? '#ff7b72' : '#fff' }}>{court.courtName}</h2>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {court.courtId}</div>
                        </div>
                        {isOffline ? (
                          <AlertOctagon size={28} color="#ff7b72" />
                        ) : isWarning ? (
                          <AlertOctagon size={28} color="#d29922" />
                        ) : (
                          <Activity size={28} color="var(--success)" />
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Connection</div>
                          <div style={{ fontWeight: 700, color: isOffline ? '#ff7b72' : isWarning ? '#d29922' : 'var(--success)' }}>
                            {court.status}
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Latency</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: isWarning || isOffline ? (isOffline ? '#ff7b72' : '#d29922') : '#c9d1d9', fontFamily: 'monospace' }}>
                            {isOffline ? '---' : `${court.latencyMs}ms`}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Last Ping: {new Date(court.lastPingAt).toLocaleTimeString()}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

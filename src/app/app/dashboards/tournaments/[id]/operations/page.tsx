'use client';

import React, { useState, useEffect, use } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { Activity, Wifi, WifiOff, AlertTriangle, MonitorPlay } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

type CourtHealth = 'ONLINE' | 'LATENCY_WARNING' | 'OFFLINE';

interface CourtData {
  id: string;
  name: string;
  activeMatch: any;
  telemetry: {
    status: CourtHealth;
    lastPingAt: number;
    latencyMs: number;
  };
}

export default function CourtOperationsDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tournamentId = resolvedParams.id;

  const { data, error, isLoading } = useSWR(`/api/tournaments/${tournamentId}/telemetry`, fetcher, {
    // Only fetch once, we rely on SSE for updates
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const [courts, setCourts] = useState<CourtData[]>([]);
  const [globalStreamStatus, setGlobalStreamStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'>('CONNECTING');

  useEffect(() => {
    if (data?.courts) {
      setCourts(data.courts);
    }
  }, [data]);

  useEffect(() => {
    // Connect to the global monitor stream
    const evtSource = new EventSource('/api/monitor/stream');
    
    evtSource.onopen = () => setGlobalStreamStatus('CONNECTED');
    
    evtSource.onmessage = (event) => {
      try {
        const liveTelemetry: any[] = JSON.parse(event.data);
        
        // Merge the live global telemetry into our tournament-specific courts list
        setCourts(prev => prev.map(court => {
          const liveData = liveTelemetry.find(t => t.courtId === court.id);
          if (liveData) {
            return { ...court, telemetry: liveData };
          }
          return court;
        }));
      } catch (e) {
        console.error('Failed to parse SSE telemetry', e);
      }
    };

    evtSource.onerror = () => {
      setGlobalStreamStatus('DISCONNECTED');
    };

    return () => {
      evtSource.close();
    };
  }, []);

  if (isLoading) return <div style={{ padding: '48px', color: '#8b949e', background: '#0d1117', minHeight: '100vh' }}>Initializing Court Ops...</div>;
  if (error) return <div style={{ padding: '48px', color: '#f85149', background: '#0d1117', minHeight: '100vh' }}>Failed to load Operations.</div>;

  const getStatusIcon = (status: CourtHealth) => {
    switch (status) {
      case 'ONLINE': return <Wifi size={18} color="#3fb950" />;
      case 'LATENCY_WARNING': return <AlertTriangle size={18} color="#d29922" />;
      case 'OFFLINE': return <WifiOff size={18} color="#f85149" />;
      default: return <WifiOff size={18} color="#8b949e" />;
    }
  };

  const getStatusColor = (status: CourtHealth) => {
    switch (status) {
      case 'ONLINE': return 'rgba(63,185,80,0.1)';
      case 'LATENCY_WARNING': return 'rgba(210,153,34,0.1)';
      case 'OFFLINE': return 'rgba(248,81,73,0.1)';
      default: return 'rgba(255,255,255,0.05)';
    }
  };

  const getBorderColor = (status: CourtHealth) => {
    switch (status) {
      case 'ONLINE': return '1px solid rgba(63,185,80,0.4)';
      case 'LATENCY_WARNING': return '1px solid rgba(210,153,34,0.4)';
      case 'OFFLINE': return '1px solid rgba(248,81,73,0.4)';
      default: return '1px solid rgba(255,255,255,0.1)';
    }
  };

  const onlineCount = courts.filter(c => c.telemetry.status === 'ONLINE').length;
  const warningCount = courts.filter(c => c.telemetry.status === 'LATENCY_WARNING').length;
  const offlineCount = courts.filter(c => c.telemetry.status === 'OFFLINE').length;

  return (
    <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '24px', marginBottom: '32px' }}>
        <div>
          <Link href={`/tournaments/${tournamentId}`} style={{ color: '#58a6ff', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-block', marginBottom: '12px' }}>&larr; Back to Command Center</Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity color="#a371f7" /> Court Telemetry & Operations
          </h1>
          <p style={{ color: '#8b949e', margin: '8px 0 0 0' }}>Real-time health monitoring of all physical court umpire terminals.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b949e', textTransform: 'uppercase', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: globalStreamStatus === 'CONNECTED' ? '#3fb950' : '#f85149', display: 'inline-block' }} />
            SSE Stream {globalStreamStatus}
          </div>
        </div>
      </header>

      {/* Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
        <Card style={{ background: '#161b22', padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.75rem', color: '#8b949e', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Total Courts</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{courts.length}</div>
        </Card>
        <Card style={{ background: '#161b22', padding: '20px', border: '1px solid rgba(63,185,80,0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: '#3fb950', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Online & Healthy</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{onlineCount}</div>
        </Card>
        <Card style={{ background: '#161b22', padding: '20px', border: '1px solid rgba(210,153,34,0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: '#d29922', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Latency Warnings</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{warningCount}</div>
        </Card>
        <Card style={{ background: '#161b22', padding: '20px', border: '1px solid rgba(248,81,73,0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: '#f85149', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Stale / Offline</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{offlineCount}</div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        <AnimatePresence>
          {courts.map((court) => {
            const status = court.telemetry.status;
            return (
              <motion.div key={court.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                <Card style={{ 
                  background: '#161b22', 
                  border: getBorderColor(status), 
                  padding: '24px', 
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Subtle background glow based on health */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: getStatusColor(status).replace('0.1)', '1)') }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 700 }}>{court.name}</h3>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#8b949e' }}>ID: {court.id.substring(0,8)}...</div>
                    </div>
                    <div style={{ background: getStatusColor(status), padding: '8px', borderRadius: '50%' }}>
                      {getStatusIcon(status)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: '#8b949e' }}>Network Latency:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: status === 'LATENCY_WARNING' ? '#d29922' : '#c9d1d9' }}>
                        {court.telemetry.latencyMs} ms
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: '#8b949e' }}>Last Ping:</span>
                      <span style={{ fontFamily: 'monospace', color: '#c9d1d9' }}>
                        {court.telemetry.lastPingAt > 0 
                          ? new Date(court.telemetry.lastPingAt).toLocaleTimeString() 
                          : 'Never'}
                      </span>
                    </div>
                  </div>

                  {court.activeMatch && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a371f7', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MonitorPlay size={14} /> Active Match
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {court.activeMatch.teamA?.franchiseName || 'Team A'} 
                        <span style={{ color: '#8b949e', margin: '0 8px' }}>vs</span> 
                        {court.activeMatch.teamB?.franchiseName || 'Team B'}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {courts.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: '#8b949e', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
            No courts configured for this tournament.
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { ShieldCheck, Activity, Users, Zap, Trash2, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OperationsCommandCenter() {
  const [sandboxState, setSandboxState] = useState<any>(null);
  const [activeDirector, setActiveDirector] = useState<any>(null);
  const [diagnosticReport, setDiagnosticReport] = useState<any[] | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [runningDiag, setRunningDiag] = useState(false);
  const [runningClean, setRunningClean] = useState(false);
  const [runningHandover, setRunningHandover] = useState(false);
  
  const [actionMessage, setActionMessage] = useState('');

  const loadSandbox = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sandbox/operations');
      const data = await res.json();
      if (res.ok) {
        setSandboxState(data);
        const initialDir = data.directors.find((d: any) => d.id === data.activeDirectorId);
        setActiveDirector(initialDir);
        setDiagnosticReport(null);
        setActionMessage('');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSandbox();
  }, []);

  // Listen to Global Operations Stream for Zero-Downtime Handover
  useEffect(() => {
    const es = new EventSource('/api/operations/stream');
    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'SHIFT_HANDOVER') {
          setActiveDirector(payload.data.activeDirector);
          setActionMessage(`Zero-Downtime Handover Complete: ${payload.data.activeDirector.name} has the conn.`);
        }
      } catch (e) {}
    };
    return () => es.close();
  }, []);

  const runDiagnostics = async () => {
    if (!sandboxState) return;
    try {
      setRunningDiag(true);
      const res = await fetch(`/api/operations/diagnostics?tournamentId=${sandboxState.tournamentId}`);
      const data = await res.json();
      if (res.ok) setDiagnosticReport(data.report);
    } finally {
      setRunningDiag(false);
    }
  };

  const runSessionClean = async () => {
    try {
      setRunningClean(true);
      const res = await fetch('/api/operations/clean-sessions', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        // Refresh diagnostics if open
        if (diagnosticReport) runDiagnostics();
      }
    } finally {
      setRunningClean(false);
    }
  };

  const executeHandover = async () => {
    if (!sandboxState || !activeDirector) return;
    try {
      setRunningHandover(true);
      // Find the next director
      const nextDir = sandboxState.directors.find((d: any) => d.id !== activeDirector.id);
      
      await fetch('/api/operations/shift-handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentDirectorId: activeDirector.id, newDirectorId: nextDir.id })
      });
      // UI updates automatically via SSE stream!
    } finally {
      setRunningHandover(false);
    }
  };

  return (
    <div style={{ padding: '48px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px', color: '#fff' }}>
            <ShieldCheck size={36} color="var(--success)" />
            Operations Command Center
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>
            Daily Cadence & System Lifecycle
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeDirector?.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{ background: 'rgba(210,153,34,0.1)', border: '1px solid #d29922', padding: '8px 16px', borderRadius: '20px', color: '#d29922', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Zap size={16} fill="#d29922" />
              Active Duty: {activeDirector?.name || 'Loading...'}
            </motion.div>
          </AnimatePresence>
          <DynamicButton variant="outline" onClick={loadSandbox} disabled={loading}>
            Reset Sandbox
          </DynamicButton>
        </div>
      </header>

      {actionMessage && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: 'rgba(46,160,67,0.1)', color: 'var(--success)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(46,160,67,0.2)' }}
        >
          {actionMessage}
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        {/* Guard Rails Check */}
        <Card style={{ padding: '32px', background: '#161b22', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#fff' }}>
            <Activity size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Guard Rails Check</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', minHeight: '48px' }}>
            Cross-reference Database provisions against live hardware telemetry to detect offline endpoints before matches begin.
          </p>
          <DynamicButton variant="primary" onClick={runDiagnostics} disabled={runningDiag} style={{ width: '100%', padding: '16px' }}>
            {runningDiag ? 'Sweeping Infrastructure...' : 'Run Morning Diagnostics'}
          </DynamicButton>
        </Card>

        {/* Active Session Clean */}
        <Card style={{ padding: '32px', background: '#161b22', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#fff' }}>
            <Trash2 size={24} color="#ff7b72" />
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Active Session Clean</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', minHeight: '48px' }}>
            Purge stagnant sessions (&gt;12h) from memory and force remote logout payloads to any orphaned clients.
          </p>
          <DynamicButton variant="outline" onClick={runSessionClean} disabled={runningClean} style={{ width: '100%', padding: '16px', borderColor: '#ff7b72', color: '#ff7b72' }}>
            {runningClean ? 'Purging Sessions...' : 'Execute Forced Eviction'}
          </DynamicButton>
        </Card>

        {/* Shift Handover */}
        <Card style={{ padding: '32px', background: '#161b22', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#fff' }}>
            <ArrowRightLeft size={24} color="#d29922" />
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Zero-Downtime Handover</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', minHeight: '48px' }}>
            Transfer global command privileges to the incoming shift lead without dropping live SSE broadcast streams.
          </p>
          <DynamicButton variant="primary" onClick={executeHandover} disabled={runningHandover} style={{ width: '100%', padding: '16px', background: '#d29922', color: '#000', border: 'none' }}>
            {runningHandover ? 'Transferring Conn...' : 'Delegate Command to Next Shift'}
          </DynamicButton>
        </Card>

      </div>

      {/* Diagnostics Report View */}
      {diagnosticReport && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Infrastructure Health Report</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {diagnosticReport.map((court, i) => {
              const isOffline = court.health === 'OFFLINE' || court.health === 'MISSING';
              return (
                <Card key={i} style={{ padding: '24px', borderLeft: `4px solid ${isOffline ? '#ff7b72' : 'var(--success)'}`, background: 'rgba(0,0,0,0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{court.courtName}</div>
                    <div style={{ color: isOffline ? '#ff7b72' : 'var(--success)', fontWeight: 600 }}>{court.health}</div>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    DB Status: {court.dbStatus} <br/>
                    Latency: {court.latency !== null ? `${court.latency}ms` : 'N/A'} <br/>
                    Last Pulse: {court.lastPingAt ? new Date(court.lastPingAt).toLocaleTimeString() : 'Never'}
                  </div>
                </Card>
              )
            })}
          </div>
        </motion.div>
      )}

    </div>
  );
}

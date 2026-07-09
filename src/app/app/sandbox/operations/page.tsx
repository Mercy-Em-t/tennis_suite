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
    <div >
      
      <header >
        <div>
          <h1 >
            <ShieldCheck size={36} color="var(--success)" />
            Operations Command Center
          </h1>
          <p >
            Daily Cadence & System Lifecycle
          </p>
        </div>
        <div >
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeDirector?.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              
            >
              <Zap size={16} fill="#d29922" />
              Active Duty: {activeDirector?.name || 'Loading...'}
            </motion.div>
          </AnimatePresence>
          <DynamicButton variant="secondary" onClick={loadSandbox} disabled={loading}>
            Reset Sandbox
          </DynamicButton>
        </div>
      </header>

      {actionMessage && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          
        >
          {actionMessage}
        </motion.div>
      )}

      <div >
        
        {/* Guard Rails Check */}
        <Card >
          <div >
            <Activity size={24} color="var(--primary)" />
            <h2 >Guard Rails Check</h2>
          </div>
          <p >
            Cross-reference Database provisions against live hardware telemetry to detect offline endpoints before matches begin.
          </p>
          <DynamicButton variant="secondary" onClick={runDiagnostics} disabled={runningDiag} >
            {runningDiag ? 'Sweeping Infrastructure...' : 'Run Morning Diagnostics'}
          </DynamicButton>
        </Card>

        {/* Active Session Clean */}
        <Card >
          <div >
            <Trash2 size={24} color="#ff7b72" />
            <h2 >Active Session Clean</h2>
          </div>
          <p >
            Purge stagnant sessions (&gt;12h) from memory and force remote logout payloads to any orphaned clients.
          </p>
          <DynamicButton variant="secondary" onClick={runSessionClean} disabled={runningClean} >
            {runningClean ? 'Purging Sessions...' : 'Execute Forced Eviction'}
          </DynamicButton>
        </Card>

        {/* Shift Handover */}
        <Card >
          <div >
            <ArrowRightLeft size={24} color="#d29922" />
            <h2 >Zero-Downtime Handover</h2>
          </div>
          <p >
            Transfer global command privileges to the incoming shift lead without dropping live SSE broadcast streams.
          </p>
          <DynamicButton variant="secondary" onClick={executeHandover} disabled={runningHandover} >
            {runningHandover ? 'Transferring Conn...' : 'Delegate Command to Next Shift'}
          </DynamicButton>
        </Card>

      </div>

      {/* Diagnostics Report View */}
      {diagnosticReport && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 >Infrastructure Health Report</h3>
          <div >
            {diagnosticReport.map((court, i) => {
              const isOffline = court.health === 'OFFLINE' || court.health === 'MISSING';
              return (
                <Card key={i} style={{ padding: '24px', borderLeft: `4px solid ${isOffline ? '#ff7b72' : 'var(--success)'}`, background: 'rgba(0,0,0,0.3)' }}>
                  <div >
                    <div >{court.courtName}</div>
                    <div >{court.health}</div>
                  </div>
                  <div >
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

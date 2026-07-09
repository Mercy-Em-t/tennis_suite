'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { Scale, Lock, Download, Database, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComplianceDashboard() {
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [injectErrors, setInjectErrors] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reports
  const [ledgerReport, setLedgerReport] = useState<any>(null);
  const [isolationReport, setIsolationReport] = useState<any>(null);
  const [archiveResult, setArchiveResult] = useState<any>(null);

  const initSandbox = async () => {
    setLoading(true);
    setLedgerReport(null);
    setIsolationReport(null);
    setArchiveResult(null);
    try {
      const res = await fetch('/api/sandbox/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ injectErrors })
      });
      const data = await res.json();
      if (res.ok) setTournamentId(data.tournamentId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { initSandbox(); }, [injectErrors]);

  const runLedgerVerify = async () => {
    if (!tournamentId) return;
    const res = await fetch(`/api/compliance/ledger-verify?tournamentId=${tournamentId}`);
    setLedgerReport(await res.json());
  };

  const runIsolationScan = async () => {
    if (!tournamentId) return;
    const res = await fetch(`/api/compliance/isolation-scan?tournamentId=${tournamentId}`);
    setIsolationReport(await res.json());
  };

  const executeArchiveAndPrune = async () => {
    if (!tournamentId) return;
    const res = await fetch('/api/compliance/archive-and-prune', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournamentId })
    });
    const data = await res.json();
    if (res.ok) {
      setArchiveResult(data);
      // Trigger download of JSON payload
      const blob = new Blob([JSON.stringify(data.snapshot, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `archive_${tournamentId}.json`;
      a.click();
    }
  };

  const runTaxExport = async () => {
    if (!tournamentId) return;
    const res = await fetch(`/api/compliance/tax-export?tournamentId=${tournamentId}`);
    const data = await res.json();
    if (res.ok) {
      const blob = new Blob([data.csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      a.click();
    }
  };

  return (
    <div style={{ padding: '48px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px', color: '#fff' }}>
            <Scale size={36} color="var(--primary)" />
            Compliance & Archival Control
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>
            Monthly Reconciliation & Annual Data Defregmentation
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: injectErrors ? '#ff7b72' : '#c9d1d9', fontWeight: 600, cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={injectErrors} 
              onChange={(e) => setInjectErrors(e.target.checked)} 
              style={{ width: '18px', height: '18px' }}
            />
            Inject Critical Faults (Sandbox)
          </label>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        {/* Monthly Cadence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>The Monthly Cadence</h2>
          
          <Card style={{ padding: '24px', background: '#161b22' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Scale size={24} color="#d29922" />
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Ledger Invariant Verification</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Cross-references every row in the `LedgerEntry` table to mathematically prove Gross == PlatformFee + HostPayout.
            </p>
            <DynamicButton variant="primary" onClick={runLedgerVerify} disabled={loading} style={{ width: '100%' }}>
              Verify Mathematical Invariants
            </DynamicButton>
            
            {ledgerReport && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '24px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: `4px solid ${ledgerReport.status === 'PASSED' ? 'var(--success)' : '#ff7b72'}` }}>
                <div style={{ fontWeight: 700, marginBottom: '8px', color: ledgerReport.status === 'PASSED' ? 'var(--success)' : '#ff7b72', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {ledgerReport.status === 'PASSED' ? <CheckCircle2 size={18}/> : <AlertOctagon size={18}/>}
                  {ledgerReport.status}
                </div>
                {ledgerReport.violations.length > 0 && (
                  <ul style={{ color: '#ff7b72', fontSize: '0.9rem', paddingLeft: '20px' }}>
                    {ledgerReport.violations.map((v: string, i: number) => <li key={i}>{v}</li>)}
                  </ul>
                )}
              </motion.div>
            )}
          </Card>

          <Card style={{ padding: '24px', background: '#161b22' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Lock size={24} color="var(--primary)" />
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Multi-Tenant Isolation Scan</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Scans all active matches and ledger entries to strictly guarantee no cross-tournament data leakage occurred.
            </p>
            <DynamicButton variant="primary" onClick={runIsolationScan} disabled={loading} style={{ width: '100%' }}>
              Run Security Boundary Scan
            </DynamicButton>
            
            {isolationReport && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '24px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: `4px solid ${isolationReport.status === 'SECURE' ? 'var(--success)' : '#ff7b72'}` }}>
                <div style={{ fontWeight: 700, marginBottom: '8px', color: isolationReport.status === 'SECURE' ? 'var(--success)' : '#ff7b72', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isolationReport.status === 'SECURE' ? <CheckCircle2 size={18}/> : <AlertOctagon size={18}/>}
                  {isolationReport.status}
                </div>
                {isolationReport.leakageViolations.length > 0 && (
                  <ul style={{ color: '#ff7b72', fontSize: '0.9rem', paddingLeft: '20px' }}>
                    {isolationReport.leakageViolations.map((v: string, i: number) => <li key={i}>{v}</li>)}
                  </ul>
                )}
              </motion.div>
            )}
          </Card>
        </div>

        {/* Annual Cadence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>The Annual Cadence</h2>

          <Card style={{ padding: '24px', background: '#161b22' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Download size={24} color="#58a6ff" />
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Tax & Compliance Exports</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Compiles the structural revenue distributions (Platform vs Host Cuts) into a clean CSV for legal auditing.
            </p>
            <DynamicButton variant="outline" onClick={runTaxExport} disabled={loading} style={{ width: '100%' }}>
              Export CSV Ledger
            </DynamicButton>
          </Card>

          <Card style={{ padding: '24px', background: '#161b22' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Database size={24} color="#ff7b72" />
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Archival & Defragmentation</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Offloads finalized structural data into a cold-storage JSON payload and physically deletes relational rows to preserve database indexing speed.
            </p>
            <DynamicButton variant="primary" onClick={executeArchiveAndPrune} disabled={loading || archiveResult} style={{ width: '100%', background: '#ff7b72', color: '#000', border: 'none' }}>
              {archiveResult ? 'Archived & Pruned' : 'Execute Immutable Snapshot & Prune'}
            </DynamicButton>
            
            {archiveResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '24px', padding: '16px', background: 'rgba(46,160,67,0.1)', borderRadius: '8px', borderLeft: `4px solid var(--success)` }}>
                <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '4px' }}>{archiveResult.message}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Snapshot downloaded. Relational DB payload cleared.</div>
              </motion.div>
            )}
          </Card>
        </div>

      </div>

    </div>
  );
}

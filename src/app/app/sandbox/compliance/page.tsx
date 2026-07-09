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
    <div >
      
      <header >
        <div>
          <h1 >
            <Scale size={36} color="var(--primary)" />
            Compliance & Archival Control
          </h1>
          <p >
            Monthly Reconciliation & Annual Data Defregmentation
          </p>
        </div>
        <div >
          <label >
            <input 
              type="checkbox" 
              checked={injectErrors} 
              onChange={(e) => setInjectErrors(e.target.checked)} 
              
            />
            Inject Critical Faults (Sandbox)
          </label>
        </div>
      </header>

      <div >
        
        {/* Monthly Cadence */}
        <div >
          <h2 >The Monthly Cadence</h2>
          
          <Card >
            <div >
              <Scale size={24} color="#d29922" />
              <h3 >Ledger Invariant Verification</h3>
            </div>
            <p >
              Cross-references every row in the `LedgerEntry` table to mathematically prove Gross == PlatformFee + HostPayout.
            </p>
            <DynamicButton variant="secondary" onClick={runLedgerVerify} disabled={loading} >
              Verify Mathematical Invariants
            </DynamicButton>
            
            {ledgerReport && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '24px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: `4px solid ${ledgerReport.status === 'PASSED' ? 'var(--success)' : '#ff7b72'}` }}>
                <div >
                  {ledgerReport.status === 'PASSED' ? <CheckCircle2 size={18}/> : <AlertOctagon size={18}/>}
                  {ledgerReport.status}
                </div>
                {ledgerReport.violations.length > 0 && (
                  <ul >
                    {ledgerReport.violations.map((v: string, i: number) => <li key={i}>{v}</li>)}
                  </ul>
                )}
              </motion.div>
            )}
          </Card>

          <Card >
            <div >
              <Lock size={24} color="var(--primary)" />
              <h3 >Multi-Tenant Isolation Scan</h3>
            </div>
            <p >
              Scans all active matches and ledger entries to strictly guarantee no cross-tournament data leakage occurred.
            </p>
            <DynamicButton variant="secondary" onClick={runIsolationScan} disabled={loading} >
              Run Security Boundary Scan
            </DynamicButton>
            
            {isolationReport && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '24px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: `4px solid ${isolationReport.status === 'SECURE' ? 'var(--success)' : '#ff7b72'}` }}>
                <div >
                  {isolationReport.status === 'SECURE' ? <CheckCircle2 size={18}/> : <AlertOctagon size={18}/>}
                  {isolationReport.status}
                </div>
                {isolationReport.leakageViolations.length > 0 && (
                  <ul >
                    {isolationReport.leakageViolations.map((v: string, i: number) => <li key={i}>{v}</li>)}
                  </ul>
                )}
              </motion.div>
            )}
          </Card>
        </div>

        {/* Annual Cadence */}
        <div >
          <h2 >The Annual Cadence</h2>

          <Card >
            <div >
              <Download size={24} color="#58a6ff" />
              <h3 >Tax & Compliance Exports</h3>
            </div>
            <p >
              Compiles the structural revenue distributions (Platform vs Host Cuts) into a clean CSV for legal auditing.
            </p>
            <DynamicButton variant="secondary" onClick={runTaxExport} disabled={loading} >
              Export CSV Ledger
            </DynamicButton>
          </Card>

          <Card >
            <div >
              <Database size={24} color="#ff7b72" />
              <h3 >Archival & Defragmentation</h3>
            </div>
            <p >
              Offloads finalized structural data into a cold-storage JSON payload and physically deletes relational rows to preserve database indexing speed.
            </p>
            <DynamicButton variant="secondary" onClick={executeArchiveAndPrune} disabled={loading || archiveResult} >
              {archiveResult ? 'Archived & Pruned' : 'Execute Immutable Snapshot & Prune'}
            </DynamicButton>
            
            {archiveResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} >
                <div >{archiveResult.message}</div>
                <div >Snapshot downloaded. Relational DB payload cleared.</div>
              </motion.div>
            )}
          </Card>
        </div>

      </div>

    </div>
  );
}

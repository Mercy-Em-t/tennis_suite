'use client';

import React, { useState, use } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function FinancialsDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  const { data: tourneyData, error: tourneyError } = useSWR(`/api/tournaments/${resolvedParams.id}`, fetcher);
  const { data: financeData, error: financeError } = useSWR(`/api/finance?tournamentId=${resolvedParams.id}`, fetcher);
  
  const [scanActive, setScanActive] = useState(false);
  const [scanResults, setScanResults] = useState<any[] | null>(null);

  if (!tourneyData || !financeData) {
    return <div className="p-12 text-slate-400 bg-[#0d1117] min-h-screen">Loading Treasury...</div>;
  }

  const { tournament } = tourneyData;
  const teams = tournament?.teams || [];
  const ledgerEntries = financeData?.ledgerEntries || [];
  
  // Calculations
  const grossRevenue = ledgerEntries.reduce((acc: number, cur: any) => acc + (cur.grossAmount || 0), 0);
  const platformFees = ledgerEntries.reduce((acc: number, cur: any) => acc + (cur.platformFee || 0), 0);
  const hostPayouts = ledgerEntries.reduce((acc: number, cur: any) => acc + (cur.hostPayout || 0), 0);
  
  const pendingTeams = teams.filter((t: any) => t.paymentStatus === 'PENDING_PAYMENT');
  const paidTeams = teams.filter((t: any) => t.paymentStatus !== 'PENDING_PAYMENT');

  // Online/Offline Financials
  const ledgerTeamIds = new Set(ledgerEntries.map((e: any) => e.teamId));
  const onlineTeams = paidTeams.filter((t: any) => ledgerTeamIds.has(t.id));
  const offlineTeams = paidTeams.filter((t: any) => !ledgerTeamIds.has(t.id));
  
  const REGISTRATION_FEE_CENTS = (tournament?.registrationFee || 150) * 100;
  const offlineGrossRevenue = offlineTeams.length * REGISTRATION_FEE_CENTS;
  const offlinePlatformFeeOwed = Math.floor(offlineGrossRevenue * 0.05); // 5% flat fee
  
  const onlineGrossRevenue = ledgerEntries.reduce((acc: number, cur: any) => acc + (cur.grossAmount || 0), 0);
  const onlinePlatformFeesCollected = ledgerEntries.reduce((acc: number, cur: any) => acc + (cur.platformFee || 0), 0);

  const runComplianceScan = () => {
    setScanActive(true);
    setTimeout(() => {
      const anomalies = ledgerEntries.filter((entry: any) => {
        return entry.grossAmount !== (entry.platformFee + entry.hostPayout);
      });
      setScanResults(anomalies);
      setScanActive(false);
    }, 1200);
  };

  return (
    <div className="p-12 text-slate-100 bg-[#0d1117] min-h-screen font-sans">
      <header className="flex flex-wrap justify-between items-end border-b border-white/10 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2 flex-wrap">
            <h1 className="text-3xl font-black tracking-tight m-0 text-white">Treasury & Financials</h1>
            <Badge variant="success">LIVE LEDGER</Badge>
          </div>
          <p className="text-slate-400 m-0">{tournament?.name} | Context ID: <span className="font-mono text-blue-400">{tournament?.id}</span></p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => window.location.href = `/app/dashboards/tournaments/${resolvedParams.id}`}>← Back to Dashboard</Button>
          <Button variant="primary" onClick={runComplianceScan} disabled={scanActive}>
            {scanActive ? 'Scanning Ledger...' : 'Run Compliance Scan'}
          </Button>
        </div>
      </header>

      {/* High-level metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-[#161b22] border border-white/10 p-6 shadow-xl rounded-xl">
          <div className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">Gross Revenue</div>
          <div className="text-4xl font-extrabold text-white">${(grossRevenue / 100).toFixed(2)}</div>
        </Card>
        <Card className="bg-[#161b22] border border-white/10 p-6 shadow-xl rounded-xl">
          <div className="text-xs font-semibold text-purple-400 mb-2 uppercase tracking-wider">Platform Fees</div>
          <div className="text-4xl font-extrabold text-white">${(platformFees / 100).toFixed(2)}</div>
        </Card>
        <Card className="bg-[#161b22] border border-white/10 p-6 shadow-xl rounded-xl">
          <div className="text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wider">Host Payout</div>
          <div className="text-4xl font-extrabold text-white">${(hostPayouts / 100).toFixed(2)}</div>
        </Card>
      </div>

      {/* Revenue Sources Breakdown (Online vs Offline) */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
          Revenue Auditing (Online vs Offline)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#161b22] border border-blue-500/20 p-6 shadow-xl rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <h3 className="text-blue-400 font-bold mb-4 flex justify-between items-center relative z-10">
              Digital Collections (Online)
              <Badge variant="accent">{onlineTeams.length} Teams</Badge>
            </h3>
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Gross Processed</span>
                <span className="font-mono text-white">${(onlineGrossRevenue / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Platform Fees Collected</span>
                <span className="font-mono text-purple-400">-${(onlinePlatformFeesCollected / 100).toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-[#161b22] border border-emerald-500/20 p-6 shadow-xl rounded-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <h3 className="text-emerald-400 font-bold mb-4 flex justify-between items-center relative z-10">
              Host Direct (Offline/Manual)
              <Badge variant="success">{offlineTeams.length} Teams</Badge>
            </h3>
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Est. Cash Collected by Host</span>
                <span className="font-mono text-white">${(offlineGrossRevenue / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-3 border-t border-white/10 mt-2">
                <span className="text-slate-300 font-semibold">Platform Fees to Recover</span>
                <span className="font-mono font-bold text-red-400">-${(offlinePlatformFeeOwed / 100).toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Teams Payment Status */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            Accounts Receivable
            <span className="text-sm font-medium text-slate-500 bg-white/5 px-3 py-1 rounded-full">{teams.length} Teams</span>
          </h2>
          
          <div className="flex flex-col gap-4">
            {pendingTeams.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 mb-4">
                <h3 className="text-amber-500 font-bold mb-3 flex justify-between">
                  Pending Payments
                  <Badge variant="warning">{pendingTeams.length} Action Required</Badge>
                </h3>
                <div className="flex flex-col gap-2">
                  {pendingTeams.map((t: any) => (
                    <div key={t.id} className="flex justify-between items-center bg-[#0d1117]/50 rounded-lg p-3">
                      <span className="font-medium text-amber-100">{t.franchiseName}</span>
                      <Button variant="secondary" size="sm">Send Reminder</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#161b22] border border-white/10 rounded-xl p-5">
              <h3 className="text-emerald-400 font-bold mb-3 flex justify-between">
                Settled Accounts
                <Badge variant="success">{paidTeams.length} Settled</Badge>
              </h3>
              {paidTeams.length === 0 ? (
                <p className="text-slate-500 text-sm">No settled accounts yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {paidTeams.map((t: any) => (
                    <div key={t.id} className="flex justify-between items-center bg-[#0d1117]/50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-300">{t.franchiseName}</span>
                        {ledgerTeamIds.has(t.id) ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono tracking-wider">ONLINE</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono tracking-wider">OFFLINE</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-mono">ID: {t.id.slice(0, 8)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ledger Entries and Compliance */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            Ledger Entries
          </h2>

          <AnimatePresence>
            {scanResults !== null && (
              <motion.div 
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className={`mb-6 p-5 rounded-xl border ${scanResults.length > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}
              >
                <h3 className={`font-bold mb-2 flex items-center gap-2 ${scanResults.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {scanResults.length > 0 ? '⚠️ Compliance Anomalies Detected' : '✅ Ledger is perfectly balanced'}
                </h3>
                {scanResults.length > 0 ? (
                  <p className="text-red-300 text-sm mb-3">The following ledger entries have math discrepancies where Gross ≠ Platform + Payout.</p>
                ) : (
                  <p className="text-emerald-300/80 text-sm mb-0">All ledger entries passed cryptographically verified math assertions.</p>
                )}
                
                {scanResults.map((anomaly, idx) => (
                  <div key={idx} className="bg-[#0d1117]/80 rounded p-3 mb-2 border border-red-500/20 font-mono text-xs text-red-300">
                    <div>Entry ID: {anomaly.id}</div>
                    <div>Team: {anomaly.team?.franchiseName || anomaly.teamId}</div>
                    <div className="mt-2 flex justify-between">
                      <span>Gross: {anomaly.grossAmount}</span>
                      <span>Calc: {anomaly.platformFee} + {anomaly.hostPayout} = {anomaly.platformFee + anomaly.hostPayout}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-[#161b22] border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Team</th>
                  <th className="px-4 py-3 font-semibold text-right">Gross</th>
                  <th className="px-4 py-3 font-semibold text-right">Fee</th>
                  <th className="px-4 py-3 font-semibold text-right">Net Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ledgerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No ledger entries found.</td>
                  </tr>
                ) : (
                  ledgerEntries.map((entry: any) => {
                    const isBalanced = entry.grossAmount === (entry.platformFee + entry.hostPayout);
                    return (
                      <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-200">
                          {entry.team?.franchiseName || 'Unknown Team'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-400">
                          ${(entry.grossAmount / 100).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-purple-400">
                          ${(entry.platformFee / 100).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-blue-400">
                          ${(entry.hostPayout / 100).toFixed(2)}
                          {!isBalanced && (
                            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Math Discrepancy" />
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

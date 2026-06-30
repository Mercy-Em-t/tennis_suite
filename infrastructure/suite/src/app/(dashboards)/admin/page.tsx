'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('SCHEDULE');
  const fetcher = (url: string) => fetch(url).then(r => r.json());

  // Data Fetching
  const { data: scheduleData } = useSWR('/api/schedule', fetcher, { refreshInterval: 5000 });
  const { data: financeData } = useSWR('/api/finance', fetcher);

  const courts = scheduleData?.courts || {};
  const ledger = financeData?.ledger || [];

  return (
    <div className={styles.container}>
      
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', color: 'var(--accent)' }}>
          OS Admin
        </div>
        <div className={`${styles.navItem} ${activeTab === 'SCHEDULE' ? styles.active : ''}`} onClick={() => setActiveTab('SCHEDULE')}>
          Court Scheduling
        </div>
        <div className={`${styles.navItem} ${activeTab === 'FINANCE' ? styles.active : ''}`} onClick={() => setActiveTab('FINANCE')}>
          Financial Ledger
        </div>
        <div className={`${styles.navItem} ${activeTab === 'RULES' ? styles.active : ''}`} onClick={() => setActiveTab('RULES')}>
          Rule Injection
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.main}>
        
        {activeTab === 'SCHEDULE' && (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>Live Scheduling Matrix</h1>
              <Button>Auto-Resolve Conflicts</Button>
            </header>
            <div className={styles.timeline}>
              {Object.keys(courts).map((courtName) => (
                <div key={courtName} className={styles.courtCol}>
                  <div className={styles.courtTitle}>{courtName}</div>
                  {courts[courtName].map((match: any) => (
                    <div key={match.id} className={styles.timeBlock} style={{ borderColor: match.status === 'IN_PROGRESS' ? 'var(--accent)' : 'var(--card-border)' }}>
                      <Badge variant={match.status === 'IN_PROGRESS' ? 'accent' : 'default'}>
                        {match.status}
                      </Badge>
                      <div style={{ marginTop: '8px', fontWeight: 600 }}>
                        {match.teamA?.name || 'TBA'} vs {match.teamB?.name || 'TBA'}
                      </div>
                    </div>
                  ))}
                  {courts[courtName].length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', marginTop: '16px' }}>No matches scheduled</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'FINANCE' && (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>Partner Payouts & Rainmaker Fees</h1>
            </header>
            <Card>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Partner/Affiliate</th>
                    <th>Source</th>
                    <th>Fee Cut</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No financial transactions found.</td></tr>
                  ) : (
                    ledger.map((row: any) => (
                      <tr key={row.id}>
                        <td>{new Date(row.date).toLocaleDateString()}</td>
                        <td>{row.partner}</td>
                        <td>{row.source}</td>
                        <td className={styles.amount}>${row.amount.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          </>
        )}

        {activeTab === 'RULES' && (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>Custom Rule Injection</h1>
              <Button variant="secondary">Save Configuration</Button>
            </header>
            <Card>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>JSON Configuration Override (Pillar 40)</label>
                <textarea 
                  style={{ width: '100%', height: '200px', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '16px', fontFamily: 'monospace' }}
                  defaultValue={`{\n  "noAdvantageScoring": true,\n  "tieBreakAt": 6,\n  "targetSets": 3\n}`}
                />
              </div>
            </Card>
          </>
        )}

      </main>
    </div>
  );
}

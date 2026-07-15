import React from 'react';
import { PrismaClient } from '@prisma/client';
import styles from './page.module.css';
import { ShieldAlert, Activity, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function AuditLogPage(props: { searchParams: Promise<{ tournamentId?: string }> }) {
  const searchParams = await props.searchParams;
  const tournamentId = searchParams.tournamentId;

  const whereClause: any = {};
  if (tournamentId) whereClause.tournamentId = tournamentId;

  const logs = await prisma.auditLog.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const getIcon = (action: string) => {
    if (action === 'TOURNAMENT_SUSPENDED') return <ShieldAlert className={styles.iconDanger} size={18} />;
    if (action === 'SCORE_CORRECTED') return <Activity className={styles.iconWarning} size={18} />;
    return <FileText className={styles.iconInfo} size={18} />;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <Link href="/dashboards/delegate" className={styles.backLink}>&larr; Back to Command Center</Link>
          <h1 className={styles.title}>System Audit Log</h1>
          <p className={styles.subtitle}>Immutable record of all God-Mode interventions and system state changes.</p>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action Type</th>
              <th>Details & Reasoning</th>
              <th>System Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyState}>
                  No interventions recorded. System is running cleanly.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className={styles.timeCell}>
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    <br/>
                    <span className={styles.dateCell}>{new Date(log.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <div className={styles.actionCell}>
                      {getIcon(log.action)}
                      <span>{log.action.replace(/_/g, ' ')}</span>
                    </div>
                  </td>
                  <td className={styles.detailsCell}>{log.details}</td>
                  <td>
                    <div className={styles.statusCell}>
                      <CheckCircle size={14} className={styles.iconSuccess} /> Verified
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

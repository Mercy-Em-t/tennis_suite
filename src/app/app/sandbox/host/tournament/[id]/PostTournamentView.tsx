'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TournamentSandboxData } from '../../useSandboxState';

interface Props {
  tournament: TournamentSandboxData;
  updateTournament: (updates: Partial<TournamentSandboxData>) => void;
}

export default function PostTournamentView({ tournament, updateTournament }: Props) {
  if (tournament.status !== 'COMPLETED') {
    return (
      <div style={{ padding: '48px', textAlign: 'center', background: '#161b22', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <h2 style={{ color: '#8b949e', margin: '0 0 16px' }}>Event is not Completed</h2>
        <p style={{ color: '#8b949e' }}>You must complete the tournament in the During-Tournament view to access post-tournament activities.</p>
      </div>
    );
  }

  const S = {
    grid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' } as React.CSSProperties,
    card: { background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', marginBottom: '24px' } as React.CSSProperties,
    h3: { margin: '0 0 16px', color: '#fff' } as React.CSSProperties,
    listItem: { background: '#0d1117', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as React.CSSProperties,
  };

  return (
    <div style={S.grid}>
      <div>
        <Card style={S.card}>
          <h3 style={S.h3}>Post-Tournament Reviews & Reports</h3>
          <p style={{ color: '#8b949e', marginBottom: '24px' }}>Review the performance, disputes, and final standings of the tournament.</p>
          
          <div style={S.listItem}>
            <div>
              <strong style={{ color: '#c9d1d9', display: 'block', marginBottom: '4px' }}>Final Standings Report</strong>
              <span style={{ fontSize: '0.85rem', color: '#8b949e' }}>Comprehensive ranking of all participants.</span>
            </div>
            <Button variant="secondary" disabled={tournament.isArchived}>View Report</Button>
          </div>
          
          <div style={S.listItem}>
            <div>
              <strong style={{ color: '#c9d1d9', display: 'block', marginBottom: '4px' }}>Incident & Dispute Log</strong>
              <span style={{ fontSize: '0.85rem', color: '#8b949e' }}>Detailed log of all Marshall interventions.</span>
            </div>
            <Button variant="secondary" disabled={tournament.isArchived}>Review Logs</Button>
          </div>
        </Card>

        <Card style={S.card}>
          <h3 style={S.h3}>Surveys & Feedback</h3>
          <p style={{ color: '#8b949e', marginBottom: '24px' }}>Send out post-event surveys to gather feedback from participants.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="primary" disabled={tournament.isArchived}>Generate Survey Link</Button>
            <Button variant="secondary" disabled={tournament.isArchived}>View Feedback Dashboard</Button>
          </div>
        </Card>
      </div>

      <div>
        <Card style={S.card}>
          <h3 style={S.h3}>Data Export</h3>
          <p style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '16px' }}>Export the entire tournament data package for your local records.</p>
          <Button variant="secondary" style={{ width: '100%', marginBottom: '12px' }}>Export as CSV</Button>
          <Button variant="secondary" style={{ width: '100%' }}>Export as PDF Summary</Button>
        </Card>

        <Card style={{ ...S.card, border: '1px solid #f85149', background: '#3b1c1c' }}>
          <h3 style={{ margin: '0 0 16px', color: '#f85149' }}>Archive Tournament</h3>
          <p style={{ fontSize: '0.85rem', color: '#ff7b72', marginBottom: '16px' }}>
            Archiving a tournament makes it <strong>read-only</strong>. No further adjustments can be made.
          </p>
          {!tournament.isArchived ? (
            <Button variant="destructive" style={{ width: '100%' }} onClick={() => updateTournament({ isArchived: true })}>
              Archive & Lock Tournament
            </Button>
          ) : (
            <div style={{ padding: '12px', textAlign: 'center', background: '#f85149', color: '#fff', borderRadius: '6px', fontWeight: 'bold' }}>
              TOURNAMENT ARCHIVED
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Props {
  tournament: any;
  stats: any;
  updateTournament: (updates: any) => Promise<void>;
  mutate: () => void;
}

export default function PostTournamentView({ tournament, stats, updateTournament, mutate }: Props) {
  if (tournament.isActive) {
    return (
      <Card style={{ background: '#161b22', border: '1px dashed rgba(255,255,255,0.2)', padding: '48px', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '8px' }}>Event is Still Active</h2>
        <p style={{ color: '#8b949e', marginBottom: '24px' }}>You must complete the tournament in the During-Tournament view to access post-tournament reports, ledgers, and archival controls.</p>
      </Card>
    );
  }

  const S = {
    grid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' } as React.CSSProperties,
    card: { background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', marginBottom: '24px' } as React.CSSProperties,
    h3: { margin: '0 0 16px', color: '#fff', fontSize: '1.2rem', fontWeight: 700 } as React.CSSProperties,
    listItem: { background: '#0d1117', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as React.CSSProperties,
  };

  return (
    <div style={S.grid}>
      <div>
        <Card style={S.card}>
          <h3 style={S.h3}>Post-Tournament Reviews & Workspace</h3>
          <p style={{ color: '#8b949e', marginBottom: '24px', lineHeight: 1.6 }}>Review completed brackets, view standings, and explore the financial ledgers.</p>
          
          <div style={S.listItem}>
            <div>
              <strong style={{ color: '#fff', display: 'block', fontSize: '0.95rem' }}>Standings & Brackets</strong>
              <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>View final standings and pool rankings.</span>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => window.location.href = `/tournaments/${tournament.id}/bracket`}
            >
              Open Brackets
            </Button>
          </div>
          
          <div style={S.listItem}>
            <div>
              <strong style={{ color: '#fff', display: 'block', fontSize: '0.95rem' }}>Financial Treasury & Ledgers</strong>
              <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>Reconcile platform fees and host payout balances.</span>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => window.location.href = `/tournaments/${tournament.id}/financials`}
            >
              Open Treasury
            </Button>
          </div>
        </Card>

        <Card style={S.card}>
          <h3 style={S.h3}>Surveys & Feedback</h3>
          <p style={{ color: '#8b949e', marginBottom: '16px', lineHeight: 1.6 }}>Gather feedback from players and spectators about the tournament operations.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="secondary" disabled={tournament.isArchived}>Generate Survey Link</Button>
            <Button variant="secondary" disabled={tournament.isArchived}>View Feedback Dashboard</Button>
          </div>
        </Card>
      </div>

      <div>
        <Card style={S.card}>
          <h3 style={S.h3}>Data Export</h3>
          <p style={{ color: '#8b949e', marginBottom: '16px', lineHeight: 1.5, fontSize: '0.85rem' }}>Export the complete tournament package (teams, matches, scores) for your personal records.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Button variant="secondary" onClick={() => alert('CSV Export triggered!')}>Export as CSV</Button>
            <Button variant="secondary" onClick={() => alert('PDF Export triggered!')}>Export as PDF Summary</Button>
          </div>
        </Card>

        <Card style={S.card}>
          <h3 style={S.h3}>Archive Tournament</h3>
          <p style={{ color: '#8b949e', marginBottom: '16px', lineHeight: 1.5, fontSize: '0.85rem' }}>
            Archiving a tournament makes it <strong>read-only</strong>. No further adjustments can be made.
          </p>
          {tournament.isArchived ? (
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: '#8b949e', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)' }}>
              🔒 TOURNAMENT ARCHIVED
            </div>
          ) : (
            <Button 
              variant="danger" 
              onClick={async () => {
                const conf = window.confirm("Are you sure you want to ARCHIVE and lock this tournament? This action cannot be undone.");
                if (conf) {
                  await updateTournament({ isArchived: true });
                }
              }}
            >
              Archive & Lock Tournament
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}

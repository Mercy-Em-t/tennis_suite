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

export default function DuringTournamentView({ tournament, updateTournament }: Props) {
  if (tournament.status !== 'ACTIVE') {
    return (
      <div style={{ padding: '48px', textAlign: 'center', background: '#161b22', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <h2 style={{ color: '#8b949e', margin: '0 0 16px' }}>Event is not Active</h2>
        <p style={{ color: '#8b949e' }}>You must publish the schedule in the Pre-Tournament view to begin the event.</p>
      </div>
    );
  }

  const S = {
    grid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' } as React.CSSProperties,
    card: { background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', marginBottom: '24px' } as React.CSSProperties,
    h3: { margin: '0 0 16px', color: '#fff' } as React.CSSProperties,
    matchCard: { background: '#0d1117', padding: '16px', borderRadius: '8px', border: '1px solid #d2a8ff', marginBottom: '12px' } as React.CSSProperties,
    scoreBox: { background: '#21262d', padding: '4px 12px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold' } as React.CSSProperties,
  };

  return (
    <div style={S.grid}>
      <div>
        <Card style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={S.h3}>Live Event Radar</h3>
            <Badge variant="primary">LIVE</Badge>
          </div>
          <p style={{ color: '#8b949e', marginBottom: '24px' }}>Monitor match progression. Referees and Umpires are updating scores simultaneously.</p>

          <div style={S.matchCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem', color: '#8b949e' }}>
              <span>Court 1 • Pool A</span>
              <span style={{ color: '#58a6ff' }}>In Progress (42m)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#fff', fontWeight: 600 }}>Team Alpha</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={S.scoreBox}>6</span>
                <span style={{ ...S.scoreBox, color: '#58a6ff' }}>4</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 600 }}>Team Delta</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={S.scoreBox}>3</span>
                <span style={{ ...S.scoreBox, color: '#58a6ff' }}>2</span>
              </div>
            </div>
          </div>

          <div style={{ ...S.matchCard, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem', color: '#8b949e' }}>
              <span>Court 2 • Pool B</span>
              <span>Pending</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#fff', fontWeight: 600 }}>Team Bravo</span>
              <span style={S.scoreBox}>0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 600 }}>Team Charlie</span>
              <span style={S.scoreBox}>0</span>
            </div>
          </div>
        </Card>

        <Card style={S.card}>
          <h3 style={S.h3}>Pool Stages Completion</h3>
          <div style={{ background: '#0d1117', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ background: '#3fb950', width: '65%', height: '100%' }}></div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#8b949e' }}>65% of pool matches completed.</p>
        </Card>
      </div>

      <div>
        <Card style={S.card}>
          <h3 style={S.h3}>Action Center</h3>
          <Button variant="secondary" style={{ width: '100%', marginBottom: '12px' }}>Pause Tournament</Button>
          <Button variant="success" style={{ width: '100%', marginBottom: '12px' }} disabled>Unlock Knockout Stage (Locked)</Button>
          <Button variant="warning" style={{ width: '100%' }} onClick={() => {
            updateTournament({ status: 'COMPLETED' });
            window.location.reload();
          }}>Force Complete Tournament</Button>
        </Card>

        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
          <h4 style={{ margin: '0 0 16px', color: '#8b949e', textTransform: 'uppercase', fontSize: '0.75rem' }}>Activity Log</h4>
          <div style={{ fontSize: '0.8rem', color: '#c9d1d9', marginBottom: '8px' }}>• Umpire Tim started match on Court 1.</div>
          <div style={{ fontSize: '0.8rem', color: '#c9d1d9', marginBottom: '8px' }}>• Ref John resolved dispute on Court 3.</div>
        </div>
      </div>
    </div>
  );
}

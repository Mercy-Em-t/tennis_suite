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
      <div >
        <h2 >Event is not Active</h2>
        <p >You must publish the schedule in the Pre-Tournament view to begin the event.</p>
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
          <div >
            <h3 style={S.h3}>Live Event Radar</h3>
            <Badge variant="default">LIVE</Badge>
          </div>
          <p >Monitor match progression. Referees and Umpires are updating scores simultaneously.</p>

          <div style={S.matchCard}>
            <div >
              <span>Court 1 • Pool A</span>
              <span >In Progress (42m)</span>
            </div>
            <div >
              <span >Team Alpha</span>
              <div >
                <span style={S.scoreBox}>6</span>
                <span >4</span>
              </div>
            </div>
            <div >
              <span >Team Delta</span>
              <div >
                <span style={S.scoreBox}>3</span>
                <span >2</span>
              </div>
            </div>
          </div>

          <div >
            <div >
              <span>Court 2 • Pool B</span>
              <span>Pending</span>
            </div>
            <div >
              <span >Team Bravo</span>
              <span style={S.scoreBox}>0</span>
            </div>
            <div >
              <span >Team Charlie</span>
              <span style={S.scoreBox}>0</span>
            </div>
          </div>
        </Card>

        <Card style={S.card}>
          <h3 style={S.h3}>Pool Stages Completion</h3>
          <div >
            <div ></div>
          </div>
          <p >65% of pool matches completed.</p>
        </Card>
      </div>

      <div>
        <Card style={S.card}>
          <h3 style={S.h3}>Action Center</h3>
          <Button variant="secondary" >Pause Tournament</Button>
          <Button variant="success"  disabled>Unlock Knockout Stage (Locked)</Button>
          <Button variant="danger"  onClick={() => {
            updateTournament({ status: 'COMPLETED' });
            window.location.reload();
          }}>Force Complete Tournament</Button>
        </Card>

        <div >
          <h4 >Activity Log</h4>
          <div >• Umpire Tim started match on Court 1.</div>
          <div >• Ref John resolved dispute on Court 3.</div>
        </div>
      </div>
    </div>
  );
}

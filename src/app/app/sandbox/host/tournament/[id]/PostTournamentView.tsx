'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TournamentSandboxData } from '../../useSandboxState';

interface Props {
  tournament: TournamentSandboxData;
  updateTournament: (updates: Partial<TournamentSandboxData>) => void;
}

export default function PostTournamentView({ tournament, updateTournament }: Props) {
  const [feedbackList, setFeedbackList] = useState<Array<{ name: string; comment: string }>>([
    { name: 'Coach Davis', comment: 'Excellent organization. The live radar was very helpful.' },
    { name: 'Player Alice', comment: 'Court 2 nets were slightly low, but overall amazing event!' }
  ]);
  const [fbName, setFbName] = useState('');
  const [fbComment, setFbComment] = useState('');

  if (tournament.status !== 'COMPLETED') {
    return (
      <Card style={{ background: '#161b22', border: '1px dashed rgba(255,255,255,0.2)', padding: '48px', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '8px' }}>Event is not Completed</h2>
        <p style={{ color: '#8b949e', marginBottom: '24px' }}>You must complete the tournament in the During-Tournament view to access post-tournament activities.</p>
      </Card>
    );
  }

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbName.trim() || !fbComment.trim()) return;
    setFeedbackList(prev => [...prev, { name: fbName.trim(), comment: fbComment.trim() }]);
    setFbName('');
    setFbComment('');
  };

  const handleExportCSV = () => {
    let csv = 'Roster Ingestion Details\n';
    csv += 'Franchise Name,Player 1,Player 2,Category\n';
    (tournament.teams || []).forEach(t => {
      const p1 = t.players[0]?.name || '';
      const p2 = t.players[1]?.name || '';
      const cat = JSON.parse(t.categories || '["Open"]').join(', ');
      csv += `"${t.franchiseName}","${p1}","${p2}","${cat}"\n`;
    });

    csv += '\nMatch Event Details\n';
    csv += 'Match ID,Court,Status,Team A,Team B,Score State\n';
    (tournament.matches || []).forEach(m => {
      csv += `"${m.id}","${m.courtName || 'Unassigned'}","${m.status}","${m.teamA.franchiseName}","${m.teamB.franchiseName}","${m.scoreState}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tournament.name}_sandbox_results.csv`;
    a.click();
  };

  const S = {
    grid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' } as React.CSSProperties,
    card: { background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', marginBottom: '24px' } as React.CSSProperties,
    h3: { margin: '0 0 16px', color: '#fff', fontSize: '1.25rem', fontWeight: 700 } as React.CSSProperties,
    listItem: { background: '#0d1117', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as React.CSSProperties,
    input: { width: '100%', padding: '10px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', marginBottom: '12px', outline: 'none' } as React.CSSProperties,
  };

  return (
    <div style={S.grid}>
      <div>
        <Card style={S.card}>
          <h3 style={S.h3}>Post-Tournament Reviews & Reports</h3>
          <p style={{ color: '#8b949e', marginBottom: '24px', lineHeight: 1.6 }}>Review completed match records, final standings, and pool score sheets.</p>
          
          <div style={S.listItem}>
            <div>
              <strong style={{ color: '#fff', display: 'block', fontSize: '0.95rem' }}>Final Standings Report</strong>
              <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>Comprehensive ranking of all participants.</span>
            </div>
            <Button variant="secondary" onClick={() => alert('Viewing final standings report!')}>View Report</Button>
          </div>
          
          <div style={S.listItem}>
            <div>
              <strong style={{ color: '#fff', display: 'block', fontSize: '0.95rem' }}>Incident & Dispute Log</strong>
              <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>Detailed logs and resolutions.</span>
            </div>
            <Button variant="secondary" onClick={() => alert('Viewing dispute logs!')}>Review Logs</Button>
          </div>
        </Card>

        {/* Survey & Feedback Guestbook */}
        <Card style={S.card}>
          <h3 style={S.h3}>Surveys & Feedback</h3>
          
          <div style={{ marginBottom: '24px' }}>
            {feedbackList.map((fb, idx) => (
              <div key={idx} style={{ background: '#0d1117', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '10px' }}>
                <strong style={{ color: '#58a6ff', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>{fb.name}:</strong>
                <span style={{ color: '#c9d1d9', fontSize: '0.85rem' }}>{fb.comment}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddFeedback} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>Leave Feedback / Dispute Case</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <input 
                style={S.input} 
                placeholder="Your Name" 
                value={fbName}
                onChange={e => setFbName(e.target.value)}
              />
              <input 
                style={S.input} 
                placeholder="Comment/Dispute Details" 
                value={fbComment}
                onChange={e => setFbComment(e.target.value)}
              />
            </div>
            <Button variant="primary" type="submit">Submit Feedback</Button>
          </form>
        </Card>
      </div>

      <div>
        <Card style={S.card}>
          <h3 style={S.h3}>Data Export</h3>
          <p style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.5 }}>Export full sandbox datasets (teams, matches, final scores) to your local machine.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Button variant="secondary" onClick={handleExportCSV}>Export as CSV</Button>
            <Button variant="secondary" onClick={() => alert('PDF Export simulated!')}>Export as PDF Summary</Button>
          </div>
        </Card>

        <Card style={S.card}>
          <h3 style={S.h3}>Archive Tournament</h3>
          <p style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.5 }}>
            Archiving a tournament makes it <strong>read-only</strong>. No further adjustments can be made.
          </p>
          {!tournament.isArchived ? (
            <Button 
              variant="danger"  
              onClick={() => {
                const conf = window.confirm("Are you sure you want to archive and lock this tournament?");
                if (conf) updateTournament({ isArchived: true });
              }}
            >
              Archive & Lock Tournament
            </Button>
          ) : (
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: '#8b949e', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)' }}>
              🔒 TOURNAMENT ARCHIVED
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

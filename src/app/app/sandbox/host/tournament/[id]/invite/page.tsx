'use client';

import React, { useState, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSandboxTournaments, TournamentSandboxData } from '../../../useSandboxState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SandboxStaffInvite({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') || 'REFEREE').toUpperCase() as 'REFEREE' | 'MARSHALL';
  const { tournaments, updateTournament, loaded } = useSandboxTournaments();
  const [name, setName] = useState('');
  const [accepted, setAccepted] = useState(false);

  if (!loaded) return <div style={{ padding: '48px', color: '#8b949e', background: '#0d1117', minHeight: '100vh' }}>Loading Invite...</div>;

  const tournament = tournaments.find((t: TournamentSandboxData) => t.id === resolvedParams.id);
  if (!tournament) return <div style={{ padding: '48px', color: '#f85149', background: '#0d1117', minHeight: '100vh' }}>Tournament not found</div>;

  const handleAccept = () => {
    if (!name.trim()) {
      alert('Please enter your name to accept the invite.');
      return;
    }
    const newStaff = [
      ...(tournament.staff || []),
      {
        id: `stf-${Math.floor(Math.random() * 9000) + 1000}`,
        name: name.trim(),
        role: role,
        status: 'APPROVED' as const
      }
    ];
    updateTournament(tournament.id, { staff: newStaff });
    setAccepted(true);
  };

  const S = {
    page: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0d1117', color: '#f0f6fc', fontFamily: 'Inter, sans-serif', padding: '24px' } as React.CSSProperties,
    card: { background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', padding: '40px', maxWidth: '480px', width: '100%', borderRadius: '12px' } as React.CSSProperties,
    title: { fontSize: '1.6rem', fontWeight: 800, margin: '0 0 16px', color: '#fff', textAlign: 'center' } as React.CSSProperties,
    input: { width: '100%', padding: '12px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '6px', marginBottom: '24px', outline: 'none', fontSize: '1rem' } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <Card style={S.card}>
        {accepted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
            <h2 style={S.title}>Invite Accepted!</h2>
            <p style={{ color: '#8b949e', marginBottom: '24px', lineHeight: 1.6 }}>
              You have been successfully added to the staff directory for <strong>{tournament.name}</strong> as a <strong>{role}</strong>.
            </p>
            <Button variant="secondary" onClick={() => window.close()}>
              Close Window
            </Button>
          </div>
        ) : (
          <div>
            <h2 style={S.title}>Staff Invitation</h2>
            <p style={{ color: '#8b949e', marginBottom: '24px', textAlign: 'center', lineHeight: 1.6 }}>
              You have been invited to join <strong>{tournament.name}</strong> as an official <strong>{role}</strong>.
            </p>
            
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b949e', fontWeight: 600, marginBottom: '8px' }}>
              Your Full Name
            </label>
            <input 
              style={S.input} 
              placeholder="e.g. Roger Federer" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />

            <Button variant="success" style={{ width: '100%' }} onClick={handleAccept}>
              Accept Invitation & Register
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

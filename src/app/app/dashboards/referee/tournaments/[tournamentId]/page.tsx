'use client';

import React, { useState, useEffect, use } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useRouter } from 'next/navigation';
import RefereePoolsView from './RefereePoolsView';
import RefereeDispatcherView from './RefereeDispatcherView';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// Mock Data strictly used for the Sandbox view
const mockTournamentData = {
  id: 'sandbox-1',
  name: 'Sandbox Major Open',
  courts: [
    {
      id: 'court-alpha',
      name: 'Center Court',
      matches: [
        {
          id: 'mock-match-1',
          tournamentId: 'sandbox-1',
          stage: 'SEMI-FINAL',
          status: 'IN_PROGRESS',
          teamA: { franchiseName: 'Federer Express' },
          teamB: { franchiseName: 'Nadal Topspin' },
          umpireCode: null,
        },
        {
          id: 'mock-match-2',
          tournamentId: 'sandbox-1',
          stage: 'POOL',
          status: 'REQUIRES_INTERVENTION',
          teamA: { franchiseName: 'Djokovic Smash' },
          teamB: { franchiseName: 'Murray Slice' },
          umpireCode: '839120',
        }
      ]
    },
    {
      id: 'court-beta',
      name: 'Court 2',
      matches: [
        {
          id: 'mock-match-3',
          tournamentId: 'sandbox-1',
          stage: 'POOL',
          status: 'SCHEDULED',
          teamA: { franchiseName: 'Williams Power' },
          teamB: { franchiseName: 'Osaka Drive' },
          umpireCode: null,
        }
      ]
    },
    {
      id: 'court-gamma',
      name: 'Court 3',
      matches: []
    }
  ]
};

export default function RefereeTournamentCenter({ params }: { params: Promise<{ tournamentId: string }> }) {
  const router = useRouter();
  const { tournamentId } = use(params);
  const isSandbox = tournamentId === 'sandbox-1';

  // Only fetch if it's NOT the sandbox
  const { data, error, isLoading, mutate } = useSWR(
    isSandbox ? null : `/api/referee/hub?tournamentId=${tournamentId}`,
    fetcher,
    { refreshInterval: isSandbox ? 0 : 5000 }
  );

  if (!isSandbox && isLoading) {
    return <div style={{ padding: '48px', color: '#8b949e' }}>Loading Command Center...</div>;
  }

  if (!isSandbox && (error || (data && !data.success))) {
    return (
      <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' }}>
          <Link href="/app/dashboards/referee" style={{ color: '#58a6ff', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '16px', display: 'inline-block' }}>
            ← Back to Hub
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: '#f0f6fc' }}>Command Center</h1>
        </header>
        <Card style={{ background: '#161b22', padding: '32px', textAlign: 'center', border: '1px solid #f85149' }}>
          <h2 style={{ color: '#f85149', margin: '0 0 16px 0' }}>Access Denied</h2>
          <p style={{ color: '#8b949e' }}>{data?.error || error?.message || 'Failed to load tournament data.'}</p>
        </Card>
      </div>
    );
  }

  const tournament = isSandbox ? mockTournamentData : data?.tournaments?.[0];

  if (!tournament) {
    return (
      <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <Link href="/app/dashboards/referee" style={{ color: '#58a6ff', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Back to Hub
        </Link>
        <Card style={{ background: '#161b22', padding: '32px', textAlign: 'center', marginTop: '32px' }}>
          <h2 style={{ color: '#fff', margin: '0 0 16px 0' }}>Tournament Not Found</h2>
          <p style={{ color: '#8b949e' }}>This tournament either does not exist or you are not assigned as a referee.</p>
        </Card>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'MATCHES' | 'DISPATCHER' | 'POOLS'>('MATCHES');
  const [localPools, setLocalPools] = useState<any[]>([]);

  useEffect(() => {
    if (tournament?.pools) {
      setLocalPools(tournament.pools);
    }
  }, [tournament]);

  const handleScoreMatch = (match: any) => {
    if (isSandbox) {
      alert("Sandbox Mode: This would route you to the specific scoring terminal for " + (match.teamA?.franchiseName) + " vs " + (match.teamB?.franchiseName));
    } else {
      router.push(`/referee/matches/${match.tournamentId}/${match.id}`);
    }
  };

  const handleAssignUmpire = async (matchId: string) => {
    if (isSandbox) {
      alert("Sandbox Mode: A 6-digit PIN would be generated here.");
      return;
    }
    const res = await fetch(`/api/referee/matches/${matchId}/umpire-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'GENERATE' })
    });
    const result = await res.json();
    if (result.success) {
      alert(`Umpire PIN generated: ${result.pin}\n\nGive this PIN to the player.`);
    } else {
      alert(result.error || 'Failed to generate PIN');
    }
  };

  const handleRevokeUmpire = async (matchId: string) => {
    if (isSandbox) {
      alert("Sandbox Mode: The PIN would be revoked here.");
      return;
    }
    await fetch(`/api/referee/matches/${matchId}/umpire-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'REVOKE' })
    });
  };

  return (
    <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      <Link href="/app/dashboards/referee" style={{ color: '#8b949e', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}>
        ← Back to Hub
      </Link>

      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 8px 0', background: 'linear-gradient(90deg, #fff, #58a6ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
            {tournament.name}
          </h1>
          <p style={{ color: '#8b949e', margin: 0, fontSize: '1.1rem' }}>Command Center</p>
        </div>
        
        {isSandbox && (
          <div style={{ background: '#d2a8ff', color: '#000', padding: '6px 16px', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem' }}>
            SANDBOX PREVIEW
          </div>
        )}
      </header>

      <div style={{ display: 'flex', gap: '2px', background: '#161b22', padding: '4px', borderRadius: '8px', width: 'fit-content', marginBottom: '32px' }}>
        <button 
          style={{ padding: '8px 24px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: activeTab === 'MATCHES' ? 600 : 500, background: activeTab === 'MATCHES' ? '#21262d' : 'transparent', color: activeTab === 'MATCHES' ? '#f0f6fc' : '#8b949e', border: 'none', outline: 'none' }}
          onClick={() => setActiveTab('MATCHES')}
        >
          Match Queue & Scoring
        </button>
        <button 
          style={{ padding: '8px 24px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: activeTab === 'DISPATCHER' ? 600 : 500, background: activeTab === 'DISPATCHER' ? '#21262d' : 'transparent', color: activeTab === 'DISPATCHER' ? '#f0f6fc' : '#8b949e', border: 'none', outline: 'none' }}
          onClick={() => setActiveTab('DISPATCHER')}
        >
          Match Dispatcher
        </button>
        <button 
          style={{ padding: '8px 24px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: activeTab === 'POOLS' ? 600 : 500, background: activeTab === 'POOLS' ? '#21262d' : 'transparent', color: activeTab === 'POOLS' ? '#f0f6fc' : '#8b949e', border: 'none', outline: 'none' }}
          onClick={() => setActiveTab('POOLS')}
        >
          Draft Draws / Pools
        </button>
      </div>

      {activeTab === 'MATCHES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {tournament.courts?.length === 0 ? (
            <Card style={{ background: '#161b22', padding: '48px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.25rem' }}>No Courts Configured</h3>
              <p style={{ color: '#8b949e', margin: 0 }}>There are no courts currently registered or assigned to this tournament.</p>
            </Card>
          ) : (
            tournament.courts?.map((court: any) => (
              <Card key={court.id} style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.05)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {court.name} 
                    <Badge variant="default">Online</Badge>
                  </h3>
                </div>
                
                {court.matches.length === 0 ? (
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '8px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#8b949e', fontSize: '0.9rem', margin: 0 }}>No matches currently queued on this court.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {court.matches.map((match: any) => (
                      <motion.div 
                        key={match.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          background: '#0d1117',
                          padding: '20px',
                          borderRadius: '12px',
                          border: match.status === 'IN_PROGRESS' ? '1px solid #d2a8ff' : match.status === 'REQUIRES_INTERVENTION' ? '1px solid #f85149' : '1px solid rgba(255,255,255,0.05)',
                          boxShadow: match.status === 'IN_PROGRESS' ? '0 0 15px rgba(210,168,255,0.1)' : 'none'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>{match.stage} Match</span>
                            {match.status === 'IN_PROGRESS' && <StatusBadge status="success">LIVE</StatusBadge>}
                            {match.status === 'SCHEDULED' && <StatusBadge status="info">UPCOMING</StatusBadge>}
                            {match.status === 'REQUIRES_INTERVENTION' && <StatusBadge status="warning">PAUSED</StatusBadge>}
                          </div>
                          <div style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 600 }}>
                            {match.teamA?.franchiseName || match.placeholderA || 'TBD'} vs {match.teamB?.franchiseName || match.placeholderB || 'TBD'}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          {(match.status === 'IN_PROGRESS' || match.status === 'SCHEDULED' || match.status === 'REQUIRES_INTERVENTION') && (
                            <>
                              <Button 
                                variant={match.status === 'IN_PROGRESS' ? 'primary' : 'secondary'}
                                onClick={() => handleScoreMatch(match)}
                              >
                                Score Match
                              </Button>
                              {!match.umpireCode ? (
                                <Button 
                                  variant="secondary"
                                  style={{ borderColor: '#d2a8ff', color: '#d2a8ff' }}
                                  onClick={() => handleAssignUmpire(match.id)}
                                >
                                  Assign Player Ump
                                </Button>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #d2a8ff', padding: '6px 16px', borderRadius: '8px', background: 'rgba(210,168,255,0.1)' }}>
                                  <span style={{ color: '#d2a8ff', fontSize: '0.9rem' }}>PIN: <strong style={{ letterSpacing: '2px', fontSize: '1.1rem' }}>{match.umpireCode}</strong></span>
                                  <button 
                                    style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '0.8rem', padding: '4px', textDecoration: 'underline' }}
                                    onClick={() => handleRevokeUmpire(match.id)}
                                  >
                                    Revoke
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'DISPATCHER' && (
        <RefereeDispatcherView
          tournamentId={tournamentId} 
          tournament={tournament} 
          mutate={isSandbox ? () => {} : mutate} 
        />
      )}

      {activeTab === 'POOLS' && (
        <RefereePoolsView 
          tournamentId={tournamentId} 
          tournament={tournament} 
          mutate={isSandbox ? () => {} : mutate} 
          localPools={localPools} 
          setLocalPools={setLocalPools}
        />
      )}
    </div>
  );
}

'use client';

import React, { use } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Wallet, PlayCircle, Share2, MapPin, Shield } from 'lucide-react';
import Link from 'next/link';
import { DrawViewer } from '@/components/tennis/DrawViewer';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PlayerTournamentDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data, error, isLoading, mutate } = useSWR(`/api/player/tournaments/${resolvedParams.id}`, fetcher, { refreshInterval: 5000 });

  if (isLoading) return <div style={{ padding: '48px', color: '#8b949e', textAlign: 'center', minHeight: '100vh', background: '#0d1117' }}>Loading Command Center...</div>;
  if (error || !data?.success) return <div style={{ padding: '48px', color: '#f85149', textAlign: 'center', minHeight: '100vh', background: '#0d1117' }}>Access Denied.</div>;

  const { tournament, team, schedule, pool } = data;

  const handleCheckIn = async () => {
    try {
      const res = await fetch(`/api/player/tournaments/${tournament.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCheckedIn: !team.isCheckedIn })
      });
      if (res.ok) {
        mutate(`/api/player/tournaments/${resolvedParams.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#f0f6fc', minHeight: '100vh' }}>
      
      {/* Back & Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/dashboards/player" style={{ color: '#58a6ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          ← Back to Global Hub
        </Link>
      </div>

      <header style={{ marginBottom: '48px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '32px' }}>
        <Badge variant={tournament.status === 'ACTIVE' ? 'success' : 'secondary'} style={{ marginBottom: '16px' }}>{tournament.status}</Badge>
        <h1 style={{ margin: '0 0 12px', fontSize: '3rem', fontWeight: 900, color: '#f0f6fc' }}>{tournament.name}</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '24px', color: '#8b949e', fontSize: '1.1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={20} /> Playing as: <strong style={{ color: '#fff' }}>{team.franchiseName}</strong></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={20} /> {tournament.location || 'Global Server'}</span>
          </div>
          <Button 
            variant={team.isCheckedIn ? 'outline' : 'primary'} 
            onClick={handleCheckIn}
            style={{ 
              borderColor: team.isCheckedIn ? '#3fb950' : undefined,
              color: team.isCheckedIn ? '#3fb950' : undefined 
            }}
          >
            {team.isCheckedIn ? '✓ Checked In' : 'Check-In at Venue'}
          </Button>
        </div>
      </header>

      {/* Tournament Details Info Section */}
      <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', marginBottom: '48px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <div>
          <h4 style={{ color: '#8b949e', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>Format & Rules</h4>
          <div style={{ color: '#f0f6fc', fontSize: '0.95rem' }}>
            <p style={{ margin: '0 0 4px 0' }}><strong>Format:</strong> {tournament.formatType}</p>
            <p style={{ margin: 0 }}><strong>Rules:</strong> {tournament.scoringRules || 'Standard ITF'}</p>
          </div>
        </div>
        <div>
          <h4 style={{ color: '#8b949e', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>Prize Pool</h4>
          <div style={{ color: '#3fb950', fontSize: '1.2rem', fontWeight: 700 }}>
            {tournament.prizeMoney || 'TBD / Glory'}
          </div>
        </div>
        <div>
          <h4 style={{ color: '#8b949e', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>Venue Stations</h4>
          <div style={{ color: '#f0f6fc', fontSize: '0.95rem' }}>
            {tournament.stationInfo || 'Water: Court 1 & 4. First Aid: Main Desk.'}
          </div>
        </div>
        <div>
          <h4 style={{ color: '#8b949e', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>Contact Directory</h4>
          <div style={{ color: '#f0f6fc', fontSize: '0.95rem' }}>
            <p style={{ margin: '0 0 4px 0' }}>E: {tournament.contactEmail || 'director@tournament.com'}</p>
            <p style={{ margin: 0 }}>P: {tournament.contactPhone || 'Contact Main Desk'}</p>
          </div>
        </div>
      </Card>

      <div style={{ marginBottom: '48px' }}>
        <DrawViewer tournamentId={tournament.id} myTeamId={team.id} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* ── Left Column: Match Hub & Brackets ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.8rem', margin: 0 }}>The Match Hub</h2>
            </div>
            
            {schedule.length === 0 ? (
              <Card style={{ background: '#161b22', padding: '32px', textAlign: 'center', color: '#8b949e' }}>No matches scheduled yet.</Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {schedule.map((m: any) => {
                  const myScore = m.isTeamA ? (m.scoreState?.setsA || 0) : (m.scoreState?.setsB || 0);
                  const oppScore = m.isTeamA ? (m.scoreState?.setsB || 0) : (m.scoreState?.setsA || 0);
                  const isReady = m.status === 'READY';
                  
                  return (
                    <motion.div
                      key={m.id}
                      animate={isReady ? { boxShadow: ['0px 0px 0px rgba(88,166,255,0)', '0px 0px 20px rgba(88,166,255,0.8)', '0px 0px 0px rgba(88,166,255,0)'] } : {}}
                      transition={isReady ? { duration: 1.5, repeat: Infinity } : {}}
                      style={{ borderRadius: '12px' }}
                    >
                      <Card style={{ 
                        background: '#161b22', 
                        border: isReady ? '1px solid #58a6ff' : '1px solid rgba(255,255,255,0.1)', 
                        padding: '24px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}>
                        <div>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                            <Badge variant={isReady ? 'primary' : 'outline'}>{m.stage}</Badge>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8b949e', fontSize: '0.9rem' }}>
                              <MapPin size={14} /> {m.court?.name || 'Court TBA'}
                            </span>
                          </div>
                          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Shield size={24} style={{ color: '#8b949e' }} />
                            vs {m.opponent}
                          </h3>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ marginBottom: '8px' }}>
                            <Badge variant={m.status === 'COMPLETED' ? 'outline' : m.status === 'IN_PROGRESS' ? 'success' : isReady ? 'primary' : 'secondary'}>
                              {isReady ? 'REPORT TO COURT' : m.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          {(m.status === 'COMPLETED' || m.status === 'IN_PROGRESS') && (
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: m.winnerId === team.id ? '#3fb950' : m.winnerId ? '#f85149' : '#f0f6fc' }}>
                              {myScore} - {oppScore}
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Social / Highlights Stub */}
          <section>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>Highlights Library</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[1, 2].map((i) => (
                <Card key={i} style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{ height: '120px', background: 'rgba(88, 166, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlayCircle size={48} style={{ color: '#58a6ff', opacity: 0.5 }} />
                  </div>
                  <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: '#8b949e' }}>Generating Video Asset...</span>
                    <Button variant="ghost" size="sm" style={{ color: '#d2a8ff' }}><Share2 size={16} /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

        </div>

        {/* ── Right Column: Context & Stats ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Player Performance</h2>
            <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f0f6fc' }}>{schedule.length}</div>
                  <div style={{ fontSize: '0.85rem', color: '#8b949e', textTransform: 'uppercase' }}>Matches</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3fb950' }}>
                    {schedule.length > 0 ? Math.round((schedule.filter((m: any) => m.winnerId === team.id).length / schedule.filter((m: any) => m.status === 'COMPLETED').length) * 100) || 0 : 0}%
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#8b949e', textTransform: 'uppercase' }}>Win Rate</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <Wallet size={32} style={{ color: '#3fb950' }} />
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#8b949e', textTransform: 'uppercase' }}>Available Balance</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f0f6fc' }}>$0.00</div>
                </div>
              </div>
              <Button variant="outline" style={{ width: '100%' }}>Connect Stripe Express</Button>
            </Card>
          </section>

        </div>
      </div>
    </div>
  );
}

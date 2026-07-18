'use client';

import React, { use } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Wallet, PlayCircle, Share2, MapPin, Shield, ChevronDown, ChevronUp, User, Activity, Calendar, Bell, MessageCircle, Lightbulb, Target } from 'lucide-react';
import Link from 'next/link';
import { DrawViewer } from '@/components/tennis/DrawViewer';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const mockDataMap: Record<string, any> = {
  'mock-sandbox-pools': {
    success: true,
    tournament: { id: 'mock-sandbox-pools', name: 'Sandbox Rivals (Pools Stage)', status: 'ACTIVE', formatType: 'Pool Play', scoringRules: 'Standard', location: 'Sandbox Arena', prizeMoney: '10,000 XP' },
    team: { franchiseName: 'Sandbox Team', isCheckedIn: true },
    schedule: [
      { id: 'm1', status: 'COMPLETED', stage: 'POOL', teamA: { franchiseName: 'Sandbox Team' }, teamB: { franchiseName: 'Alpha Squad' }, winnerId: 'Sandbox Team', score: { sets: [{ a: 6, b: 4 }] } },
      { id: 'm2', status: 'READY', stage: 'POOL', teamA: { franchiseName: 'Sandbox Team' }, teamB: { franchiseName: 'Beta Force' } }
    ],
    pool: { name: 'Pool A', standings: [{ teamName: 'Sandbox Team', wins: 1, losses: 0, points: 3 }, { teamName: 'Alpha Squad', wins: 0, losses: 1, points: 0 }, { teamName: 'Beta Force', wins: 0, losses: 0, points: 0 }] }
  },
  'mock-sandbox-knockouts': {
    success: true,
    tournament: { id: 'mock-sandbox-knockouts', name: 'Sandbox Rivals (Knockouts Stage)', status: 'ACTIVE', formatType: 'Knockout', scoringRules: 'Standard', location: 'Sandbox Arena', prizeMoney: '10,000 XP' },
    team: { franchiseName: 'Sandbox Team', isCheckedIn: true },
    schedule: [
      { id: 'm3', status: 'COMPLETED', stage: 'QUARTER-FINAL', teamA: { franchiseName: 'Sandbox Team' }, teamB: { franchiseName: 'Gamma Unit' }, winnerId: 'Sandbox Team', score: { sets: [{ a: 6, b: 2 }] } },
      { id: 'm4', status: 'SCHEDULED', stage: 'SEMI-FINAL', teamA: { franchiseName: 'Sandbox Team' }, teamB: { franchiseName: 'Delta Core' } }
    ],
    pool: null
  },
  'mock-sandbox-complete': {
    success: true,
    tournament: { id: 'mock-sandbox-complete', name: 'Sandbox Rivals (Completed)', status: 'COMPLETED', formatType: 'Knockout', scoringRules: 'Standard', location: 'Sandbox Arena', prizeMoney: '10,000 XP' },
    team: { franchiseName: 'Sandbox Team', isCheckedIn: true },
    schedule: [
      { id: 'm5', status: 'COMPLETED', stage: 'FINAL', teamA: { franchiseName: 'Sandbox Team' }, teamB: { franchiseName: 'Omega Boss' }, winnerId: 'Sandbox Team', score: { sets: [{ a: 6, b: 4 }, { a: 7, b: 5 }] } }
    ],
    pool: null
  }
};

export default function PlayerTournamentDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [isDrawOpen, setIsDrawOpen] = React.useState(true);
  const [selectedMatch, setSelectedMatch] = React.useState<any>(null);
  
  const isMock = resolvedParams.id.startsWith('mock-sandbox-');
  const mockData = isMock ? mockDataMap[resolvedParams.id] : null;

  const { data: swrData, error, isLoading, mutate } = useSWR(
    isMock ? null : `/api/player/tournaments/${resolvedParams.id}`, 
    fetcher, 
    { refreshInterval: isMock ? 0 : 5000 }
  );

  const data = isMock ? mockData : swrData;

  if (!isMock && isLoading) return <div style={{ padding: '48px', color: '#8b949e', textAlign: 'center', minHeight: '100vh', background: '#0d1117' }}>Loading Command Center...</div>;
  if (!isMock && (error || !data?.success)) return <div style={{ padding: '48px', color: '#f85149', textAlign: 'center', minHeight: '100vh', background: '#0d1117' }}>Access Denied.</div>;

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
        <Badge variant={tournament.status === 'ACTIVE' ? 'success' : 'default'} >{tournament.status}</Badge>
        <h1 style={{ margin: '0 0 12px', fontSize: '3rem', fontWeight: 900, color: '#f0f6fc' }}>{tournament.name}</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '24px', color: '#8b949e', fontSize: '1.1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={20} /> Playing as: <strong style={{ color: '#fff' }}>{team.franchiseName}</strong></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={20} /> {tournament.location || 'Global Server'}</span>
          </div>
          <Button 
            variant={team.isCheckedIn ? 'secondary' : 'primary'} 
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

      {/* Collapsible Draw & Brackets */}
      <div style={{ marginBottom: '48px' }}>
        <div 
          onClick={() => setIsDrawOpen(!isDrawOpen)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: '16px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: isDrawOpen ? '24px' : '0' }}
        >
          <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}><Activity color="var(--primary)" /> Draws & Pools</h2>
          {isDrawOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
        {isDrawOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <DrawViewer tournamentId={tournament.id} myTeamId={team.id} />
          </motion.div>
        )}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '16px', width: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
                {['Today', 'Tomorrow', 'Upcoming'].map((dateGroup, gIdx) => {
                  const groupMatches = schedule.filter((m: any, i: number) => {
                    if (gIdx === 0) return i === 0 || m.status === 'READY';
                    if (gIdx === 1) return i === 1;
                    return i > 1;
                  });

                  if (groupMatches.length === 0) return null;

                  return (
                    <div key={dateGroup} style={{ position: 'relative', zIndex: 1, paddingLeft: '48px' }}>
                      <div style={{ position: 'absolute', left: '10px', top: '0px', width: '14px', height: '14px', borderRadius: '50%', background: '#58a6ff', border: '3px solid #0d1117' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, color: '#8b949e', fontSize: '1.1rem' }}>{dateGroup}</h3>
                        {gIdx === 0 && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button variant="ghost" size="sm" onClick={() => {
                              const ics = "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Tennis Match\nEND:VEVENT\nEND:VCALENDAR";
                              const blob = new Blob([ics], { type: 'text/calendar' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = "match.ics";
                              a.click();
                            }} style={{ color: '#d2a8ff', fontSize: '0.8rem', padding: '4px 8px' }}><Calendar size={14} style={{ marginRight: '4px' }}/> Sync Cal</Button>
                            <Button variant="ghost" size="sm" style={{ color: '#58a6ff', fontSize: '0.8rem', padding: '4px 8px' }}><Bell size={14} style={{ marginRight: '4px' }}/> Alerts</Button>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {groupMatches.map((m: any) => {
                          const myScore = m.isTeamA ? (m.scoreState?.setsA || 0) : (m.scoreState?.setsB || 0);
                          const oppScore = m.isTeamA ? (m.scoreState?.setsB || 0) : (m.scoreState?.setsA || 0);
                          const isReady = m.status === 'READY';
                          
                          return (
                            <motion.div
                              key={m.id}
                              animate={isReady ? { boxShadow: ['0px 0px 0px rgba(88,166,255,0)', '0px 0px 20px rgba(88,166,255,0.8)', '0px 0px 0px rgba(88,166,255,0)'] } : {}}
                              transition={isReady ? { duration: 1.5, repeat: Infinity } : {}}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => setSelectedMatch(m)}
                              style={{ borderRadius: '12px', cursor: 'pointer' }}
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
                                    <Badge variant={isReady ? 'default' : 'default'}>{m.stage}</Badge>
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
                                    <Badge variant={m.status === 'COMPLETED' ? 'default' : m.status === 'IN_PROGRESS' ? 'success' : isReady ? 'default' : 'default'}>
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
                    </div>
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
              <Button variant="secondary" style={{ width: '100%' }}>Connect Stripe Express</Button>
            </Card>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Target color="#58a6ff" /> Shot Heatmap</h2>
            <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px' }}>
              <div style={{ width: '100%', height: '200px', background: '#3fb950', borderRadius: '4px', position: 'relative', overflow: 'hidden', border: '2px solid #fff' }}>
                {/* Court Lines */}
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '20%', right: '20%', borderLeft: '2px solid rgba(255,255,255,0.5)', borderRight: '2px solid rgba(255,255,255,0.5)' }} />
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: '#fff' }} />
                <div style={{ position: 'absolute', top: '25%', bottom: '25%', left: '50%', width: '2px', background: 'rgba(255,255,255,0.5)', transform: 'translateX(-50%)' }} />
                {/* Heat Points */}
                <div style={{ position: 'absolute', top: '20%', left: '30%', width: '30px', height: '30px', background: 'radial-gradient(circle, rgba(255,0,0,0.8) 0%, rgba(255,0,0,0) 70%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', top: '70%', left: '70%', width: '50px', height: '50px', background: 'radial-gradient(circle, rgba(255,165,0,0.8) 0%, rgba(255,165,0,0) 70%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', top: '80%', left: '40%', width: '40px', height: '40px', background: 'radial-gradient(circle, rgba(255,0,0,0.9) 0%, rgba(255,0,0,0) 70%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', top: '30%', left: '60%', width: '20px', height: '20px', background: 'radial-gradient(circle, rgba(255,255,0,0.8) 0%, rgba(255,255,0,0) 70%)', borderRadius: '50%' }} />
              </div>
              <p style={{ margin: '12px 0 0', fontSize: '0.85rem', color: '#8b949e', textAlign: 'center' }}>Aggregated shot placement from your last 3 matches.</p>
            </Card>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Lightbulb color="#d2a8ff" /> Virtual Coach</h2>
            <Card style={{ background: 'linear-gradient(145deg, #161b22, #0d1117)', border: '1px solid rgba(210,168,255,0.3)', padding: '24px' }}>
              <p style={{ margin: 0, fontSize: '1rem', color: '#f0f6fc', lineHeight: 1.6 }}>
                "{schedule.length > 0 && Math.round((schedule.filter((m: any) => m.winnerId === team.id).length / schedule.filter((m: any) => m.status === 'COMPLETED').length) * 100) > 50 
                  ? 'Your aggressive baseline play is working. Maintain depth on your forehand to secure the upcoming match.' 
                  : 'Focus on improving your first serve percentage. Opponents are capitalizing on your second serve.'}"
              </p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <Badge variant="default">AI Generated</Badge>
                <Badge variant="default">Based on Pool Stats</Badge>
              </div>
            </Card>
          </section>

        </div>
      </div>

      {/* Opponent Profile & Match Details Modal */}
      {selectedMatch && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedMatch(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()} style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: '#f0f6fc', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User color="var(--primary)" />
                {selectedMatch.opponent}
              </h3>
              <Badge variant="default">Trust: 98</Badge>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.85rem', color: '#8b949e', textTransform: 'uppercase', marginBottom: '8px' }}>Head-to-Head</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>0 - 0</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.85rem', color: '#8b949e', textTransform: 'uppercase', marginBottom: '8px' }}>Win Rate</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3fb950' }}>75%</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.85rem', color: '#8b949e', textTransform: 'uppercase', marginBottom: '8px' }}>Recent Form</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f0f6fc', display: 'flex', gap: '4px', justifyContent: 'center' }}>
                  <span style={{ color: '#3fb950' }}>W</span>-<span style={{ color: '#3fb950' }}>W</span>-<span style={{ color: '#f85149' }}>L</span>-<span style={{ color: '#3fb950' }}>W</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b949e' }}>Stage</span><span style={{ color: '#f0f6fc', fontWeight: 600 }}>{selectedMatch.stage}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b949e' }}>Court Assignment</span><span style={{ color: '#f0f6fc', fontWeight: 600 }}>{selectedMatch.court?.name || 'TBA'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b949e' }}>Status</span><span style={{ color: '#f0f6fc', fontWeight: 600 }}>{selectedMatch.status.replace('_', ' ')}</span></div>
            </div>

            {selectedMatch.status === 'COMPLETED' && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', marginTop: '24px', display: 'flex', gap: '12px' }}>
                <Button variant="secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <PlayCircle size={16} /> Watch Highlights
                </Button>
                <Button variant="secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Activity size={16} /> Detailed Stats
                </Button>
              </div>
            )}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ background: '#3b5998', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>f</button>
                <button style={{ background: '#1da1f2', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Share2 size={18} /></button>
              </div>
              <Button variant="primary" onClick={() => setSelectedMatch(null)}>Close</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

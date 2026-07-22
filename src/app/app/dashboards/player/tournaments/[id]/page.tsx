'use client';

import React, { use, useState, useEffect } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Wallet, PlayCircle, Share2, MapPin, Shield, ChevronDown, ChevronUp, User, Activity, Calendar, Bell, MessageCircle, Lightbulb, Target, Plus, Check } from 'lucide-react';
import Link from 'next/link';
import { DrawViewer } from '@/components/tennis/DrawViewer';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const mockDataMap: Record<string, any> = {
  'mock-sandbox-pools': {
    success: true,
    tournament: { id: 'mock-sandbox-pools', name: 'Sandbox Rivals (Pools Stage)', status: 'ACTIVE', formatType: 'Pool Play', scoringRules: 'Standard', location: 'Sandbox Arena', prizeMoney: '10,000 XP', startDate: new Date(Date.now() + 86400000).toISOString(), registrationPhase: 'EARLY', isActive: false, categories: "Men's Singles, Women's Singles", allowMultiCategory: true },
    team: { franchiseName: 'Sandbox Team', isCheckedIn: false, categories: JSON.stringify(["Men's Singles"]) },
    schedule: [],
    pool: { name: 'Pool A', standings: [{ teamName: 'Sandbox Team', wins: 0, losses: 0, points: 0 }] }
  },
  'mock-sandbox-knockouts': {
    success: true,
    tournament: { id: 'mock-sandbox-knockouts', name: 'Sandbox Rivals (Knockouts Stage)', status: 'ACTIVE', formatType: 'Knockout', scoringRules: 'Standard', location: 'Sandbox Arena', prizeMoney: '10,000 XP', isActive: true },
    team: { franchiseName: 'Sandbox Team', isCheckedIn: true },
    schedule: [
      { id: 'm3', status: 'COMPLETED', stage: 'QUARTER-FINAL', teamA: { franchiseName: 'Sandbox Team' }, teamB: { franchiseName: 'Gamma Unit' }, winnerId: 'Sandbox Team', score: { sets: [{ a: 6, b: 2 }] }, isTeamA: true, opponent: 'Gamma Unit' },
      { id: 'm4', status: 'SCHEDULED', stage: 'SEMI-FINAL', teamA: { franchiseName: 'Sandbox Team' }, teamB: { franchiseName: 'Delta Core' }, isTeamA: true, opponent: 'Delta Core' }
    ],
    pool: null
  },
  'mock-sandbox-complete': {
    success: true,
    tournament: { id: 'mock-sandbox-complete', name: 'Sandbox Rivals (Completed)', status: 'COMPLETED', formatType: 'Knockout', scoringRules: 'Standard', location: 'Sandbox Arena', prizeMoney: '10,000 XP', isActive: true },
    team: { franchiseName: 'Sandbox Team', isCheckedIn: true },
    schedule: [
      { id: 'm5', status: 'COMPLETED', stage: 'FINAL', teamA: { franchiseName: 'Sandbox Team' }, teamB: { franchiseName: 'Omega Boss' }, winnerId: 'Sandbox Team', score: { sets: [{ a: 6, b: 4 }, { a: 7, b: 5 }] }, isTeamA: true, opponent: 'Omega Boss' }
    ],
    pool: null
  }
};

function LiveTournamentView({ data, mutate, resolvedParams }: { data: any, mutate: any, resolvedParams: any }) {
  const [isDrawOpen, setIsDrawOpen] = React.useState(true);
  const [selectedMatch, setSelectedMatch] = React.useState<any>(null);
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
    <>
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
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '20%', right: '20%', borderLeft: '2px solid rgba(255,255,255,0.5)', borderRight: '2px solid rgba(255,255,255,0.5)' }} />
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: '#fff' }} />
                <div style={{ position: 'absolute', top: '25%', bottom: '25%', left: '50%', width: '2px', background: 'rgba(255,255,255,0.5)', transform: 'translateX(-50%)' }} />
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
    </>
  );
}

function PreTournamentView({ data, mutate, resolvedParams }: { data: any, mutate: any, resolvedParams: any }) {
  const { tournament, team } = data;
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [copied, setCopied] = useState(false);
  const [isDrawOpen, setIsDrawOpen] = React.useState(false);
  const [addingCategory, setAddingCategory] = useState(false);

  let teamCategories: string[] = [];
  try {
    teamCategories = JSON.parse(team.categories || '[]');
  } catch (e) {
    teamCategories = [];
  }

  const allCategories = tournament.categories 
    ? tournament.categories.split(',').map((c: string) => c.trim()).filter(Boolean)
    : ["Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"];

  const availableCategories = allCategories.filter((c: string) => !teamCategories.includes(c));
  const canAddMore = tournament.allowMultiCategory && teamCategories.length < 3 && availableCategories.length > 0;

  useEffect(() => {
    if (!tournament.startDate) return;
    const targetDate = new Date(tournament.startDate).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      } else {
        setTimeLeft({
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tournament.startDate]);

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    navigator.clipboard.writeText(`${origin}/checkout?t=${tournament.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCategory = async (cat: string) => {
    setAddingCategory(true);
    try {
      const res = await fetch(`/api/player/tournaments/${tournament.id}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat })
      });
      if (res.ok) {
        mutate();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to add category');
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred.');
    }
    setAddingCategory(false);
  };

  return (
    <>
      <header style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div style={{ marginBottom: '16px' }}>
          <Badge variant="accent">{tournament.registrationPhase === 'OPEN' ? 'Registration Open' : 'Pre-Tournament'}</Badge>
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: '3.5rem', fontWeight: 900, color: '#f0f6fc', letterSpacing: '-0.02em' }}>{tournament.name}</h1>
        <p style={{ color: '#8b949e', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          You're successfully registered as <strong>{team.franchiseName}</strong>. The tournament starts soon!
        </p>
      </header>

      {/* Countdown Timer */}
      {tournament.startDate && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '48px' }}>
          {[
            { label: 'Days', value: timeLeft.d },
            { label: 'Hours', value: timeLeft.h },
            { label: 'Minutes', value: timeLeft.m },
            { label: 'Seconds', value: timeLeft.s },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: 'linear-gradient(180deg, #161b22 0%, #0d1117 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: '#58a6ff', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                {item.value.toString().padStart(2, '0')}
              </div>
              <span style={{ color: '#8b949e', marginTop: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* Main Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield color="var(--primary)" /> Registered Categories
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
              {teamCategories.length > 0 ? teamCategories.map((cat: string) => (
                <div key={cat} style={{ background: 'rgba(88,166,255,0.1)', border: '1px solid rgba(88,166,255,0.3)', color: '#58a6ff', padding: '8px 16px', borderRadius: '20px', fontWeight: 600 }}>
                  {cat}
                </div>
              )) : (
                <p style={{ color: '#8b949e', margin: 0 }}>No specific categories selected.</p>
              )}
            </div>

            {canAddMore && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px 0', color: '#e6edf3' }}>Add another category?</h3>
                <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '16px' }}>You can participate in up to 3 categories. Select an available category below to add it to your registration.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {availableCategories.map((cat: string) => (
                    <Button 
                      key={cat} 
                      variant="secondary" 
                      onClick={() => handleAddCategory(cat)}
                      disabled={addingCategory}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={16} /> Add {cat}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <div style={{ marginBottom: '48px' }}>
            <div 
              onClick={() => setIsDrawOpen(!isDrawOpen)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: isDrawOpen ? '24px' : '0', transition: 'all 0.2s ease' }}
            >
              <div>
                <h2 style={{ fontSize: '1.5rem', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}><Activity color="var(--primary)" /> Sneak Peek: Draws & Pools</h2>
                <p style={{ margin: 0, color: '#8b949e', fontSize: '0.9rem' }}>If the organizer has published the draws early, you can view them here.</p>
              </div>
              {isDrawOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
            {isDrawOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <DrawViewer tournamentId={tournament.id} myTeamId={team.id} />
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card style={{ background: 'linear-gradient(145deg, rgba(88,166,255,0.1), rgba(88,166,255,0.02))', border: '1px solid rgba(88,166,255,0.3)', padding: '24px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(88,166,255,0.2)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Share2 size={24} color="#58a6ff" />
            </div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: '#f0f6fc' }}>Invite Friends & Family</h3>
            <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Share this tournament with others to grow the competition! They can register using your unique link.
            </p>
            <Button variant="primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={handleCopyLink}>
              {copied ? <Check size={18} /> : <Share2 size={18} />}
              {copied ? 'Copied to Clipboard!' : 'Copy Share Link'}
            </Button>
          </Card>

          <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle color="#d2a8ff" size={20} /> Organizer Updates
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #d2a8ff' }}>
                <p style={{ margin: '0 0 8px 0', color: '#e6edf3', fontSize: '0.95rem' }}>"Welcome to the tournament! Make sure to check in at the front desk at least 30 minutes before your first match."</p>
                <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>- Tournament Director</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid rgba(255,255,255,0.2)' }}>
                <p style={{ margin: '0 0 8px 0', color: '#e6edf3', fontSize: '0.95rem' }}>"Draws will be published on Friday evening. Keep an eye on this page!"</p>
                <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>- System Notification</span>
              </div>
            </div>
            <Button variant="ghost" style={{ width: '100%', marginTop: '16px', color: '#8b949e' }}>View All Messages</Button>
          </Card>
        </div>

      </div>
    </>
  );
}

export default function PlayerTournamentDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
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

  const { tournament } = data;

  return (
    <div style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#f0f6fc', minHeight: '100vh' }}>
      
      {/* Back Link */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/app/dashboards/player" style={{ color: '#58a6ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          ← Back to Global Hub
        </Link>
      </div>

      {tournament.isActive ? (
        <LiveTournamentView data={data} mutate={mutate} resolvedParams={resolvedParams} />
      ) : (
        <PreTournamentView data={data} mutate={mutate} resolvedParams={resolvedParams} />
      )}

    </div>
  );
}

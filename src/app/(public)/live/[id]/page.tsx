'use client';

import React, { useState, use } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import styles from '../../../landing.module.css';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PublicLiveTournament({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data, error, isLoading } = useSWR(`/api/public/tournaments/${resolvedParams.id}`, fetcher, { refreshInterval: 10000 });
  const [activeTab, setActiveTab] = useState<'STANDINGS' | 'BRACKET' | 'MATCHES'>('STANDINGS');

  if (isLoading) return (
    <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-muted)' }}>Loading Broadcast Data...</div>
    </div>
  );

  if (error || !data?.success) return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <div className={styles.brand} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <span className={styles.brandDot} />
          Tennis <span className={styles.brandAccent}>Suite</span>
        </div>
      </nav>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
        <GlassCard>
          <div style={{ textAlign: 'center', color: 'var(--danger)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Tournament Offline</h2>
            <p style={{ color: 'var(--text-muted)' }}>This tournament is not available or could not be found.</p>
            <DynamicButton variant="secondary" onClick={() => router.push('/tournaments')} style={{ marginTop: '16px' }}>
              Return to Directory
            </DynamicButton>
          </div>
        </GlassCard>
      </main>
    </div>
  );

  const { tournament } = data;
  const tStatus = tournament.status || 'UPCOMING'; // UPCOMING, LIVE, COMPLETED
  
  // Safe fallbacks for data
  const pools = tournament.pools || [];
  const matches = tournament.matches || [];
  const knockoutMatches = matches.filter((m: any) => m.stage === 'KNOCKOUTS' || m.stage === 'SEMI' || m.stage === 'FINAL');
  const liveMatches = matches.filter((m: any) => m.status === 'IN_PROGRESS' || m.status === 'SCHEDULED');

  return (
    <div className={styles.page}>
      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.brand} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <span className={styles.brandDot} />
          Tennis <span className={styles.brandAccent}>Suite</span>
        </div>
        <div className={styles.navLinks}>
          <button className={styles.navLink} onClick={() => router.push('/tournaments')}>Tournament Directory</button>
        </div>
      </nav>

      {/* ── Header ── */}
      <div style={{ background: 'rgba(10,10,12,0.8)', borderBottom: '1px solid var(--card-border)', padding: '60px 24px 40px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ marginBottom: '16px' }}>
          {tStatus === 'UPCOMING' && <StatusBadge status="info">Pre-Tournament Countdown</StatusBadge>}
          {tStatus === 'LIVE' && <StatusBadge status="error" pulse>LIVE BROADCAST</StatusBadge>}
          {tStatus === 'COMPLETED' && <StatusBadge status="success">Tournament Concluded</StatusBadge>}
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: '0 0 16px', color: 'var(--text-main)' }}>{tournament.name}</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem' }}>
          {tournament.location || 'Global Server'} • {tournament.formatType || 'Standard'}
        </p>
      </div>

      <main style={{ flex: 1, position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px 60px' }}>
        
        {/* State-Aware Content */}
        {tStatus === 'UPCOMING' && (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <GlassCard style={{ maxWidth: '600px', margin: '0 auto', padding: '48px' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '16px' }}>Tournament is Upcoming</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '32px' }}>
                The broadcast feed will activate once the tournament goes live. Check back later or register to participate!
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <DynamicButton variant="primary" onClick={() => router.push(`/tournaments/${resolvedParams.id}/register`)}>
                  Register Now
                </DynamicButton>
                <DynamicButton variant="secondary" onClick={() => router.push('/tournaments')}>
                  Browse Other Events
                </DynamicButton>
              </div>
            </GlassCard>
          </div>
        )}

        {tStatus === 'COMPLETED' && (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
             <GlassCard style={{ maxWidth: '800px', margin: '0 auto', padding: '48px', background: 'linear-gradient(180deg, rgba(46, 160, 67, 0.05) 0%, rgba(10,10,12,0.8) 100%)' }}>
               <h2 style={{ fontSize: '2.5rem', color: 'var(--success)', marginBottom: '16px', textShadow: '0 0 20px rgba(46,160,67,0.3)' }}>Tournament Champion</h2>
               <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '32px' }}>
                 The event has concluded. View the final brackets and VOD replays below.
               </p>
               {/* In a real app, we'd render the champion here */}
             </GlassCard>
          </div>
        )}

        {/* Live & Completed Content (Tabs & Data) */}
        {(tStatus === 'LIVE' || tStatus === 'COMPLETED') && (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', padding: '32px 0', borderBottom: '1px solid var(--card-border)', marginBottom: '32px' }}>
              {['STANDINGS', 'BRACKET', 'MATCHES'].map(tab => (
                <DynamicButton 
                  key={tab} 
                  variant={activeTab === tab ? 'primary' : 'ghost'} 
                  onClick={() => setActiveTab(tab as any)}
                >
                  {tab}
                </DynamicButton>
              ))}
            </div>

            {/* Content Area */}
            <div>
              {activeTab === 'STANDINGS' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '32px', color: 'var(--text-main)' }}>Pool Standings</h2>
                  {pools.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No pools generated yet.</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                      {pools.map((pool: any) => (
                        <GlassCard key={pool.id} style={{ padding: 0, overflow: 'hidden' }}>
                          <div style={{ padding: '16px', borderBottom: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.02)' }}>
                            <h3 style={{ margin: 0, color: 'var(--accent)', fontSize: '1.1rem' }}>{pool.name}</h3>
                          </div>
                          <div style={{ padding: '16px' }}>
                            {pool.poolTeams.map((pt: any, index: number) => {
                              const stats = typeof pt.stats === 'string' ? JSON.parse(pt.stats) : pt.stats || {};
                              return (
                                <div key={pt.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: index !== pool.poolTeams.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
                                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{pt.team?.franchiseName || 'TBD'}</span>
                                  <span style={{ color: 'var(--text-muted)' }}>W: {stats.wins || 0} - L: {stats.losses || 0}</span>
                                </div>
                              );
                            })}
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'BRACKET' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-main)' }}>Knockout Draw Canvas</h2>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Drag to pan.</span>
                  </div>
                  
                  {knockoutMatches.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Bracket not generated yet.</p> : (
                    <div style={{ 
                      height: '600px', 
                      background: 'rgba(10,10,12,0.5)', 
                      border: '1px solid var(--card-border)', 
                      borderRadius: '16px',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'grab'
                    }}>
                      <motion.div 
                        drag 
                        dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                        style={{ width: '3000px', height: '2000px', position: 'absolute', top: '50px', left: '50px' }}
                      >
                        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                          <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                        
                        <div style={{ display: 'flex', gap: '80px', position: 'relative', zIndex: 10 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            <div style={{ color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 700 }}>Quarter-Finals</div>
                            {knockoutMatches.slice(0, 4).map((m: any) => (
                              <GlassCard key={m.id} style={{ width: '260px', padding: '16px' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--card-border)' }}>
                                   <span style={{ color: 'var(--text-main)' }}>{m.teamA?.franchiseName || m.placeholderA || 'TBD'}</span>
                                   <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{m.scoreState?.setsA}</span>
                                 </div>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                   <span style={{ color: 'var(--text-main)' }}>{m.teamB?.franchiseName || m.placeholderB || 'TBD'}</span>
                                   <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{m.scoreState?.setsB}</span>
                                 </div>
                              </GlassCard>
                            ))}
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '150px', marginTop: '60px' }}>
                            <div style={{ color: 'var(--text-muted)', marginBottom: '-130px', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 700 }}>Semi-Finals</div>
                            {knockoutMatches.slice(4, 6).map((m: any, idx: number) => (
                              <GlassCard key={m.id || `semi-${idx}`} style={{ width: '260px', padding: '16px' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--card-border)' }}>
                                   <span style={{ color: 'var(--text-main)' }}>{m.teamA?.franchiseName || m.placeholderA || 'TBD'}</span>
                                 </div>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                   <span style={{ color: 'var(--text-main)' }}>{m.teamB?.franchiseName || m.placeholderB || 'TBD'}</span>
                                 </div>
                              </GlassCard>
                            ))}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '150px', marginTop: '210px' }}>
                            <div style={{ color: '#ffd700', marginBottom: '-130px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 800, textShadow: '0 0 10px rgba(255,215,0,0.5)', fontSize: '0.85rem' }}>Championship Final</div>
                            {knockoutMatches.slice(6, 7).map((m: any, idx: number) => (
                              <GlassCard key={m.id || `final-${idx}`} style={{ width: '300px', padding: '16px', background: 'rgba(255, 215, 0, 0.05)', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,215,0,0.2)' }}>
                                   <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffd700' }}>{m.teamA?.franchiseName || m.placeholderA || 'TBD'}</span>
                                 </div>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                                   <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffd700' }}>{m.teamB?.franchiseName || m.placeholderB || 'TBD'}</span>
                                 </div>
                              </GlassCard>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'MATCHES' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '32px', color: 'var(--text-main)' }}>Order of Play</h2>
                  {liveMatches.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No live or upcoming matches.</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {liveMatches.map((m: any) => (
                        <GlassCard key={m.id} style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: 'var(--text-main)' }}>{m.teamA?.franchiseName || m.placeholderA || 'TBD'} vs {m.teamB?.franchiseName || m.placeholderB || 'TBD'}</h3>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                              {m.court?.name || 'TBA'} • Stage: {m.stage}
                            </div>
                          </div>
                          <div>
                            <StatusBadge status={m.status === 'IN_PROGRESS' ? 'success' : 'info'} pulse={m.status === 'IN_PROGRESS'}>
                              {m.status.replace('_', ' ')}
                            </StatusBadge>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

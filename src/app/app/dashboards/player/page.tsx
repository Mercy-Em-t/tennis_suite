'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { Trophy, Swords, CalendarDays, KeyRound, Star, Medal, Zap, Bell } from 'lucide-react';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AgentChat } from '@/components/ai/AgentChat';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

/* XP level thresholds */
const XP_LEVELS = [0, 100, 250, 500, 900, 1500, 2500];

function getXpLevel(xp: number) {
  let level = 1;
  let nextThreshold = XP_LEVELS[1];
  let prevThreshold = XP_LEVELS[0];
  for (let i = 1; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i]) {
      level = i + 1;
      prevThreshold = XP_LEVELS[i];
      nextThreshold = XP_LEVELS[i + 1] ?? XP_LEVELS[i] + 1000;
    } else {
      nextThreshold = XP_LEVELS[i];
      break;
    }
  }
  const progress = Math.min(((xp - prevThreshold) / (nextThreshold - prevThreshold)) * 100, 100);
  return { level, nextThreshold, prevThreshold, progress };
}

export default function TeamDashboard() {
  const { data, error, isLoading } = useSWR('/api/player/dashboard', fetcher);
  const [quickJoinTournament, setQuickJoinTournament] = useState<any>(null);
  const [quickJoinForm, setQuickJoinForm] = useState({ teamName: '', categories: [] as string[] });
  const [myTournamentsTab, setMyTournamentsTab] = useState<'ACTIVE' | 'UPCOMING' | 'PAST'>('ACTIVE');
  const [discoverFilters, setDiscoverFilters] = useState({ category: '', location: '', date: '' });
  const [isSandbox, setIsSandbox] = React.useState(false);

  React.useEffect(() => {
    setIsSandbox(localStorage.getItem('ENABLE_SANDBOX') === 'true');
    const handleStorage = () => setIsSandbox(localStorage.getItem('ENABLE_SANDBOX') === 'true');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (isLoading) return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading Player Hub...</div>;
  if (error || !data?.success) return <div style={{ padding: '40px', color: '#f85149' }}>Failed to load profile. Are you logged in?</div>;

  const { user, myTournaments = [], upcomingTournaments = [] } = data;
  const badges: string[] = Array.isArray(user.badges)
    ? user.badges
    : (() => { try { return JSON.parse(user.badges); } catch { return []; } })();

  const { level, nextThreshold, progress } = getXpLevel(user.globalXp || 0);

  let finalMyTournaments = [...myTournaments];
  if (isSandbox) {
    finalMyTournaments.unshift(
      {
        tournamentId: 'mock-sandbox-pools',
        tournamentName: 'Sandbox Rivals (Pools Stage)',
        isActive: true,
        registrationPhase: 'CLOSED',
        franchiseName: `${user.name} Team`,
        matchesPlayed: 0,
        nextMatchText: 'REPORT TO COURT'
      },
      {
        tournamentId: 'mock-sandbox-knockouts',
        tournamentName: 'Sandbox Rivals (Knockouts Stage)',
        isActive: true,
        registrationPhase: 'CLOSED',
        franchiseName: `${user.name} Team`,
        matchesPlayed: 3,
        nextMatchText: 'SEMI FINALS'
      },
      {
        tournamentId: 'mock-sandbox-complete',
        tournamentName: 'Sandbox Rivals (Completed)',
        isActive: false,
        registrationPhase: 'CLOSED',
        franchiseName: `${user.name} Team`,
        matchesPlayed: 6,
        nextMatchText: 'CHAMPION'
      }
    );
  }

  const filteredMyTournaments = finalMyTournaments.filter((t: any) => {
    const isUpcoming = !t.isActive && t.registrationPhase !== 'CLOSED';
    const isPast = !t.isActive && t.registrationPhase === 'CLOSED';
    if (myTournamentsTab === 'ACTIVE') return t.isActive;
    if (myTournamentsTab === 'UPCOMING') return isUpcoming;
    if (myTournamentsTab === 'PAST') return isPast;
    return true;
  });

  const filteredUpcoming = upcomingTournaments.filter((t: any) => {
    if (discoverFilters.category && t.categories) {
       if (!t.categories.toLowerCase().includes(discoverFilters.category.toLowerCase())) return false;
    }
    if (discoverFilters.location && t.location) {
       if (!t.location.toLowerCase().includes(discoverFilters.location.toLowerCase())) return false;
    }
    if (discoverFilters.date && t.startDate) {
       const tournamentDate = new Date(t.startDate);
       const now = new Date();
       if (discoverFilters.date === 'today') {
         if (tournamentDate.toDateString() !== now.toDateString()) return false;
       } else if (discoverFilters.date === 'this_week') {
         const diffTime = tournamentDate.getTime() - now.getTime();
         if (diffTime < 0 || diffTime > 7 * 24 * 60 * 60 * 1000) return false;
       } else if (discoverFilters.date === 'this_month') {
         if (tournamentDate.getMonth() !== now.getMonth() || tournamentDate.getFullYear() !== now.getFullYear()) return false;
       }
    }
    return true;
  });

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* ── Header ── */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/app/dashboards/player/profile" style={{ cursor: 'pointer', display: 'block', transition: 'transform 0.2s', ...({ ':hover': { transform: 'scale(1.05)' } } as any) }}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
            ) : (
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#000' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 8px 0', background: 'linear-gradient(90deg, #fff, var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
              Player Hub
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0, fontWeight: 500 }}>
              Welcome back, {user.name}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(210,168,255,0.05)', border: '1px solid rgba(210,168,255,0.2)', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#d2a8ff', fontWeight: 700, letterSpacing: '1px' }}>SANDBOX</span>
            <button 
              onClick={() => {
                const next = !isSandbox;
                setIsSandbox(next);
                localStorage.setItem('ENABLE_SANDBOX', next ? 'true' : 'false');
                window.dispatchEvent(new Event('storage'));
              }}
              style={{ 
                width: '36px', height: '20px', borderRadius: '10px', background: isSandbox ? '#d2a8ff' : 'rgba(255,255,255,0.1)', 
                position: 'relative', border: 'none', cursor: 'pointer', transition: 'background 0.3s', padding: 0
              }}
            >
              <motion.div 
                layout 
                initial={false}
                animate={{ x: isSandbox ? 18 : 2 }}
                style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px' }}
              />
            </button>
          </div>
          <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0f6fc', cursor: 'pointer', position: 'relative' }}>
            <Bell size={20} />
            <span style={{ position: 'absolute', top: '10px', right: '12px', width: '8px', height: '8px', background: '#f85149', borderRadius: '50%', border: '2px solid #0d1117' }}></span>
          </button>
        </div>
      </motion.header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', alignItems: 'start' }}>
        
        {/* ── Left Column: Tournaments ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Swords size={24} color="var(--primary)" />
                My Tournaments
              </h2>
              <Link href="/app/dashboards/player/tournaments/history" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                View All →
              </Link>
            </div>

            {myTournaments.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '8px', width: 'fit-content' }}>
                {['ACTIVE', 'UPCOMING', 'PAST'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setMyTournamentsTab(tab as any)}
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: '6px', 
                      border: 'none', 
                      background: myTournamentsTab === tab ? 'var(--primary)' : 'transparent',
                      color: myTournamentsTab === tab ? '#000' : 'var(--text-muted)',
                      fontWeight: myTournamentsTab === tab ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tab.charAt(0) + tab.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            )}

            {finalMyTournaments.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)', padding: '40px', textAlign: 'center' }}>
                <Trophy size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.25rem' }}>No Tournaments Yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>You haven't joined any tournaments. Discover new events below to start your journey.</p>
                <DynamicButton variant="primary" onClick={() => document.getElementById('discover-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  Discover and Join Tournaments
                </DynamicButton>
              </div>
            ) : filteredMyTournaments.length === 0 ? (
               <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No {myTournamentsTab.toLowerCase()} tournaments found.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {filteredMyTournaments.map((t: any, idx: number) => {
                  const isUpcoming = !t.isActive && t.registrationPhase !== 'CLOSED';
                  return (
                  <Link href={`/app/dashboards/player/tournaments/${t.tournamentId}`} key={t.tournamentId} style={{ textDecoration: 'none' }}>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        padding: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      whileHover={{ y: -4, borderColor: 'var(--primary)', background: 'rgba(255,255,255,0.04)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', fontWeight: 700 }}>{t.tournamentName}</h3>
                        <StatusBadge status={t.isActive ? 'success' : isUpcoming ? 'info' : undefined} >
                          {t.isActive ? 'Ongoing' : isUpcoming ? ((t.registrationPhase === 'EARLY' || t.registrationPhase === 'LATE') ? 'Reg Open' : 'Upcoming') : 'Past'}
                        </StatusBadge>
                      </div>
                      <p style={{ color: 'var(--text-muted)', margin: '0 0 20px 0', fontSize: '0.9rem' }}>
                        Playing as: <span style={{ color: '#fff', fontWeight: 600 }}>{t.franchiseName}</span>
                      </p>
                      
                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Matches Played</span>
                          <span style={{ color: '#fff', fontWeight: 700 }}>{t.matchesPlayed}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Next Match</span>
                          <span style={{ 
                            color: t.nextMatchText === 'REPORT TO COURT' ? '#f85149' : '#fff', 
                            fontWeight: 700,
                            animation: t.nextMatchText === 'REPORT TO COURT' ? 'pulse 2s infinite' : 'none'
                          }}>
                            {t.nextMatchText}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                )})}
              </div>
            )}
          </section>

          <section id="discover-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={24} color="var(--primary)" />
                Discover Tournaments
              </h2>
              <Link href="/tournaments" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                View All →
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Filter by category..." 
                value={discoverFilters.category}
                onChange={e => setDiscoverFilters(prev => ({ ...prev, category: e.target.value }))}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '8px', color: '#fff', outline: 'none', flex: 1, minWidth: '150px' }}
              />
              <input 
                type="text" 
                placeholder="Filter by location..." 
                value={discoverFilters.location}
                onChange={e => setDiscoverFilters(prev => ({ ...prev, location: e.target.value }))}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '8px', color: '#fff', outline: 'none', flex: 1, minWidth: '150px' }}
              />
              <select 
                value={discoverFilters.date}
                onChange={e => setDiscoverFilters(prev => ({ ...prev, date: e.target.value }))}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '8px', color: '#fff', outline: 'none', flex: 1, minWidth: '150px', appearance: 'none' }}
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
              </select>
              {(discoverFilters.category || discoverFilters.location || discoverFilters.date) && (
                <button 
                  onClick={() => setDiscoverFilters({ category: '', location: '', date: '' })}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-muted)', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Clear
                </button>
              )}
            </div>

            {filteredUpcoming.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No tournaments match your filters.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredUpcoming.map((t: any) => (
                  <div key={t.id} onClick={() => window.location.href = `/tournaments/${t.id}/profile`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')} onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--card-border)')}>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.1rem' }}>{t.name}</h3>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {t.formatType} • {t.location || 'Online'}
                        {t.startDate && ` • ${new Date(t.startDate).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <StatusBadge status="info">{t.registrationPhase}</StatusBadge>
                      {finalMyTournaments.some((mt: any) => mt.tournamentId === t.id) ? (
                        <DynamicButton variant="secondary" onClick={(e) => e.stopPropagation()} style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                          Already Signed Up
                        </DynamicButton>
                      ) : (
                        <DynamicButton variant="primary" onClick={(e) => {
                          e.stopPropagation();
                          setQuickJoinTournament(t);
                          setQuickJoinForm({ teamName: `${user.name} Team`, categories: [] });
                        }}>
                          Join
                        </DynamicButton>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* ── Right Column: Gamification & Action ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Umpire Claim */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            style={{ background: 'linear-gradient(145deg, rgba(210,168,255,0.1) 0%, rgba(210,168,255,0.02) 100%)', border: '1px solid rgba(210,168,255,0.3)', borderRadius: '16px', padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ background: 'rgba(210,168,255,0.2)', padding: '8px', borderRadius: '8px' }}>
                <KeyRound size={20} color="#d2a8ff" />
              </div>
              <h3 style={{ margin: 0, color: '#d2a8ff', fontSize: '1.2rem', fontWeight: 700 }}>Assigned as Umpire?</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Enter the 6-digit PIN provided by your referee to securely access the scoring terminal.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                id="umpire-pin-input"
                placeholder="000000" 
                maxLength={6}
                style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(210,168,255,0.2)', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '1.2rem', letterSpacing: '4px', textAlign: 'center', outline: 'none' }}
              />
              <DynamicButton 
                variant="secondary" 
                style={{ borderColor: '#d2a8ff', color: '#d2a8ff' }}
                onClick={async () => {
                  const pin = (document.getElementById('umpire-pin-input') as HTMLInputElement)?.value;
                  if (!pin || pin.length !== 6) return alert('Invalid PIN');
                  const res = await fetch('/api/player/umpire/claim', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pin })
                  });
                  const d = await res.json();
                  if (d.success) {
                    window.location.href = `/team/umpire/${d.tournamentId}/${d.matchId}`;
                  } else {
                    alert(d.error || 'Failed to claim match');
                  }
                }}
              >
                Claim
              </DynamicButton>
            </div>
          </motion.div>

          {/* Gamification */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '24px' }}
          >
            <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="var(--accent)" />
              Gamification Status
            </h3>
            
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.05em' }}>{user.globalXp || 0}</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '1.2rem' }}>XP</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Level <span style={{ color: '#fff', fontWeight: 700 }}>{level}</span>
              </div>
            </div>

            <div style={{ marginBottom: '8px', background: 'rgba(0,0,0,0.5)', height: '12px', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ position: 'absolute', top: 0, left: 0, bottom: 0, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '6px' }}
              />
            </div>
            <p style={{ textAlign: 'right', margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {nextThreshold - (user.globalXp || 0)} XP to Level {level + 1}
            </p>

            <div style={{ marginTop: '32px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 700 }}>Earned Badges</p>
              {badges.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No badges yet. Play matches to earn them!</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {badges.map((badge, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Medal size={16} color="gold" />
                      <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>{badge}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
      <AgentChat playerId={user?.id || ''} tournamentId={myTournaments?.[0]?.tournamentId || ''} />

      {quickJoinTournament && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '8px', marginTop: 0 }}>Join Tournament</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Registering for {quickJoinTournament.name}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Team / Franchise Name</label>
                <input 
                  type="text" 
                  value={quickJoinForm.teamName} 
                  onChange={e => setQuickJoinForm({ ...quickJoinForm, teamName: e.target.value })}
                  style={{ background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '12px', borderRadius: '6px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                  Select Categories {quickJoinTournament.allowMultiCategory ? '(Max 3)' : '(Choose 1)'}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid #30363d' }}>
                  {(quickJoinTournament.categories 
                    ? quickJoinTournament.categories.split(',').map((c: string) => c.trim()).filter(Boolean)
                    : ["Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"]
                  ).map((cat: string) => {
                    const disabled = quickJoinTournament.allowMultiCategory 
                      ? quickJoinForm.categories.length >= 3 && !quickJoinForm.categories.includes(cat)
                      : false;
                    
                    return (
                      <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
                        <input 
                          type={quickJoinTournament.allowMultiCategory ? "checkbox" : "radio"} 
                          name="quick-join-category"
                          checked={quickJoinForm.categories.includes(cat)}
                          onChange={() => {
                            if (!quickJoinTournament.allowMultiCategory) {
                              setQuickJoinForm({ ...quickJoinForm, categories: [cat] });
                            } else {
                              const isSelected = quickJoinForm.categories.includes(cat);
                              let newCats = [];
                              if (isSelected) {
                                newCats = quickJoinForm.categories.filter(c => c !== cat);
                              } else {
                                if (quickJoinForm.categories.length >= 3) return;
                                newCats = [...quickJoinForm.categories, cat];
                              }
                              setQuickJoinForm({ ...quickJoinForm, categories: newCats });
                            }
                          }}
                          disabled={disabled}
                          style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                        />
                        <span style={{ color: '#fff', fontSize: '0.9rem' }}>{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <DynamicButton variant="secondary" onClick={() => setQuickJoinTournament(null)}>Cancel</DynamicButton>
              <DynamicButton 
                variant="primary" 
                disabled={!quickJoinForm.teamName || quickJoinForm.categories.length === 0}
                onClick={() => {
                  const categoriesJson = JSON.stringify(quickJoinForm.categories);
                  window.location.href = `/checkout?t=${quickJoinTournament.id}&f=${encodeURIComponent(quickJoinForm.teamName)}&c=${encodeURIComponent(categoriesJson)}&src=app`;
                }}
              >
                Continue to Checkout
              </DynamicButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

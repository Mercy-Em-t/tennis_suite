'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, Swords, CalendarDays, KeyRound, Star, Medal, Zap } from 'lucide-react';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { StatusBadge } from '@/components/ui/StatusBadge';

const mockData = {
  user: {
    name: 'Jane Doe',
    globalXp: 850,
    badges: ['First Win', 'Early Bird', 'Flawless Set'],
  },
  myTournaments: [
    {
      tournamentId: 'summer-smash',
      tournamentName: 'Summer Smash 2026',
      franchiseName: 'The Net Ninjas',
      status: 'ACTIVE',
      matchesPlayed: 3,
      nextMatchText: 'REPORT TO COURT',
    },
    {
      tournamentId: 'winter-classic',
      tournamentName: 'Winter Classic 2025',
      franchiseName: 'Baseline Ballers',
      status: 'COMPLETED',
      matchesPlayed: 5,
      nextMatchText: 'Tournament Ended',
    }
  ],
  upcomingTournaments: [
    {
      id: 'autumn-invitational',
      name: 'Autumn Invitational',
      formatType: 'Singles & Doubles',
      location: 'Central Park Courts',
      registrationPhase: 'Early Bird',
    }
  ]
};

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

export default function PlayerHubSandbox() {
  const { user, myTournaments, upcomingTournaments } = mockData;
  const { level, nextThreshold, progress } = getXpLevel(user.globalXp);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* ── Header ── */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px' }}
      >
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 8px 0', background: 'linear-gradient(90deg, #fff, var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
            Player Hub
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0, fontWeight: 500 }}>
            Welcome back, {user.name}
          </p>
        </div>
      </motion.header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', alignItems: 'start' }}>
        
        {/* ── Left Column: Tournaments ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <section>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Swords size={24} color="var(--primary)" />
              My Tournaments
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {myTournaments.map((t, idx) => (
                <Link href={`/sandbox/team/tournaments/${t.tournamentId}`} key={t.tournamentId} style={{ textDecoration: 'none' }}>
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
                    <StatusBadge status={t.status === 'ACTIVE' ? 'LIVE' : t.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING'} />
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
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarDays size={24} color="var(--primary)" />
              Discover Tournaments
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {upcomingTournaments.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '20px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.1rem' }}>{t.name}</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {t.formatType} • {t.location}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <StatusBadge status="UPCOMING">{t.registrationPhase}</StatusBadge>
                    <DynamicButton variant="primary">Join</DynamicButton>
                  </div>
                </div>
              ))}
            </div>
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
                placeholder="000 000" 
                style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(210,168,255,0.2)', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '1.2rem', letterSpacing: '4px', textAlign: 'center', outline: 'none' }}
              />
              <DynamicButton variant="outline" style={{ borderColor: '#d2a8ff', color: '#d2a8ff' }}>
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
                <span style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.05em' }}>{user.globalXp}</span>
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
              {nextThreshold - user.globalXp} XP to Level {level + 1}
            </p>

            <div style={{ marginTop: '32px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 700 }}>Earned Badges</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {user.badges.map((badge, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Medal size={16} color="gold" />
                    <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

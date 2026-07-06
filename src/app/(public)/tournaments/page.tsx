'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../landing.module.css';
import { GlassCard } from '@/components/ui/GlassCard';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function TournamentsDirectoryPage() {
  const router = useRouter();

  // Mock data for scaffolding
  const tournaments = [
    {
      id: 'purely-doubles',
      title: 'The Purely Doubles Elite Circuit',
      status: 'upcoming',
      description: 'Professional tournament management for doubles players. Live telemetry, cinematic broadcasts, and an AI-powered walled garden for every role.',
      date: 'Aug 15 - Aug 20, 2026',
    },
    {
      id: 'summer-smash',
      title: 'Summer Smash Open',
      status: 'live',
      description: 'Annual summer tournament featuring top-tier singles and doubles action across multiple age brackets.',
      date: 'Jul 01 - Jul 10, 2026',
    },
    {
      id: 'winter-classic',
      title: 'Winter Classic Invitational',
      status: 'completed',
      description: 'Invitation-only event showcasing the best emerging talent in professional tennis.',
      date: 'Dec 10 - Dec 15, 2025',
    }
  ];

  return (
    <div className={styles.page}>
      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.brand} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <span className={styles.brandDot} />
          Tennis <span className={styles.brandAccent}>Suite</span>
        </div>
        <div className={styles.navLinks}>
          <button className={styles.navLink} onClick={() => router.push('/login')}>Login</button>
        </div>
      </nav>

      {/* ── Directory Container ── */}
      <main style={{ flex: 1, padding: '120px 24px', position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div className={styles.heroBg} />
        <div className={styles.heroGlow} />

        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>Tournament Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Browse active, upcoming, and past tournaments hosted on the Tennis Suite platform.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {tournaments.map(t => (
            <GlassCard key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <StatusBadge 
                  status={t.status === 'live' ? 'error' : t.status === 'upcoming' ? 'success' : 'info'} 
                  pulse={t.status === 'live'}
                >
                  {t.status === 'live' ? 'LIVE NOW' : t.status === 'upcoming' ? 'Registration Open' : 'Completed'}
                </StatusBadge>
              </div>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {t.title}
              </h3>
              
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {t.description}
              </p>

              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                📅 {t.date}
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {t.status === 'upcoming' && (
                  <DynamicButton variant="primary" onClick={() => router.push(`/tournaments/${t.id}/register`)} style={{ flex: 1, height: '40px', fontSize: '0.85rem' }}>
                    Register
                  </DynamicButton>
                )}
                {t.status !== 'upcoming' && (
                  <DynamicButton variant="primary" onClick={() => router.push(`/tournaments/${t.id}/profile`)} style={{ flex: 1, height: '40px', fontSize: '0.85rem' }}>
                    View Brackets
                  </DynamicButton>
                )}
                <DynamicButton variant="secondary" icon="📡" onClick={() => router.push(`/live/${t.id}`)} style={{ flex: 1, height: '40px', fontSize: '0.85rem' }}>
                  {t.status === 'completed' ? 'Watch VOD' : 'Watch Live'}
                </DynamicButton>
              </div>
            </GlassCard>
          ))}
        </div>
      </main>
    </div>
  );
}

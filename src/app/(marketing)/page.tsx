import React from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

import { prisma } from '@/lib/prisma';

// Client Components
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { FadeInUp, FadeInScale, AnimatedCounter } from '@/components/marketing/AnimatedSections';

// UI Components
import { GlassCard } from '@/components/ui/GlassCard';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { StatusBadge } from '@/components/ui/StatusBadge';

/* ─── Stats ─── */
const STATS = [
  { value: 12, suffix: '+', label: 'Tournaments Run' },
  { value: 480, suffix: '', label: 'Matches Scored' },
  { value: 96, suffix: '', label: 'Franchises Registered' },
  { value: 200, suffix: 'ms', label: 'Max Latency' },
];

/* ─── How it works steps for Organizers ─── */
const STEPS = [
  {
    num: '01',
    title: 'Launch a Tournament',
    desc: 'Set up your brackets, formats, and referee roles in minutes. Instant registration and secure Stripe payments built-in.',
  },
  {
    num: '02',
    title: 'Score Live On-Court',
    desc: 'Equip referees with a dedicated PWA for point-by-point live scoring. Works entirely offline, syncing automatically when connection returns.',
  },
  {
    num: '03',
    title: 'Broadcast to the World',
    desc: 'Fans and players watch real-time telemetry, live leaderboards, and cinematic streams with sub-200ms latency.',
  },
];

export default async function LandingPage() {
  const activeTournaments = await prisma.tournament.findMany({
    where: {
      isActive: true,
      lifecyclePhase: { not: 'ARCHIVED' }
    },
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  return (
    <div className={styles.page}>
      
      {/* ── Navbar (Client) ── */}
      <MarketingNavbar />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroMesh} />
        <div className={styles.heroGrid} />

        <FadeInUp style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={styles.heroContent}>
            <div style={{ marginBottom: '32px' }}>
              <StatusBadge status="success" pulse>
                Tennis Suite Platform
              </StatusBadge>
            </div>

            <h1 className={styles.headline}>
              The Ultimate Tournament<br />
              <span className={styles.headlineAccent}>Management System</span>
            </h1>

            <p className={styles.subhead}>
              Host, manage, and broadcast your tennis tournaments swiftly. 
              Built for organizers who demand real-time telemetry, automated scoring, 
              and a professional-grade experience for every player and fan.
            </p>

            <div className={styles.ctaGroup}>
              <Link href="/host-onboarding">
                <DynamicButton variant="primary">
                  Start Hosting Today
                </DynamicButton>
              </Link>
              <Link href="#tournaments">
                <DynamicButton variant="secondary" icon="🏆">
                  Browse Tournaments
                </DynamicButton>
              </Link>
            </div>
          </div>
        </FadeInUp>
      </section>

      {/* ── Tournaments Grid ── */}
      <section className={styles.tournamentsSection} id="tournaments">
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Active Tournaments</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Browse and join currently public tournaments hosted on the Tennis Suite platform.</p>
        
        <div className={styles.tournamentsGrid}>
          {activeTournaments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No active tournaments at the moment. Check back soon!</p>
          ) : (
            activeTournaments.map(t => (
              <GlassCard key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <StatusBadge status={t.registrationPhase === 'CLOSED' ? 'info' : 'success'}>
                    {t.registrationPhase === 'CLOSED' ? 'Registration Closed' : 'Registration Open'}
                  </StatusBadge>
                </div>
                
                <h3 className={styles.tcTitle}>
                  {t.name.split(' ').slice(0, -1).join(' ')}<br />
                  <span className={styles.headlineAccent}>{t.name.split(' ').slice(-1)}</span>
                </h3>
                
                <p className={styles.tcDesc}>
                  {t.location || 'Location TBD'} • {t.formatType || 'Open Format'}<br />
                  {t.prizeMoney ? `Prize Pool: ${t.prizeMoney}` : 'No Prize Pool'}
                </p>
                
                <div className={styles.tcCtaGroup} style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {t.registrationPhase !== 'CLOSED' && (
                    <Link href={`/tournaments/${t.slug}/register`}>
                      <DynamicButton variant="primary" style={{ flex: 1, height: '44px', fontSize: '0.9rem' }}>
                        Register for Tournament
                      </DynamicButton>
                    </Link>
                  )}
                  <Link href={`/live/${t.slug}`}>
                    <DynamicButton variant="secondary" icon="📡" style={{ flex: 1, height: '44px', fontSize: '0.9rem' }}>
                      Watch Live Broadcast
                    </DynamicButton>
                  </Link>
                </div>
              </GlassCard>
            ))
          )}
        </div>

        <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center' }}>
          <Link href="/tournaments">
            <DynamicButton variant="secondary" style={{ padding: '0 32px', height: '48px' }}>
              View All Tournaments →
            </DynamicButton>
          </Link>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className={styles.howSection} id="how-it-works">
        <FadeInUp>
          <div style={{ textAlign: 'center' }}>
            <p className={styles.sectionLabel}>How It Works</p>
            <h2 className={styles.sectionTitle}>
              From setup to championship<br />in three simple steps.
            </h2>
          </div>
        </FadeInUp>

        <div className={styles.stepsGrid}>
          {STEPS.map((step, i) => (
            <FadeInUp key={step.num} delay={i * 0.12}>
              <GlassCard style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className={styles.stepNumber}>{step.num}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </GlassCard>
            </FadeInUp>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {STATS.map((stat, i) => (
            <FadeInUp key={stat.label} delay={i * 0.1} style={{ flex: '1 1 auto' }}>
              <div className={styles.statBlock}>
                <div className={styles.statValue}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            </FadeInUp>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <FadeInScale className={styles.ctaBanner}>
        <div className={styles.ctaBannerGlow} />
        <div className={styles.ctaBannerText}>
          <h2 className={styles.ctaBannerTitle}>
            Ready to host your tournament?{' '}
            <span style={{ color: 'var(--accent)' }}>Get started in minutes.</span>
          </h2>
          <p className={styles.ctaBannerSub}>
            Join the premier platform for professional tournament management and live broadcast telemetry.
          </p>
        </div>
        <div className={styles.ctaBannerActions}>
          <Link href="/host-onboarding">
            <DynamicButton variant="primary">
              Host a Tournament →
            </DynamicButton>
          </Link>
          <span className={styles.ctaBannerNote}>Free to set up · Secure payments via Stripe</span>
        </div>
      </FadeInScale>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span className={styles.brandDot} />
          Tennis Suite
          <span className={styles.footerTagline}>Professional Tournament Engine</span>
        </div>
        <div className={styles.footerLinks}>
          <Link href="/about" className={styles.footerLink}>About Us</Link>
          <Link href="/pricing" className={styles.footerLink}>Pricing</Link>
          <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
          <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
          <Link href="/login" className={styles.footerLink}>Login</Link>
        </div>
      </footer>

    </div>
  );
}

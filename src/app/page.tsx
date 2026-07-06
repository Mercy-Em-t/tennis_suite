'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './landing.module.css';

// New UI Components
import { GlassCard } from '@/components/ui/GlassCard';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { StatusBadge } from '@/components/ui/StatusBadge';

/* ─── Animated counter ─── */

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count}
      <span className={styles.statSuffix}>{suffix}</span>
    </span>
  );
}

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

function LandingContent() {
  const router = useRouter();


  return (
    <div className={styles.page}>

      {/* ── Sticky Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          Tennis <span className={styles.brandAccent}>Suite</span>
        </div>

        <div className={styles.navLinks}>
          <button className={styles.navLink} onClick={() => router.push('/roles')}>
            Platform Roles
          </button>
          <button className={styles.navLink} onClick={() => router.push('/tournaments')}>
            Watch Live
          </button>
          <button 
            className={styles.navLink} 
            onClick={() => {
              const el = document.getElementById('how-it-works');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            How It Works
          </button>
        </div>

        <div className={styles.navActions}>
          <DynamicButton variant="secondary" onClick={() => router.push('/login')} style={{ height: '40px', padding: '0 16px', fontSize: '0.9rem' }}>
            Login
          </DynamicButton>
          <DynamicButton variant="primary" onClick={() => router.push('/host-onboarding')} style={{ height: '40px', padding: '0 16px', fontSize: '0.9rem' }}>
            Host a Tournament
          </DynamicButton>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroMesh} />
        <div className={styles.heroGrid} />

        <motion.div
          className={styles.heroContent}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
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
            <DynamicButton
              variant="primary"
              onClick={() => router.push('/host-onboarding')}
            >
              Start Hosting Today
            </DynamicButton>
            <DynamicButton
              variant="secondary"
              icon="🏆"
              onClick={() => {
                const el = document.getElementById('tournaments');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Browse Tournaments
            </DynamicButton>
          </div>
        </motion.div>
      </section>

      {/* ── Tournaments Grid ── */}
      <section className={styles.tournamentsSection} id="tournaments">
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Active Tournaments</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Browse and join currently public tournaments hosted on the Tennis Suite platform.</p>
        
        <div className={styles.tournamentsGrid}>
          {/* Hardcoded Card 1: The original 'Purely Doubles' tournament */}
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <StatusBadge status="success">
                Registration Open — Summer Circuit 2026
              </StatusBadge>
            </div>
            
            <h3 className={styles.tcTitle}>
              The Purely Doubles<br />
              <span className={styles.headlineAccent}>Elite Circuit</span>
            </h3>
            
            <p className={styles.tcDesc}>
              Professional tournament management for doubles players. Live telemetry, cinematic broadcasts, and an AI-powered walled garden for every role.
            </p>
            
            <div className={styles.tcCtaGroup} style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <DynamicButton variant="primary" onClick={() => router.push('/tournaments/purely-doubles/register')} style={{ flex: 1, height: '44px', fontSize: '0.9rem' }}>
                Register for Tournament
              </DynamicButton>
              <DynamicButton variant="secondary" icon="📡" onClick={() => router.push('/live/purely-doubles')} style={{ flex: 1, height: '44px', fontSize: '0.9rem' }}>
                Watch Live Broadcast
              </DynamicButton>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className={styles.howSection} id="how-it-works">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className={styles.sectionLabel}>How It Works</p>
          <h2 className={styles.sectionTitle}>
            From setup to championship<br />in three simple steps.
          </h2>
        </motion.div>

        <div className={styles.stepsGrid}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <GlassCard style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className={styles.stepNumber}>{step.num}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className={styles.statBlock}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className={styles.statValue}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <motion.section
        className={styles.ctaBanner}
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
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
          <DynamicButton variant="primary" onClick={() => router.push('/host-onboarding')}>
            Host a Tournament →
          </DynamicButton>
          <span className={styles.ctaBannerNote}>Free to set up · Secure payments via Stripe</span>
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span className={styles.brandDot} />
          Tennis Suite
          <span className={styles.footerTagline}>Professional Tournament Engine</span>
        </div>
        <div className={styles.footerLinks}>
          <button className={styles.footerLink} onClick={() => router.push('/about')}>About Us</button>
          <button className={styles.footerLink} onClick={() => router.push('/contact')}>Contact</button>
          <button className={styles.footerLink} onClick={() => router.push('/login')}>Login</button>
          <button className={styles.footerLink} onClick={() => router.push('/host-onboarding')}>Host</button>
          <button className={styles.footerLink} onClick={() => router.push('/tournaments')}>Watch</button>
        </div>
      </footer>


    </div>
  );
}

export default function LandingPage() {
  return (
    <React.Suspense fallback={<div className={styles.page} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <LandingContent />
    </React.Suspense>
  );
}

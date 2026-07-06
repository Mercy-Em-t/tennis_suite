'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import styles from './gateway.module.css';

/* ─── Mock fallback if SSE fails or empty ─── */
const TICKER_ITEMS = [
  { id: 1, teamA: 'Baseline Bashers', teamB: 'Topspin Titans', score: '6–4, 3–2', status: 'LIVE' },
  { id: 2, teamA: 'Net Crushers', teamB: 'Rally Kings', score: '7–5, 6–3', status: 'FINAL' },
  { id: 3, teamA: 'Ace Factory', teamB: 'Drop Shot Duos', score: '4–1', status: 'LIVE' },
  { id: 4, teamA: 'Slice & Dice', teamB: 'Power Servers', score: '6–2, 6–4', status: 'FINAL' },
  { id: 5, teamA: 'Court Commanders', teamB: 'Volley Force', score: '2–0', status: 'LIVE' },
  { id: 6, teamA: 'The Lob Squad', teamB: 'Smash Bros', score: '6–7, 5–5', status: 'LIVE' },
];

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
      // ease-out cubic
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

/* ─── Role card data ─── */
const ROLES = [
  {
    icon: '🏠',
    iconBg: 'rgba(88,166,255,0.12)',
    title: 'Host / Admin',
    route: '/admin',
    accent: '#58a6ff',
    desc: 'Run the whole operation. Create tournaments, manage franchises, and override any live match state with a single click.',
    caps: ['Create & publish tournaments', 'Manage all team registrations', 'Override live match status', 'View raw telemetry sandbox'],
  },
  {
    icon: '🎾',
    iconBg: 'rgba(126,231,135,0.12)',
    title: 'Referee',
    route: '/referee',
    accent: '#7ee787',
    desc: 'The field authority. Score points with giant tap targets, work offline through network dead zones, sync when signal returns.',
    caps: ['Live score entry via PWA', 'Offline queue with auto-sync', 'Warmup → In-Progress state machine', 'Tiebreaker mode activation'],
  },
  {
    icon: '📡',
    iconBg: 'rgba(248,81,73,0.12)',
    title: 'Broadcaster',
    route: '/broadcast',
    accent: '#f85149',
    desc: 'Cinematic production mode. Receive sub-200ms score pushes via SSE and drive professional-grade overlays for your stream.',
    caps: ['Full-screen match slate', 'Compact scorebug overlay', 'Sponsor rotation integration', 'Real-time latency monitoring'],
  },
  {
    icon: '👤',
    iconBg: 'rgba(210,168,255,0.12)',
    title: 'Player',
    route: '/team',
    accent: '#d2a8ff',
    desc: 'Your personal walled garden. Track your franchise schedule, earn XP and badges, and chat with the Agent OS AI.',
    caps: ['Live match schedule tracking', 'Global XP & badge system', 'Agent OS AI support chat', 'Premium telemetry upgrades'],
  },
];

/* ─── How it works steps ─── */
const STEPS = [
  {
    num: '01',
    title: 'Register Your Franchise',
    desc: 'Claim your team name, choose your circuit, and complete the one-time registration. Stripe-powered, instant confirmation.',
  },
  {
    num: '02',
    title: 'Play Your Matches',
    desc: 'Show up to court. Your referee scores every point live. You watch the scoreboard update in real time from your phone.',
  },
  {
    num: '03',
    title: 'Climb the Circuit',
    desc: 'Earn XP per win, unlock badges, and climb the standings. The top franchise wins the Championship slot.',
  },
];

/* ─── Stats ─── */
const STATS = [
  { value: 12, suffix: '+', label: 'Tournaments Run' },
  { value: 480, suffix: '', label: 'Matches Scored' },
  { value: 96, suffix: '', label: 'Franchises Registered' },
  { value: 200, suffix: 'ms', label: 'Max Latency' },
];

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function PublicLanding() {
  const router = useRouter();

  const [liveItems, setLiveItems] = useState(TICKER_ITEMS);

  useEffect(() => {
    const eventSource = new EventSource('/api/ticker/sse');

    eventSource.addEventListener('ticker_update', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (Array.isArray(data) && data.length > 0) {
          setLiveItems(data);
        }
      } catch (err) {
        console.error('Ticker parse error:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  // Duplicate ticker items for seamless loop
  const tickerItems = [...liveItems, ...liveItems];

  return (
    <div className={styles.page}>

      {/* ── Sticky Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          Tennis <span className={styles.brandAccent}>Suite</span>
        </div>

        <div className={styles.navLinks}>
          <button className={styles.navLink} onClick={() => router.push('/broadcast')}>
            Watch Live
          </button>
          <span className={styles.navLink} style={{ cursor: 'default', opacity: 0.4 }}>How It Works</span>
        </div>

        <div className={styles.navActions}>
          <button className={styles.navLoginBtn} onClick={() => router.push('/login')}>
            Login
          </button>
          <button className={styles.navRegisterBtn} onClick={() => router.push('/register')}>
            Register Team →
          </button>
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
          <div className={styles.statusPill}>
            <span className={styles.liveIndicator} />
            Registration Open — Summer Circuit 2026
          </div>

          <h1 className={styles.headline}>
            The Purely Doubles<br />
            <span className={styles.headlineAccent}>Elite Circuit</span>
          </h1>

          <p className={styles.subhead}>
            Professional tournament management for doubles players.
            Live telemetry, cinematic broadcasts, and an AI-powered walled garden for every role.
          </p>

          <div className={styles.ctaGroup}>
            <motion.button
              className={styles.primaryCta}
              onClick={() => router.push('/register')}
              whileTap={{ scale: 0.97 }}
            >
              Claim Your Franchise
            </motion.button>
            <motion.button
              className={styles.secondaryCta}
              onClick={() => router.push('/broadcast')}
              whileTap={{ scale: 0.97 }}
            >
              <span className={styles.secondaryCtaIcon}>📡</span>
              Watch Live Broadcast
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── Live Ticker ── */}
      <div className={styles.tickerSection}>
        <div className={styles.tickerLabel}>
          <span className={styles.tickerLabelDot} />
          Live
        </div>
        <div className={styles.tickerTrack}>
          {tickerItems.map((item, i) => (
            <div key={`${item.id}-${i}`} className={styles.tickerItem}>
              <span className={styles.tickerTeams}>
                {item.teamA} <span style={{ color: '#8b949e', fontWeight: 400 }}>vs</span> {item.teamB}
              </span>
              <span className={styles.tickerScore}>{item.score}</span>
              {item.status === 'LIVE'
                ? <span className={styles.tickerLive}><span className={styles.tickerLiveDot} />Live</span>
                : <span className={styles.tickerFinal}>Final</span>
              }
              <span className={styles.tickerSep}>·</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── How It Works ── */}
      <section className={styles.howSection}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className={styles.sectionLabel}>How It Works</p>
          <h2 className={styles.sectionTitle}>
            From registration to<br />championship in three steps.
          </h2>
        </motion.div>

        <div className={styles.stepsGrid}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className={styles.stepCard}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <div className={styles.stepNumber}>{step.num}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Role Preview Cards ── */}
      <section className={styles.rolesSection}>
        <div className={styles.rolesSectionInner}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className={styles.sectionLabel}>The Walled Gardens</p>
            <h2 className={styles.sectionTitle}>
              Every role. A dedicated<br />professional surface.
            </h2>
          </motion.div>

          <div className={styles.rolesGrid}>
            {ROLES.map((role, i) => (
              <motion.div
                key={role.title}
                className={styles.roleCard}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className={styles.roleCardTop}>
                  <div className={styles.roleIconWrap} style={{ background: role.iconBg }}>
                    {role.icon}
                  </div>
                  <div className={styles.roleCardMeta}>
                    <h3 className={styles.roleTitle}>{role.title}</h3>
                    <span className={styles.roleRoute}>{role.route}</span>
                  </div>
                </div>
                <p className={styles.roleDesc}>{role.desc}</p>
                <ul className={styles.roleCapsList}>
                  {role.caps.map(cap => (
                    <li key={cap} className={styles.roleCap} style={{ color: role.accent }}>
                      <span className={styles.roleCapDot} />
                      <span style={{ color: '#8b949e' }}>{cap}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
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
            Ready to compete?<br />
            <span style={{ color: '#58a6ff' }}>Spots are limited.</span>
          </h2>
          <p className={styles.ctaBannerSub}>
            The Summer 2026 circuit brackets fill fast. Register your franchise today.
          </p>
        </div>
        <div className={styles.ctaBannerActions}>
          <button className={styles.ctaBannerBtn} onClick={() => router.push('/register')}>
            Register Your Franchise →
          </button>
          <span className={styles.ctaBannerNote}>No commitment · Stripe-secured payment</span>
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          Tennis <span style={{ color: '#58a6ff' }}>Suite</span>
        </div>
        <div className={styles.footerLinks}>
          <button className={styles.footerLink} onClick={() => router.push('/login')}>Login</button>
          <button className={styles.footerLink} onClick={() => router.push('/register')}>Register</button>
          <button className={styles.footerLink} onClick={() => router.push('/broadcast')}>Watch Live</button>
        </div>
        <span className={styles.footerTagline}>Purely Doubles · Elite Circuit 2026</span>
      </footer>

    </div>
  );
}

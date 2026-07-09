'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import styles from '../landing.module.css';

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

export default function PlatformRolesPage() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      {/* ── Sticky Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.brand} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <span className={styles.brandDot} />
          Tennis <span className={styles.brandAccent}>Suite</span>
        </div>

        <div className={styles.navLinks}>
          <button className={styles.navLink} onClick={() => router.push('/broadcast')}>
            Watch Live
          </button>
          <button className={styles.navLink} onClick={() => router.push('/landing-v2')}>
            Home
          </button>
        </div>

        <div className={styles.navActions}>
          <button className={styles.navLoginBtn} onClick={() => router.push('/login')}>
            Login
          </button>
          <button className={styles.navRegisterBtn} onClick={() => router.push('/register')}>
            Host a Tournament
          </button>
        </div>
      </nav>

      <div style={{ paddingTop: '120px' }}>
        {/* ── Role Preview Cards ── */}
        <section className={styles.rolesSection} style={{ borderTop: 'none', background: 'transparent' }}>
          <div className={styles.rolesSectionInner}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
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
                  animate={{ opacity: 1, y: 0 }}
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
      </div>

      {/* ── Footer ── */}
      <footer className={styles.footer} style={{ marginTop: 'auto' }}>
        <div className={styles.footerBrand}>
          Tennis <span style={{ color: '#58a6ff' }}>Suite</span>
        </div>
        <div className={styles.footerLinks}>
          <button className={styles.footerLink} onClick={() => router.push('/login')}>Login</button>
          <button className={styles.footerLink} onClick={() => router.push('/register')}>Register</button>
          <button className={styles.footerLink} onClick={() => router.push('/broadcast')}>Watch Live</button>
        </div>
        <span className={styles.footerTagline}>Tournament Management System</span>
      </footer>
    </div>
  );
}

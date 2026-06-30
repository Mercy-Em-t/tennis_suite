'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import styles from './gateway.module.css';

export default function Storefront() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      
      {/* Top Navbar */}
      <header className={styles.navbar}>
        <div className={styles.brand}>Tennis <span style={{ color: '#58a6ff' }}>Suite</span></div>
        <div className={styles.navActions}>
          <button className={styles.navLink} onClick={() => router.push('/login')}>Login</button>
          <Button variant="primary" size="sm" onClick={() => router.push('/register')}>Register Team</Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className={styles.heroWrapper}>
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={styles.heroContent}
        >
          <div className={styles.statusPill}>
            <span className={styles.liveIndicator}></span>
            <span>REGISTRATION OPEN</span>
          </div>

          <h1 className={styles.headline}>
            The Purely Doubles<br/>
            <span style={{ color: '#7ee787' }}>Summer Circuit</span>
          </h1>
          
          <p className={styles.subhead}>
            Join the elite club of doubles players. Live telemetry, broadcast channels, and dynamic gamification.
          </p>

          <div className={styles.ctaGroup}>
            <Button size="lg" onClick={() => router.push('/register')} style={{ padding: '0 40px', fontSize: '1.1rem' }}>
              Claim Your Franchise
            </Button>
            <button className={styles.secondaryCta} onClick={() => router.push('/broadcast')}>
              Watch Live Broadcast
            </button>
          </div>
        </motion.div>
      </main>

      {/* Visual Data / Features (Minimalist Premium Design) */}
      <section className={styles.features}>
        <div className={styles.featureItem}>
          <div className={styles.featureIcon}>📡</div>
          <h3>Sub-200ms Telemetry</h3>
          <p>Instant scoring updates pushed to the Broadcaster channel.</p>
        </div>
        <div className={styles.featureItem}>
          <div className={styles.featureIcon}>🛡️</div>
          <h3>Offline Resilient</h3>
          <p>Referees score matches without cell reception natively.</p>
        </div>
        <div className={styles.featureItem}>
          <div className={styles.featureIcon}>🏆</div>
          <h3>Dynamic Gamification</h3>
          <p>Global XP and badge unlocking.</p>
        </div>
      </section>
    </div>
  );
}


'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from '../landing.module.css';

export default function AboutPage() {
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
          <button className={styles.navLink} onClick={() => router.push('/roles')}>Platform Roles</button>
          <button className={styles.navLink} onClick={() => router.push('/broadcast')}>Watch Live</button>
          <button className={styles.navLink} onClick={() => router.push('/about')}>About Us</button>
          <button className={styles.navLink} onClick={() => router.push('/contact')}>Contact</button>
        </div>

        <div className={styles.navActions}>
          <button className={styles.navLoginBtn} onClick={() => router.push('/login')}>Login</button>
          <button className={styles.navRegisterBtn} onClick={() => router.push('/host-onboarding')}>Host a Tournament</button>
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '120px 24px', position: 'relative' }}>
        <div className={styles.heroBg} />
        <div className={styles.heroGlow} />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ maxWidth: '800px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 2 }}
        >
          <div className={styles.statusPill} style={{ margin: '0 auto 24px auto' }}>
            Our Mission
          </div>
          
          <h1 className={styles.headline}>
            Empowering the Next Generation of <br />
            <span className={styles.headlineAccent}>Sports Organizers</span>
          </h1>

          <p className={styles.subhead} style={{ textAlign: 'left', marginBottom: '32px' }}>
            Running a professional-grade tournament shouldn't require an army of staff or complex, fragmented legacy software. 
          </p>

          <p className={styles.subhead} style={{ textAlign: 'left', marginBottom: '32px' }}>
            At Tennis Suite, we believe that elite, automated technology should be accessible to organizers of all levels. From seamless franchise registration to sub-200ms real-time telemetry, our mission is to provide an ecosystem where hosts, referees, broadcasters, and players can thrive in a beautifully orchestrated digital environment.
          </p>

          <p className={styles.subhead} style={{ textAlign: 'left', marginBottom: '48px' }}>
            We handle the friction so you can focus on the game.
          </p>

          <motion.button
            className={styles.primaryCta}
            onClick={() => router.push('/host-onboarding')}
            whileTap={{ scale: 0.97 }}
            style={{ margin: '0 auto' }}
          >
            Join the Revolution
          </motion.button>
        </motion.div>
      </main>

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
          <button className={styles.footerLink} onClick={() => router.push('/broadcast')}>Watch</button>
        </div>
      </footer>
    </div>
  );
}

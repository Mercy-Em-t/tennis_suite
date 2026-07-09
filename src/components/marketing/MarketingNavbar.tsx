'use client';

import React from 'react';
import Link from 'next/link';
import styles from '@/app/(marketing)/landing.module.css';
import { DynamicButton } from '@/components/ui/DynamicButton';

export function MarketingNavbar() {
  return (
    <nav className={styles.navbar}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div className={styles.brand} style={{ cursor: 'pointer' }}>
          <span className={styles.brandDot} />
          Tennis <span className={styles.brandAccent}>Suite</span>
        </div>
      </Link>

      <div className={styles.navLinks}>
        <Link href="/features" className={styles.navLink}>
          Features
        </Link>
        <Link href="/pricing" className={styles.navLink}>
          Pricing
        </Link>
        <Link href="/roles" className={styles.navLink}>
          Platform Roles
        </Link>
        <Link href="/tournaments" className={styles.navLink}>
          Watch Live
        </Link>
      </div>

      <div className={styles.navActions}>
        <Link href="/login">
          <DynamicButton variant="secondary" style={{ height: '40px', padding: '0 16px', fontSize: '0.9rem', border: 'none', background: 'transparent' }}>
            Login
          </DynamicButton>
        </Link>
        <Link href="/register">
          <DynamicButton variant="secondary" style={{ height: '40px', padding: '0 16px', fontSize: '0.9rem' }}>
            Sign Up
          </DynamicButton>
        </Link>
        <Link href="/host-onboarding">
          <DynamicButton variant="primary" style={{ height: '40px', padding: '0 16px', fontSize: '0.9rem' }}>
            Host a Tournament
          </DynamicButton>
        </Link>
      </div>
    </nav>
  );
}

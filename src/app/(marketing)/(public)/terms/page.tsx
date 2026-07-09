import React from 'react';
import Link from 'next/link';
import styles from '@/app/(marketing)/landing.module.css';
import { DynamicButton } from '@/components/ui/DynamicButton';

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className={styles.brand} style={{ cursor: 'pointer' }}>
            <span className={styles.brandDot} />
            Tennis <span className={styles.brandAccent}>Suite</span>
          </div>
        </Link>
        <div className={styles.navActions}>
          <Link href="/login">
            <DynamicButton variant="secondary" style={{ height: '40px' }}>
              Login
            </DynamicButton>
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 24px', color: 'var(--text-muted)', lineHeight: '1.8' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '32px' }}>Terms of Service</h1>
        
        <h2 style={{ fontSize: '1.5rem', color: 'white', marginTop: '32px', marginBottom: '16px' }}>1. Acceptance of Terms</h2>
        <p>By accessing and using the Tennis Suite platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>

        <h2 style={{ fontSize: '1.5rem', color: 'white', marginTop: '32px', marginBottom: '16px' }}>2. Organizer and Player Obligations</h2>
        <p>Organizers are strictly responsible for managing their own tournaments and disputes. Tennis Suite provides the software infrastructure but does not mediate physical event disputes.</p>

        <h2 style={{ fontSize: '1.5rem', color: 'white', marginTop: '32px', marginBottom: '16px' }}>3. Financial Transactions via Stripe</h2>
        <p>Tennis Suite uses Stripe Connect for all split-ledger payouts. By processing payments through our platform, you also agree to the Stripe Connected Account Agreement.</p>
        
        <p style={{ marginTop: '64px', fontSize: '0.875rem' }}>Last Updated: July 2026</p>
      </div>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import styles from '@/app/(marketing)/landing.module.css';
import { DynamicButton } from '@/components/ui/DynamicButton';

export default function PrivacyPage() {
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
        <h1 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '32px' }}>Privacy Policy</h1>
        
        <h2 style={{ fontSize: '1.5rem', color: 'white', marginTop: '32px', marginBottom: '16px' }}>1. Data Collection</h2>
        <p>We collect essential telemetry, including email addresses for authentication, and basic profile data to populate tournament leaderboards.</p>

        <h2 style={{ fontSize: '1.5rem', color: 'white', marginTop: '32px', marginBottom: '16px' }}>2. Stripe and Financial Data</h2>
        <p>We do not store your raw credit card information. All payment processing is securely offloaded to Stripe. We only retain the transaction receipts in our immutable ledgers.</p>

        <h2 style={{ fontSize: '1.5rem', color: 'white', marginTop: '32px', marginBottom: '16px' }}>3. Match Data Telemetry</h2>
        <p>Match results, real-time scoring data, and telemetry logs are considered public domain within the platform and may be broadcast globally during live matches.</p>
        
        <p style={{ marginTop: '64px', fontSize: '0.875rem' }}>Last Updated: July 2026</p>
      </div>
    </div>
  );
}

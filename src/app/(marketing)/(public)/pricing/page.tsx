import React from 'react';
import Link from 'next/link';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { FadeInUp } from '@/components/marketing/AnimatedSections';
import styles from '@/app/(marketing)/landing.module.css';

export default function PricingPage() {
  return (
    <div className={styles.page}>
      <MarketingNavbar />

      <section style={{ padding: '120px 24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <FadeInUp style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <StatusBadge status="success">Transparent Pricing</StatusBadge>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', margin: '24px 0 16px' }}>
            No subscriptions. <br />
            <span style={{ color: 'var(--accent)' }}>Only pay when you play.</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 48px' }}>
            Tennis Suite operates on a secure split-ledger system. The platform is completely free for players, and free for organizers to set up.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
            {/* Player Card */}
            <div style={{ flex: '1 1 300px', maxWidth: '400px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '40px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '8px' }}>For Players</h3>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'white', marginBottom: '24px' }}>$0</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                <li>✓ Join the free agent pool</li>
                <li>✓ Access live tournament broadcasts</li>
                <li>✓ Maintain global UTR/NTRP stats</li>
                <li>✓ Receive real-time court dispatches</li>
              </ul>
              <Link href="/register">
                <DynamicButton variant="secondary" style={{ width: '100%' }}>
                  Create Player Profile
                </DynamicButton>
              </Link>
            </div>

            {/* Organizer Card */}
            <div style={{ flex: '1 1 300px', maxWidth: '400px', background: 'linear-gradient(180deg, rgba(163, 230, 53, 0.1) 0%, rgba(22, 27, 34, 1) 100%)', border: '1px solid var(--accent)', borderRadius: '16px', padding: '40px', textAlign: 'left', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', right: '24px', background: 'var(--accent)', color: '#0a0a0a', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '12px' }}>
                HOSTS
              </div>
              <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '8px' }}>For Organizers</h3>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>5% <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>+ $0.30</span></div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>per team registration</p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                <li>✓ Infinite courts and matches</li>
                <li>✓ Automated bracket generation</li>
                <li>✓ Live offline-first Umpire PWA</li>
                <li>✓ Automated split-ledger payouts</li>
              </ul>
              <Link href="/host-onboarding">
                <DynamicButton variant="primary" style={{ width: '100%' }}>
                  Initialize Factory
                </DynamicButton>
              </Link>
            </div>
          </div>
        </FadeInUp>
      </section>
    </div>
  );
}

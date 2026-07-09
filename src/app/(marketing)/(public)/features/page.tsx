import React from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { FadeInUp } from '@/components/marketing/AnimatedSections';
import styles from '@/app/(marketing)/landing.module.css';

export default function FeaturesPage() {
  const features = [
    {
      title: "Court Dispatch Engine",
      desc: "Stop shouting over PA systems. The Marshal Grid lets you instantly map SCHEDULED matches to IDLE courts, automatically alerting players on their phones.",
      icon: "🎯"
    },
    {
      title: "Offline-First Umpire PWA",
      desc: "Referees can score points at the net with no Wi-Fi. The app uses IndexedDB outbox caching to sync the exact moment a cellular connection is restored.",
      icon: "📱"
    },
    {
      title: "Automated Brackets",
      desc: "When pool play finishes, the engine recalculates standings based on set differentials and instantly populates the knockout bracket. Zero manual math.",
      icon: "🏆"
    },
    {
      title: "Sub-200ms Telemetry",
      desc: "Connected through WebSockets, every point scored on the court is instantly broadcast to the spectator overlay and player dashboard.",
      icon: "⚡"
    }
  ];

  return (
    <div className={styles.page}>
      <MarketingNavbar />

      <section style={{ padding: '120px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <FadeInUp style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            Engineered for <span style={{ color: 'var(--accent)' }}>Scale.</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Tennis Suite replaces clipboards and spreadsheets with military-grade event infrastructure.
          </p>
        </FadeInUp>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {features.map((f, i) => (
            <FadeInUp key={i} delay={i * 0.1}>
              <GlassCard style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '12px' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{f.desc}</p>
              </GlassCard>
            </FadeInUp>
          ))}
        </div>
      </section>
    </div>
  );
}

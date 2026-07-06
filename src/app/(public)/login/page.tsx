'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from '../../landing.module.css';
import { GlassCard } from '@/components/ui/GlassCard';
import { DynamicButton } from '@/components/ui/DynamicButton';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      window.location.href = '/';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.brand} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <span className={styles.brandDot} />
          Tennis <span className={styles.brandAccent}>Suite</span>
        </div>
      </nav>

      {/* ── Login Container ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px', position: 'relative' }}>
        <div className={styles.heroBg} />
        <div className={styles.heroGlow} />

        <div style={{ maxWidth: '420px', width: '100%', position: 'relative', zIndex: 2 }}>
          <GlassCard style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', textAlign: 'center' }}>Login to Suite</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem', textAlign: 'center' }}>
                Secure access to your walled garden.
              </p>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                {error && (
                  <div style={{ background: 'rgba(248, 81, 73, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', border: '1px solid rgba(248,81,73,0.3)', textAlign: 'center' }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Email</label>
                  <input className={styles.inputField} type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Password</label>
                  <input className={styles.inputField} type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <DynamicButton type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Authenticating...' : 'Log In'}
                  </DynamicButton>
                  
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                      Don't have an account? <a href="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Register as a Player</a>
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                      Want to host a tournament? <a href="/host-onboarding" style={{ color: 'var(--success)', textDecoration: 'none' }}>Become an Organizer</a>
                    </p>
                  </div>
                </div>
              </form>
            </motion.div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

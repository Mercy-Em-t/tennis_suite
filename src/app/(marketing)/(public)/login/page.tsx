'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../landing.module.css';
import { GlassCard } from '@/components/ui/GlassCard';
import { DynamicButton } from '@/components/ui/DynamicButton';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Authenticating...');
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage('Authenticating...');
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setSuccess(true);
      setLoadingMessage('Routing you to your dashboard...');

      // Defer to the Central Sorting Hat router engine
      setTimeout(() => {
        window.location.href = '/app';
      }, 1000);
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
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
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
                        {loading ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <motion.div 
                              animate={{ rotate: 360 }} 
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
                              style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} 
                            />
                            {loadingMessage}
                          </div>
                        ) : 'Log In'}
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
              ) : (
                <motion.div
                  key="login-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
                >
                  <div style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '24px' }}>
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} 
                      style={{ position: 'absolute', inset: 0, border: '3px solid rgba(34,211,238,0.2)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} 
                    />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      🎾
                    </div>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Authentication Successful</h2>
                  <p style={{ color: 'var(--accent)', fontSize: '0.95rem' }}>{loadingMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

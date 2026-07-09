'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../landing.module.css';
import { GlassCard } from '@/components/ui/GlassCard';
import { DynamicButton } from '@/components/ui/DynamicButton';

export default function HostOnboardingPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/onboard-host', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create host account');

      setStatus('success');
      setStep(3);
      
      // Delay before routing to allow the user to see the success state
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong');
      setStatus('error');
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

      {/* ── Wizard Container ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px', position: 'relative' }}>
        <div className={styles.heroBg} />
        <div className={styles.heroGlow} />

        <div style={{ maxWidth: '500px', width: '100%', position: 'relative', zIndex: 2 }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: step >= 1 ? 'var(--accent)' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: step >= 2 ? 'var(--accent)' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: step >= 3 ? 'var(--success)' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
            </div>
          </div>

          <GlassCard style={{ minHeight: '420px', display: 'flex', flexDirection: 'column' }}>
            <AnimatePresence mode="wait">
              
              {/* STEP 1: Account Info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                >
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Create Organizer Account</h1>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>Start running elite tournaments in minutes.</p>

                  <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Full Name</label>
                      <input className={styles.inputField} type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Email Address</label>
                      <input className={styles.inputField} type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Password</label>
                      <input className={styles.inputField} type="password" required minLength={8} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <DynamicButton type="submit" style={{ width: '100%', justifyContent: 'center' }}>
                        Continue to Next Step
                      </DynamicButton>
                      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                        Already have an account? <a href="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Login here</a>
                      </p>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 2: Organization Info */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                >
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Organization Details</h1>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>What is the name of your club or organization?</p>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                    {status === 'error' && (
                      <div style={{ background: 'rgba(248, 81, 73, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', border: '1px solid rgba(248,81,73,0.3)' }}>
                        {errorMsg}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Organization Name</label>
                      <input className={styles.inputField} type="text" required value={formData.organizationName} onChange={e => setFormData({...formData, organizationName: e.target.value})} placeholder="e.g. Ace Tennis Academy" />
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', gap: '12px' }}>
                      <DynamicButton type="button" variant="secondary" onClick={handleBack} style={{ flex: 1, justifyContent: 'center' }}>
                        Back
                      </DynamicButton>
                      <DynamicButton type="submit" disabled={status === 'loading'} style={{ flex: 2, justifyContent: 'center', opacity: status === 'loading' ? 0.7 : 1 }}>
                        {status === 'loading' ? 'Creating...' : 'Create Account'}
                      </DynamicButton>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 3: Success */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
                >
                  <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🚀</div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Welcome to Tennis Suite!</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Redirecting to your Control Center...</p>
                </motion.div>
              )}

            </AnimatePresence>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

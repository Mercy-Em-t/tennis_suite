'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from '../landing.module.css';

export default function ContactPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) throw new Error('Submission failed');
      
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

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
          style={{ maxWidth: '600px', width: '100%', position: 'relative', zIndex: 2 }}
        >
          <h1 className={styles.headline} style={{ textAlign: 'center', marginBottom: '16px' }}>
            Get in <span className={styles.headlineAccent}>Touch</span>
          </h1>

          <p className={styles.subhead} style={{ textAlign: 'center', marginBottom: '48px' }}>
            Have questions about hosting your next tournament? Reach out below and our team will be in touch.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(22, 27, 34, 0.6)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            
            {status === 'success' && (
              <div style={{ padding: '16px', background: 'rgba(126, 231, 135, 0.1)', color: '#7ee787', borderRadius: '8px', border: '1px solid rgba(126, 231, 135, 0.2)', textAlign: 'center', marginBottom: '16px' }}>
                Message received! We will be in touch shortly.
              </div>
            )}

            {status === 'error' && (
              <div style={{ padding: '16px', background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', borderRadius: '8px', border: '1px solid rgba(248, 81, 73, 0.2)', textAlign: 'center', marginBottom: '16px' }}>
                Something went wrong. Please try again later.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: '#8b949e', fontWeight: 600 }}>Name</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ padding: '12px 16px', borderRadius: '8px', background: '#0d1117', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f0f6fc', fontSize: '1rem', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#58a6ff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: '#8b949e', fontWeight: 600 }}>Email Address</label>
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ padding: '12px 16px', borderRadius: '8px', background: '#0d1117', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f0f6fc', fontSize: '1rem', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#58a6ff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: '#8b949e', fontWeight: 600 }}>Message</label>
              <textarea 
                required 
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                style={{ padding: '12px 16px', borderRadius: '8px', background: '#0d1117', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f0f6fc', fontSize: '1rem', outline: 'none', resize: 'vertical' }}
                onFocus={(e) => e.target.style.borderColor = '#58a6ff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>

            <motion.button 
              type="submit"
              disabled={status === 'loading'}
              className={styles.primaryCta}
              whileTap={{ scale: status === 'loading' ? 1 : 0.98 }}
              style={{ marginTop: '16px', width: '100%', justifyContent: 'center', opacity: status === 'loading' ? 0.7 : 1 }}
            >
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </motion.button>

          </form>
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

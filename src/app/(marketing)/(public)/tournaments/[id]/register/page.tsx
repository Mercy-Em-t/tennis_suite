'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import styles from '../../../../landing.module.css';
import { GlassCard } from '@/components/ui/GlassCard';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { StatusBadge } from '@/components/ui/StatusBadge';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function TournamentRegistrationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const { data: tournamentResponse, error: fetchError, isLoading } = useSWR(`/api/public/tournaments/${id}`, fetcher);
  const tournament = tournamentResponse?.tournament;

  // Scaffolded state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    teamName: '',
    categories: [] as string[],
    partners: {} as Record<string, string>,
  });

  const toggleCategory = (cat: string) => {
    setForm(prev => {
      const isSelected = prev.categories.includes(cat);
      if (isSelected) {
        const newCats = prev.categories.filter(c => c !== cat);
        const newPartners = { ...prev.partners };
        delete newPartners[cat];
        return { ...prev, categories: newCats, partners: newPartners };
      } else {
        if (prev.categories.length >= 2) return prev; // Max 2 categories
        return { ...prev, categories: [...prev.categories, cat] };
      }
    });
  };

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Connect to the backend
      const res = await fetch('/api/auth/guest-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tournamentId: tournament?.id || id }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      setSuccess(true);
      // It returns a checkoutUrl
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading Tournament Details...</p>
      </div>
    );
  }

  if (fetchError || !tournament) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#f85149' }}>Tournament not found.</p>
      </div>
    );
  }

  // Parse categories from tournament string
  const availableCategories = tournament.categories 
    ? tournament.categories.split(',').map((c: string) => c.trim()).filter(Boolean)
    : ["Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"];

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <div className={styles.brand} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <span className={styles.brandDot} />
          Tennis <span className={styles.brandAccent}>Suite</span>
        </div>
        <div className={styles.navLinks}>
          <button className={styles.navLink} onClick={() => router.push('/tournaments')}>Back to Tournaments</button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '120px 24px', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center' }}>
        <div className={styles.heroBg} />
        
        <div style={{ maxWidth: '800px', width: '100%' }}>
          <div style={{ marginBottom: '32px' }}>
            <StatusBadge status="success" pulse={false}>
              Registration Open
            </StatusBadge>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '16px', marginBottom: '8px' }}>
              Register for {tournament.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
              {tournament.location || 'Location TBA'} • {tournament.formatType} • {tournament.prizeMoney || 'Glory & Honor'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
            {/* Form Column */}
            <GlassCard>
              {success ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎾</div>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '8px' }}>Preparing your Checkout...</h2>
                  <p style={{ color: 'var(--text-muted)' }}>Redirecting to secure payment portal...</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {error && (
                    <div style={{ background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', border: '1px solid rgba(248,81,73,0.3)' }}>
                      {error}
                    </div>
                  )}
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700, borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
                    Player Details
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Full Name</label>
                      <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={styles.inputField} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Email Address</label>
                      <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={styles.inputField} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Phone Number</label>
                      <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={styles.inputField} />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700, borderBottom: '1px solid var(--card-border)', paddingBottom: '12px', marginTop: '12px' }}>
                    Team & Category
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Categories (Max 2)</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                        {availableCategories.map((cat: string) => (
                          <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: form.categories.length >= 2 && !form.categories.includes(cat) ? 'not-allowed' : 'pointer', opacity: form.categories.length >= 2 && !form.categories.includes(cat) ? 0.5 : 1 }}>
                            <input 
                              type="checkbox" 
                              checked={form.categories.includes(cat)}
                              onChange={() => toggleCategory(cat)}
                              disabled={form.categories.length >= 2 && !form.categories.includes(cat)}
                              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                            />
                            <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{cat}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Team / Franchise Name</label>
                      <input type="text" required value={form.teamName} onChange={e => setForm({...form, teamName: e.target.value})} className={styles.inputField} placeholder="e.g. The Net Ninjas" />
                    </div>
                  </div>

                  <AnimatePresence>
                    {form.categories.some(c => c.toLowerCase().includes('doubles')) && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden', marginTop: '8px' }}>
                        <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>Doubles Partners</h4>
                        {form.categories.filter(c => c.toLowerCase().includes('doubles')).map(cat => (
                          <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              Partner for {cat}
                            </label>
                            <input 
                              type="text" 
                              required 
                              value={form.partners[cat] || ''} 
                              onChange={e => setForm(prev => ({ ...prev, partners: { ...prev.partners, [cat]: e.target.value } }))} 
                              className={styles.inputField} 
                              placeholder="Partner's full name or email address" 
                            />
                            <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>* They will receive an invite to confirm registration.</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div style={{ marginTop: '24px' }}>
                    <DynamicButton type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                      {loading ? 'Processing...' : 'Complete Registration & Pay'}
                    </DynamicButton>
                  </div>
                </form>
              )}
            </GlassCard>

            {/* Information Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <GlassCard>
                <h4 style={{ color: 'var(--text-main)', fontWeight: 700, marginBottom: '12px' }}>Available Categories</h4>
                <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {availableCategories.map((cat: string) => (
                    <li key={cat}>{cat}</li>
                  ))}
                </ul>
              </GlassCard>

              <GlassCard>
                <h4 style={{ color: 'var(--text-main)', fontWeight: 700, marginBottom: '12px' }}>Registration Rules</h4>
                <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>Players may register for a maximum of 2 categories.</li>
                  <li>For doubles, only one player needs to submit the initial registration.</li>
                  <li>All entry fees are collected securely upon confirmation.</li>
                </ul>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

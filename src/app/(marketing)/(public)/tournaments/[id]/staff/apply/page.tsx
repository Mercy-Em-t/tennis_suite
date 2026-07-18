'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import styles from '../../../../../landing.module.css';
import { GlassCard } from '@/components/ui/GlassCard';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function StaffApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const { data: tournamentResponse, error: fetchError, isLoading } = useSWR(`/api/public/tournaments/${id}`, fetcher);
  const tournament = tournamentResponse?.tournament;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'REFEREE'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/public/tournaments/${id}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Application failed');
      
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Application failed');
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

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.brand} style={{ textDecoration: 'none' }}>
          <span className={styles.brandDot} />
          Tennis <span className={styles.brandAccent}>Suite</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href={`/tournaments/${id}/profile`} style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ChevronLeft size={16} /> Back to Tournament
          </Link>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '120px 24px', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center' }}>
        <div className={styles.heroBg} />
        
        <div style={{ maxWidth: '600px', width: '100%' }}>
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <StatusBadge status="info" pulse={false}>
              Staff Application
            </StatusBadge>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '16px', marginBottom: '8px' }}>
              Apply to join {tournament.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
              Submit your application to become an official for this tournament.
            </p>
          </div>

          <GlassCard>
            {success ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '8px' }}>Application Submitted</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Your application for {form.role === 'REFEREE' ? 'Referee' : 'Court Marshall'} has been successfully submitted to the tournament host. You will receive an email once your application is reviewed.
                </p>
                <Link href={`/tournaments/${id}/profile`} style={{ textDecoration: 'none' }}>
                  <DynamicButton variant="secondary">Return to Tournament</DynamicButton>
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {error && (
                  <div style={{ background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', border: '1px solid rgba(248,81,73,0.3)' }}>
                    {error}
                  </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Role</label>
                    <select 
                      value={form.role} 
                      onChange={e => setForm({...form, role: e.target.value})} 
                      className={styles.inputField} 
                      style={{ appearance: 'none', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                    >
                      <option value="REFEREE">Referee</option>
                      <option value="MARSHALL">Court Marshall</option>
                    </select>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700, borderBottom: '1px solid var(--card-border)', paddingBottom: '12px', marginTop: '12px' }}>
                  Your Details
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Phone Number</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={styles.inputField} />
                </div>

                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <DynamicButton 
                    type="submit" 
                    variant="primary" 
                    disabled={loading || !form.name || !form.email}
                    style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 600 }}
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </DynamicButton>
                </div>
              </form>
            )}
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

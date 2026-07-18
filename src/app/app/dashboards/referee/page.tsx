'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function RefereeHub() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR('/api/referee/hub', fetcher);
  const [isSandbox, setIsSandbox] = useState(false);

  useEffect(() => {
    setIsSandbox(localStorage.getItem('ENABLE_REFEREE_SANDBOX') === 'true');
    const handleStorage = () => setIsSandbox(localStorage.getItem('ENABLE_REFEREE_SANDBOX') === 'true');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (isLoading) return <div style={{ padding: '24px', color: '#8b949e' }}>Loading Referee Hub...</div>;
  if (error || (data && !data.success)) {
    return (
      <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: '#58a6ff' }}>Referee Hub</h1>
        </header>
        <Card style={{ background: '#161b22', padding: '32px', textAlign: 'center', border: '1px solid #f85149' }}>
          <h2 style={{ color: '#f85149', margin: '0 0 16px 0' }}>Failed to Load Assignments</h2>
          <p style={{ color: '#8b949e' }}>{data?.error || error?.message || 'An unknown error occurred while fetching your matches.'}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '16px', padding: '8px 16px', background: '#21262d', color: '#c9d1d9', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer' }}>
            Retry Connection
          </button>
        </Card>
      </div>
    );
  }

  let finalTournaments = [...(data?.tournaments || [])];
  
  if (isSandbox) {
    finalTournaments.unshift({
      id: 'sandbox-1',
      name: 'Sandbox Major Open',
      isActive: true,
      courts: [] // Mock courts will be handled inside the specific dashboard
    });
  }

  return (
    <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' }}
      >
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 8px 0', background: 'linear-gradient(90deg, #fff, #58a6ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
            Referee Hub
          </h1>
          <p style={{ color: '#8b949e', margin: 0, fontSize: '1.1rem' }}>Select a tournament to enter the Command Center.</p>
        </div>
        
        {/* Sandbox Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(210,168,255,0.05)', border: '1px solid rgba(210,168,255,0.2)', padding: '8px 16px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#d2a8ff', fontWeight: 700, letterSpacing: '1px' }}>SANDBOX MODE</span>
            <button 
              onClick={() => {
                const next = !isSandbox;
                setIsSandbox(next);
                localStorage.setItem('ENABLE_REFEREE_SANDBOX', next ? 'true' : 'false');
                window.dispatchEvent(new Event('storage'));
              }}
              style={{ 
                width: '44px', height: '24px', borderRadius: '12px', background: isSandbox ? '#d2a8ff' : 'rgba(255,255,255,0.1)', 
                position: 'relative', border: 'none', cursor: 'pointer', transition: 'background 0.3s', padding: 0
              }}
            >
              <motion.div 
                layout 
                initial={false}
                animate={{ x: isSandbox ? 22 : 2 }}
                style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px' }}
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Tournament Cards Grid */}
      {finalTournaments.length === 0 ? (
        <Card style={{ background: '#161b22', padding: '48px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.25rem' }}>No Tournaments Assigned</h3>
          <p style={{ color: '#8b949e', margin: 0 }}>You are not currently assigned as a referee to any active tournaments.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {finalTournaments.map((t: any, idx: number) => (
            <Link href={`/app/dashboards/referee/tournaments/${t.id}`} key={t.id} style={{ textDecoration: 'none' }}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '24px',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: t.id === 'sandbox-1' ? '0 0 0 1px rgba(210,168,255,0.3) inset' : 'none'
                }}
                whileHover={{ y: -4, borderColor: t.id === 'sandbox-1' ? '#d2a8ff' : '#58a6ff', background: 'rgba(255,255,255,0.04)' }}
              >
                {t.id === 'sandbox-1' && (
                  <div style={{ position: 'absolute', top: 0, right: 0, background: '#d2a8ff', color: '#000', fontSize: '0.7rem', fontWeight: 800, padding: '4px 12px', borderBottomLeftRadius: '12px' }}>
                    MOCKED DATA
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.3rem', fontWeight: 700, paddingRight: '20px' }}>{t.name}</h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px' }}>
                    <span style={{ color: '#8b949e', fontSize: '0.9rem' }}>Courts</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>{t.courts?.length || (t.id === 'sandbox-1' ? 3 : 0)}</span>
                  </div>
                </div>
                
                <div style={{ marginTop: '24px', color: t.id === 'sandbox-1' ? '#d2a8ff' : '#58a6ff', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Enter Command Center →
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { Swords, MapPin } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { DynamicButton } from '@/components/ui/DynamicButton';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function TournamentHistoryPage() {
  const { data, error, isLoading } = useSWR('/api/player/history', fetcher);
  const [filter, setFilter] = useState<'ALL' | 'CURRENT' | 'UPCOMING' | 'PAST'>('ALL');

  if (isLoading) return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading History...</div>;
  if (error || !data?.success) return <div style={{ padding: '40px', color: '#f85149' }}>Failed to load history.</div>;

  const history = data.history || [];
  const filteredHistory = filter === 'ALL' ? history : history.filter((t: any) => t.category === filter);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ marginBottom: '16px' }}>
        <Link href="/dashboards/player" style={{ color: '#58a6ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          ← Back to Global Hub
        </Link>
      </div>

      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 16px 0', color: '#fff', letterSpacing: '-0.02em' }}>
          Tournament History
        </h1>
        
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {['ALL', 'CURRENT', 'UPCOMING', 'PAST'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              style={{
                background: filter === f ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: filter === f ? '#000' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: filter === f ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </header>

      {filteredHistory.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '48px' }}>
          No tournaments found for this filter.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {filteredHistory.map((t: any, idx: number) => (
            <Link href={`/app/dashboards/player/tournaments/${t.tournamentId}`} key={t.teamId} style={{ textDecoration: 'none' }}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '24px',
                  cursor: 'pointer'
                }}
                whileHover={{ y: -4, borderColor: 'var(--primary)', background: 'rgba(255,255,255,0.04)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', fontWeight: 700 }}>{t.tournamentName}</h3>
                  <StatusBadge status={t.status === 'ACTIVE' ? 'success' : t.category === 'info' ? 'info' : 'success'} >{t.status}</StatusBadge>
                </div>
                
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>Playing as: <strong style={{ color: '#fff' }}>{t.franchiseName}</strong></span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> {t.location || 'Online'}
                  </span>
                </div>
                
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Matches Played</span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>{t.matchesPlayed}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status</span>
                    <span style={{ 
                      color: t.nextMatchText === 'REPORT TO COURT' ? '#f85149' : '#fff', 
                      fontWeight: 700,
                      animation: t.nextMatchText === 'REPORT TO COURT' ? 'pulse 2s infinite' : 'none'
                    }}>
                      {t.nextMatchText}
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

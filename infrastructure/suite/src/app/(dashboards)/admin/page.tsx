'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function GlobalHostDashboard() {
  const router = useRouter();
  const { data, error, mutate } = useSWR('/api/tournaments', fetcher);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', formatType: 'FAST4_ROUND_ROBIN', maxTeams: '16', poolSize: '4', courts: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      courts: formData.courts.split(',').map(c => c.trim()).filter(Boolean)
    };
    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/tournaments/${data.tournament.id}`);
    }
  };

  if (!data && !error) return <div style={{ padding: '48px', color: '#8b949e' }}>Loading Host Command...</div>;

  return (
    <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>Host Control Center</h1>
          <p style={{ color: '#8b949e', marginTop: '8px', fontSize: '1.1rem' }}>Manage your localized operations</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} variant="primary">
          {isCreating ? 'Cancel' : '+ New Tournament'}
        </Button>
      </header>

      {isCreating && (
        <Card style={{ background: '#161b22', border: '1px solid #58a6ff', padding: '24px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px' }}>Initialize New Tournament</h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#8b949e' }}>Tournament Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Purely Doubles Spring 2026" style={{ width: '100%', padding: '12px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#8b949e' }}>Format</label>
                <select value={formData.formatType} onChange={e => setFormData({...formData, formatType: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }}>
                  <option value="Standard">Standard</option>
                  <option value="FAST4_ROUND_ROBIN">Fast4 Round Robin</option>
                  <option value="Knockout">Knockout</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#8b949e' }}>Max Capacity</label>
                <input type="number" value={formData.maxTeams} onChange={e => setFormData({...formData, maxTeams: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#8b949e' }}>Pool Size</label>
                <input type="number" value={formData.poolSize} onChange={e => setFormData({...formData, poolSize: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }} />
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#8b949e' }}>Courts (Comma-separated)</label>
                <input value={formData.courts} onChange={e => setFormData({...formData, courts: e.target.value})} placeholder="Court 1, Court 2, Centre Court" style={{ width: '100%', padding: '12px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button type="submit" variant="success">Initialize Database Segment</Button>
            </div>
          </form>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {data?.tournaments?.map((t: any) => (
          <Card key={t.id} style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'border 0.2s ease' }} onClick={() => router.push(`/tournaments/${t.id}`)}>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                {t.isActive ? <Badge variant="success">PUBLISHED</Badge> : <Badge variant="warning">DRAFT</Badge>}
                <span style={{ color: '#8b949e', fontSize: '0.9rem' }}>{t.formatType}</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>{t.name}</h2>
              
              <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700 }}>{t._count.teams} / {t.maxTeams}</span>
                  <span style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase' }}>Franchises</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700 }}>{t._count.matches}</span>
                  <span style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase' }}>Matches</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {data?.tournaments?.length === 0 && (
          <div style={{ color: '#8b949e' }}>No tournaments created yet.</div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, use } from 'react';
import useSWR from 'swr';
import Papa from 'papaparse';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AnimatePresence, motion } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(r => r.json());

type Phase = 'EARLY' | 'LATE' | 'CLOSED';
const PHASE_LABELS: Record<Phase, string> = { EARLY: 'REGISTRATION OPEN', LATE: 'LATE REGISTRATION', CLOSED: 'REGISTRATION CLOSED' };
const PHASE_VARIANTS: Record<Phase, 'success' | 'warning' | 'default'> = { EARLY: 'success', LATE: 'warning', CLOSED: 'default' };

function groupByCategory(teams: any[]) {
  const map: Record<string, any[]> = {};
  teams?.forEach((t) => {
    const cats: string[] = JSON.parse(t.categories || '["Open"]');
    cats.forEach((cat) => { if (!map[cat]) map[cat] = []; map[cat].push(t); });
  });
  return map;
}

export default function TournamentDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data, error, isLoading, mutate } = useSWR(`/api/tournaments/${resolvedParams.id}`, fetcher, { refreshInterval: 5000 });
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePhaseToggle = async (newPhase: string) => {
    setPublishing(true);
    await fetch(`/api/tournaments/${resolvedParams.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationPhase: newPhase })
    });
    mutate();
    setPublishing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch(`/api/tournaments/${resolvedParams.id}/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rows: results.data })
          });
          const resData = await res.json();
          if (resData.success) {
            alert(`Successfully ingested ${resData.count} franchises!`);
            mutate();
          } else {
            alert(`Ingestion Error: ${resData.error}`);
          }
        } catch (err) {
          alert('A network error occurred during ingestion.');
        } finally {
          setUploading(false);
          e.target.value = ''; // reset
        }
      }
    });
  };

  if (isLoading) return <div style={{ padding: '48px', color: '#8b949e', background: '#0d1117', minHeight: '100vh' }}>Loading Command Center...</div>;
  if (error || !data?.success) return <div style={{ padding: '48px', color: '#f85149', background: '#0d1117', minHeight: '100vh' }}>Failed to load tournament data.</div>;

  const { tournament } = data;
  const phase = tournament.registrationPhase as Phase || 'EARLY';
  
  const statsObj = data.stats || { completionPercentage: 0, completedMatches: 0, totalMatches: 0, avgDurationSec: 0 };
  const magicLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?t=${tournament.id}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(magicLink)}&bgcolor=0d1117&color=58a6ff`;
  
  const cats = groupByCategory(tournament.teams || []);
  const fmt = (s: number) => Math.floor(s / 60) + 'm ' + (s % 60) + 's';
  const handleCopy = () => { navigator.clipboard.writeText(magicLink).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const statCards = [
    { label: 'Completion', value: statsObj.completionPercentage + '%', color: '#58a6ff' },
    { label: 'Matches', value: statsObj.completedMatches + ' / ' + statsObj.totalMatches, color: '#3fb950' },
    { label: 'Avg Duration', value: fmt(statsObj.avgDurationSec), color: '#d2a8ff' },
    { label: 'Teams', value: String((tournament.teams || []).length), color: '#f5a623' },
  ];

  const S = {
    page: { padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' } as React.CSSProperties,
    pill: { background: 'rgba(255,166,0,0.12)', border: '1px solid rgba(255,166,0,0.3)', color: '#f5a623', borderRadius: '999px', padding: '4px 14px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em' } as React.CSSProperties,
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '24px', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' } as React.CSSProperties,
    h1: { fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 } as React.CSSProperties,
    muted: { color: '#8b949e', margin: 0 } as React.CSSProperties,
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '32px' } as React.CSSProperties,
    statCard: { background: '#161b22', border: '1px solid rgba(255,255,255,0.07)', padding: '18px 20px' } as React.CSSProperties,
    actionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' } as React.CSSProperties,
    poolCard: { background: '#161b22', border: '1px solid #d2a8ff', padding: '24px', gridColumn: '1/-1' } as React.CSSProperties,
    dispCard: { background: '#161b22', border: '1px solid #58a6ff', padding: '24px', gridColumn: '1/-1' } as React.CSSProperties,
    linkCard: { background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', display: 'flex', gap: '24px', alignItems: 'flex-start' } as React.CSSProperties,
    csvCard: { background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' } as React.CSSProperties,
    cardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' } as React.CSSProperties,
    qr: { width: '130px', height: '130px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', flexShrink: 0 } as React.CSSProperties,
    input: { flex: 1, padding: '10px 14px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.15)', color: '#58a6ff', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.82rem', minWidth: 0 } as React.CSSProperties,
    teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' } as React.CSSProperties,
    teamCard: { background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', padding: '18px' } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <h1 style={S.h1}>{tournament.name}</h1>
            <Badge variant={PHASE_VARIANTS[phase]}>{PHASE_LABELS[phase]}</Badge>
          </div>
          <p style={S.muted}>{tournament.location || 'Location TBA'} | ID: <span style={{ fontFamily: 'monospace', color: '#58a6ff' }}>{tournament.id}</span></p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {phase === 'CLOSED' && <Button variant='success' disabled={publishing} onClick={() => handlePhaseToggle('EARLY')}>Open Early Registration</Button>}
          {phase === 'EARLY' && <Button variant='secondary' disabled={publishing} onClick={() => handlePhaseToggle('LATE')}>Switch to Late Onsite Reg</Button>}
          {phase === 'LATE' && <Button variant='secondary' disabled={publishing} onClick={() => handlePhaseToggle('CLOSED')}>Close Registration</Button>}
        </div>
      </header>

      <div style={S.statGrid}>
        {statCards.map((s) => (
          <Card key={s.label} style={S.statCard}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: s.color, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div style={S.actionGrid}>
        <Card style={S.poolCard}>
          <div style={S.cardRow}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#d2a8ff', margin: '0 0 8px' }}>Pools and Brackets Workspace</h3>
              <p style={{ color: '#8b949e', margin: 0, lineHeight: 1.6 }}>{phase === 'EARLY' ? 'Close main registration to access the pools auto-generator.' : 'Manage seedings, auto-generate pools and export structures.'}</p>
            </div>
            <Button variant='primary' disabled={phase === 'EARLY'} onClick={() => window.location.href = `/tournaments/${tournament.id}/pools`}>Enter Pools Workspace</Button>
          </div>
        </Card>

        <Card style={S.dispCard}>
          <div style={S.cardRow}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#58a6ff', margin: '0 0 8px' }}>Match Dispatcher and Order of Play</h3>
              <p style={{ color: '#8b949e', margin: 0, lineHeight: 1.6 }}>Manage live match states, assign queues to courts, and orchestrate Pool Stage to Knockout transitions.</p>
            </div>
            <Button variant='primary' onClick={() => window.location.href = `/tournaments/${tournament.id}/dispatcher`}>Enter Dispatcher Workspace</Button>
          </div>
        </Card>

        <Card style={S.linkCard}>
          {phase !== 'CLOSED' && <img src={qr} alt='QR' style={S.qr} />}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 12px' }}>Shareable Magic Link</h3>
            <p style={{ color: '#8b949e', margin: '0 0 16px', lineHeight: 1.5 }}>Send this URL or QR code to players. It locks them into this exact tournament.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input readOnly value={magicLink} style={S.input} />
              <button onClick={handleCopy} style={{ padding: '10px 14px', background: copied ? 'rgba(63,185,80,0.15)' : 'rgba(88,166,255,0.1)', border: '1px solid ' + (copied ? '#3fb950' : '#58a6ff'), color: copied ? '#3fb950' : '#58a6ff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{copied ? 'Copied!' : 'Copy'}</button>
            </div>
          </div>
        </Card>

        <Card style={S.csvCard}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 12px' }}>Bulk Ingestion (CSV)</h3>
          <p style={{ color: '#8b949e', margin: '0 0 16px', lineHeight: 1.5, fontSize: '0.9rem' }}>Upload a CSV containing your roster. Required columns: <strong style={{ color: '#c9d1d9' }}>Team Name, Player 1 Name, Player 1 Email, Player 2 Name, Player 2 Email, Category</strong>.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ padding: '10px 18px', background: 'rgba(88,166,255,0.08)', border: '1px dashed rgba(88,166,255,0.4)', color: '#58a6ff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Choose CSV file<input type='file' accept='.csv' onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
            </label>
            {uploading && <span style={{ color: '#58a6ff', fontSize: '0.85rem' }}>Processing...</span>}
          </div>
        </Card>
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px' }}>
        Registrations Bucket
        <span style={{ fontSize: '0.9rem', color: '#8b949e', fontWeight: 500, marginLeft: '12px' }}>{(tournament.teams || []).length} teams registered</span>
      </h2>

      {Object.keys(cats).length === 0 ? (
        <Card style={{ background: '#161b22', border: '1px dashed rgba(255,255,255,0.2)', padding: '48px', textAlign: 'center' }}>
          <p style={{ color: '#8b949e', margin: 0 }}>No registrations yet.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {Object.entries(cats).map(([category, teams]) => (
            <div key={category}>
              <h3 style={{ color: '#d2a8ff', fontSize: '1.05rem', margin: '0 0 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '8px' }}>
                {category} <span style={{ color: '#8b949e', fontSize: '0.85rem', marginLeft: '8px' }}>({teams.length} teams)</span>
              </h3>
              <div style={S.teamGrid}>
                <AnimatePresence>
                  {teams.map((t: any) => (
                    <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <Card style={S.teamCard} hoverable>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <strong style={{ fontSize: '1rem', color: '#fff' }}>{t.franchiseName}</strong>
                          {t.isLateRegistration && <Badge variant='warning'>LATE</Badge>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {t.players?.map((p: any) => (
                            <div key={p.id} style={{ fontSize: '0.875rem', color: '#8b949e' }}>
                              <span style={{ color: '#c9d1d9', fontWeight: 500 }}>{p.name}</span><br />
                              <span style={{ fontSize: '0.8rem' }}>{p.email}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, use } from 'react';
import useSWR from 'swr';
import Papa from 'papaparse';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function TournamentDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data, error, isLoading, mutate } = useSWR(`/api/tournaments/${resolvedParams.id}`, fetcher, { refreshInterval: 5000 });
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);

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
          const data = await res.json();
          if (data.success) {
            alert(`Successfully ingested ${data.count} franchises!`);
            mutate();
          } else {
            alert(`Ingestion Error: ${data.error}`);
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

  if (isLoading) return <div style={{ padding: '48px', color: '#8b949e' }}>Loading Command Center...</div>;
  if (error || !data?.success) return <div style={{ padding: '48px', color: '#f85149' }}>Failed to load tournament data.</div>;

  const { tournament } = data;
  // Basic stats fallback since we might have removed the heavy aggregation in the GET route
  const stats = data.stats || { completionPercentage: 0, completedMatches: 0, totalMatches: 0, avgDurationSec: 0 };
  
  const magicLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?t=${tournament.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(magicLink)}&bgcolor=0d1117&color=58a6ff`;

  // Group teams by category
  const categoriesMap: Record<string, any[]> = {};
  tournament.teams?.forEach((team: any) => {
    const cats = JSON.parse(team.categories || '["Open"]');
    cats.forEach((cat: string) => {
      if (!categoriesMap[cat]) categoriesMap[cat] = [];
      categoriesMap[cat].push(team);
    });
  });

  return (
    <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>{tournament.name}</h1>
            {tournament.registrationPhase === 'EARLY' ? <Badge variant="success">REGISTRATION OPEN</Badge> : 
             tournament.registrationPhase === 'LATE' ? <Badge variant="warning">LATE REGISTRATION</Badge> : 
             <Badge variant="secondary">REGISTRATION CLOSED</Badge>}
          </div>
          <p style={{ color: '#8b949e', margin: 0, fontSize: '1.1rem' }}>ID: {tournament.id}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {tournament.registrationPhase === 'CLOSED' ? (
            <Button onClick={() => handlePhaseToggle('EARLY')} variant="success" disabled={publishing}>Open Early Registration</Button>
          ) : tournament.registrationPhase === 'EARLY' ? (
            <Button onClick={() => handlePhaseToggle('LATE')} variant="warning" disabled={publishing}>Switch to Late Onsite Reg</Button>
          ) : (
            <Button onClick={() => handlePhaseToggle('CLOSED')} variant="secondary" disabled={publishing}>Close Registration</Button>
          )}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
        
        <Card style={{ background: '#161b22', border: '1px solid #d2a8ff', padding: '24px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: '#d2a8ff' }}>Pools & Brackets Workspace</h3>
              <p style={{ color: '#8b949e', margin: 0 }}>
                {tournament.registrationPhase === 'EARLY' 
                  ? 'Close main registration to access the pools auto-generator and drag-and-drop workspace.'
                  : 'Manage seedings, auto-generate pools using Serpentine logic, and export structures.'}
              </p>
            </div>
            <Button 
              variant="primary" 
              disabled={tournament.registrationPhase === 'EARLY'}
              onClick={() => window.location.href = `/tournaments/${tournament.id}/pools`}
            >
              Enter Pools Workspace
            </Button>
          </div>
        </Card>

        <Card style={{ background: '#161b22', border: '1px solid #58a6ff', padding: '24px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: '#58a6ff' }}>Match Dispatcher & Order of Play</h3>
              <p style={{ color: '#8b949e', margin: 0 }}>
                Manage live match states, assign queues to courts, and orchestrate the transition from Pool Stages to Knockouts.
              </p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => window.location.href = `/tournaments/${tournament.id}/dispatcher`}
            >
              Enter Dispatcher Workspace
            </Button>
          </div>
        </Card>

        <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', display: 'flex', gap: '24px' }}>
          {tournament.registrationPhase !== 'CLOSED' && (
            <img src={qrCodeUrl} alt="Registration QR" style={{ width: '150px', height: '150px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)' }} />
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Shareable Magic Link</h3>
            <p style={{ color: '#8b949e', marginBottom: '16px', lineHeight: 1.5 }}>
              Send this URL or QR code to players. It will lock them into this exact tournament.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input readOnly value={magicLink} style={{ flex: 1, padding: '12px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.2)', color: '#58a6ff', borderRadius: '6px', fontFamily: 'monospace', width: '100%' }} />
            </div>
          </div>
        </Card>

        <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Bulk Ingestion (CSV)</h3>
          <p style={{ color: '#8b949e', marginBottom: '16px', lineHeight: 1.5 }}>
            Upload an Excel/CSV file containing your roster. Columns needed: <strong>Team Name, Player 1 Name, Player 1 Email, Player 2 Name, Player 2 Email, Category</strong>.
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input type="file" accept=".csv" onChange={handleFileUpload} disabled={uploading} style={{ padding: '8px', color: '#8b949e' }} />
            {uploading && <span style={{ color: '#58a6ff' }}>Processing...</span>}
          </div>
        </Card>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Registrations Bucket</h2>
      
      {Object.keys(categoriesMap).length === 0 ? (
        <Card style={{ background: '#161b22', border: '1px dashed rgba(255,255,255,0.2)', padding: '48px', textAlign: 'center' }}>
          <p style={{ color: '#8b949e', margin: 0 }}>No registrations yet.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {Object.entries(categoriesMap).map(([category, teams]) => (
            <div key={category}>
              <h3 style={{ color: '#d2a8ff', fontSize: '1.2rem', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                {category} <span style={{ color: '#8b949e', fontSize: '0.9rem', marginLeft: '8px' }}>({teams.length} teams)</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {teams.map((t: any) => (
                  <Card key={t.id} style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.05)', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{t.franchiseName}</strong>
                      {t.isLateRegistration && <Badge variant="warning">LATE</Badge>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {t.players?.map((p: any) => (
                        <div key={p.id} style={{ fontSize: '0.9rem', color: '#8b949e' }}>
                          <span style={{ color: '#c9d1d9' }}>{p.name}</span> <br/>
                          <span style={{ fontSize: '0.8rem' }}>{p.email}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

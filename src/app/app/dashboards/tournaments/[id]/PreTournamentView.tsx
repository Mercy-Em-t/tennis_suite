'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Props {
  tournament: any;
  stats: any;
  updateTournament: (updates: any) => Promise<void>;
  mutate: () => void;
}

const PHASE_LABELS: Record<string, string> = { 
  EARLY: 'REGISTRATION OPEN', 
  LATE: 'LATE REGISTRATION', 
  CLOSED: 'REGISTRATION CLOSED' 
};

const PHASE_VARIANTS: Record<string, 'success' | 'warning' | 'default'> = { 
  EARLY: 'success', 
  LATE: 'warning', 
  CLOSED: 'default' 
};

function groupByCategory(teams: any[]) {
  const map: Record<string, any[]> = {};
  teams?.forEach((t) => {
    const cats: string[] = JSON.parse(t.categories || '["Open"]');
    cats.forEach((cat) => { 
      if (!map[cat]) map[cat] = []; 
      map[cat].push(t); 
    });
  });
  return map;
}

export default function PreTournamentView({ tournament, stats, updateTournament, mutate }: Props) {
  const [activeStage, setActiveStage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Deriving current progress based on flags
  const highestStageUnlocked = 
    tournament.isActive ? 4 :
    tournament.pools?.length > 0 ? 3 :
    tournament.registrationPhase === 'CLOSED' ? 3 : 2;

  const magicLink = typeof window !== 'undefined' ? `${window.location.origin}/tournaments/${tournament.slug || tournament.id}/register` : '';
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(magicLink)}&bgcolor=0d1117&color=58a6ff`;

  const referees = tournament.staff?.filter((s: any) => s.role === 'REFEREE') || [];
  const marshalls = tournament.staff?.filter((s: any) => s.role === 'MARSHALL' || s.role === 'MARSHAL') || [];

  const handleCopy = () => {
    navigator.clipboard.writeText(magicLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          const res = await fetch(`/api/tournaments/${tournament.id}/import`, {
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

  const S = {
    container: { display: 'grid', gridTemplateColumns: '250px 1fr', gap: '48px', alignItems: 'start' } as React.CSSProperties,
    sidebar: { display: 'flex', flexDirection: 'column', gap: '8px' } as React.CSSProperties,
    navItem: (stage: number, unlocked: boolean) => ({
      padding: '12px 16px',
      borderRadius: '8px',
      cursor: unlocked ? 'pointer' : 'not-allowed',
      background: activeStage === stage ? 'rgba(88,166,255,0.1)' : 'transparent',
      borderLeft: activeStage === stage ? '3px solid #58a6ff' : '3px solid transparent',
      color: activeStage === stage ? '#fff' : unlocked ? '#c9d1d9' : '#484f58',
      fontWeight: activeStage === stage ? 600 : 400,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTop: 'none',
      borderRight: 'none',
      borderBottom: 'none'
    }) as React.CSSProperties,
    card: { background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', padding: '32px', marginBottom: '24px' } as React.CSSProperties,
    h2: { margin: '0 0 24px', fontSize: '1.4rem', color: '#fff' } as React.CSSProperties,
    label: { display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#8b949e', fontWeight: 600 } as React.CSSProperties,
    input: { width: '100%', padding: '10px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', marginBottom: '16px', outline: 'none' } as React.CSSProperties,
    teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px', marginTop: '16px' } as React.CSSProperties,
    teamCard: { background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', padding: '18px' } as React.CSSProperties,
  };

  const renderStage1 = () => (
    <Card style={S.card}>
      <h2 style={S.h2}>Stage 1: Launch Tournament</h2>
      <p style={{ color: '#8b949e', marginBottom: '24px', lineHeight: 1.6 }}>Verify details and assign officials to officially launch the tournament.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={S.label}>Tournament Name</label>
          <input style={S.input} value={tournament.name} readOnly />
        </div>
        <div>
          <label style={S.label}>Location / Venue</label>
          <input style={S.input} value={tournament.location || 'Not Specified'} readOnly />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={S.label}>Assigned Referee</label>
          <select style={S.input} defaultValue={referees[0]?.id || 'none'}>
            <option value="none">{referees.length > 0 ? `${referees[0].name} (Assigned)` : 'No Referee Assigned...'}</option>
            {referees.map((r: any) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={S.label}>Assigned Marshall</label>
          <select style={S.input} defaultValue={marshalls[0]?.id || 'none'}>
            <option value="none">{marshalls.length > 0 ? `${marshalls[0].name} (Assigned)` : 'No Marshall Assigned...'}</option>
            {marshalls.map((m: any) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <Button variant="secondary" onClick={() => window.location.href = `/app/dashboards/tournaments/${tournament.id}/staff`}>
          Manage Staff Directory
        </Button>
        <Button 
          variant={tournament.isActive ? 'secondary' : 'success'}
          disabled={tournament.isActive}
          onClick={async () => {
            await updateTournament({ isActive: true });
            setActiveStage(2);
          }}
        >
          {tournament.isActive ? 'Tournament Already Launched' : 'Launch Tournament'}
        </Button>
      </div>
      
      {tournament.isActive && (
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>
          <Button 
            variant="primary"
            onClick={async () => {
              if (window.confirm('Are you ready to transition to the During-Tournament phase? Matches will go live.')) {
                await updateTournament({ lifecyclePhase: 'DURING_TOURNAMENT' });
              }
            }}
          >
            Transition to Live Event (During-Tournament) →
          </Button>
        </div>
      )}
    </Card>
  );

  const renderStage2 = () => {
    const cats = groupByCategory(tournament.teams || []);
    const phase = tournament.registrationPhase || 'EARLY';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Card style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>Stage 2: Registration Phase</h2>
            <Badge variant={PHASE_VARIANTS[phase]}>{PHASE_LABELS[phase]}</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Magic Link</h4>
              <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '12px' }}>Send this URL or QR code to players. It locks them into this exact tournament.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input readOnly value={magicLink} style={{ ...S.input, marginBottom: 0 }} />
                <Button variant="primary" onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</Button>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>CSV Import</h4>
              <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '12px' }}>Roster bulk ingestion. Required: Team Name, Player 1 Name, Player 1 Email, etc.</p>
              <label style={{ display: 'inline-block', padding: '10px 18px', background: 'rgba(88,166,255,0.08)', border: '1px dashed rgba(88,166,255,0.4)', color: '#58a6ff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                Choose CSV file
                <input type='file' accept='.csv' onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
              </label>
              {uploading && <span style={{ marginLeft: '12px', color: '#58a6ff', fontSize: '0.85rem' }}>Processing...</span>}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>{(tournament.teams || []).length} Teams Registered</h3>
              <span style={{ color: '#8b949e', fontSize: '0.85rem' }}>Across {Object.keys(cats).length} active divisions</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {phase === 'CLOSED' && <Button variant='success' onClick={() => updateTournament({ registrationPhase: 'EARLY' })}>Open Early Registration</Button>}
              {phase === 'EARLY' && <Button variant='secondary' onClick={() => updateTournament({ registrationPhase: 'LATE' })}>Switch to Late Onsite Reg</Button>}
              {phase === 'LATE' && <Button variant='secondary' onClick={() => updateTournament({ registrationPhase: 'CLOSED' })}>Close Registration</Button>}
            </div>
          </div>
        </Card>

        {/* Registrations List */}
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px' }}>Roster Bucket</h2>
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
                    {teams.map((t: any) => (
                      <Card key={t.id} style={S.teamCard}>
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
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStage3 = () => (
    <Card style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>Stage 3: Pool Manager</h2>
        <Badge variant={tournament.pools?.length > 0 ? 'success' : 'warning'}>
          {tournament.pools?.length > 0 ? `${tournament.pools.length} Pools Configured` : 'DRAFT'}
        </Badge>
      </div>
      <p style={{ color: '#8b949e', marginBottom: '24px', lineHeight: 1.6 }}>
        Seed players, generate pools serpentine layouts, and manage pool boundaries.
      </p>

      <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
        <Button variant="primary" onClick={() => window.location.href = `/app/dashboards/tournaments/${tournament.id}/pools`}>
          Enter Pools & Seeding Workspace →
        </Button>
      </div>
    </Card>
  );

  const renderStage4 = () => (
    <Card style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>Stage 4: Match Scheduling & Dispatcher</h2>
        <Badge variant={tournament.isActive ? 'success' : 'warning'}>
          {tournament.isActive ? 'LIVE EVENT ACTIVE' : 'DRAFTING'}
        </Badge>
      </div>
      <p style={{ color: '#8b949e', marginBottom: '24px', lineHeight: 1.6 }}>
        Assign matches to physical court dispatcher queues, manage order of play, and configure timelines.
      </p>

      <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
        <Button variant="primary" onClick={() => window.location.href = `/app/dashboards/tournaments/${tournament.id}/dispatcher`}>
          Enter Match Dispatcher Grid →
        </Button>
      </div>
    </Card>
  );

  return (
    <div style={S.container}>
      <div style={S.sidebar}>
        <button 
          style={S.navItem(1, true)} 
          onClick={() => setActiveStage(1)}
        >
          <span>1. Launch</span>
          {tournament.isActive && <Badge variant="success">Done</Badge>}
        </button>
        <button 
          style={S.navItem(2, tournament.isActive)} 
          onClick={() => tournament.isActive && setActiveStage(2)}
        >
          <span>2. Registration</span>
          {tournament.registrationPhase === 'CLOSED' && <Badge variant="success">Done</Badge>}
        </button>
        <button 
          style={S.navItem(3, tournament.registrationPhase === 'CLOSED')} 
          onClick={() => tournament.registrationPhase === 'CLOSED' && setActiveStage(3)}
        >
          <span>3. Pool Manager</span>
          {tournament.pools?.length > 0 && <Badge variant="success">Done</Badge>}
        </button>
        <button 
          style={S.navItem(4, tournament.pools?.length > 0)} 
          onClick={() => tournament.pools?.length > 0 && setActiveStage(4)}
        >
          <span>4. Match Scheduling</span>
          {tournament.isActive && <Badge variant="success">Done</Badge>}
        </button>
      </div>

      <div>
        {activeStage === 1 && renderStage1()}
        {activeStage === 2 && renderStage2()}
        {activeStage === 3 && renderStage3()}
        {activeStage === 4 && renderStage4()}
      </div>
    </div>
  );
}

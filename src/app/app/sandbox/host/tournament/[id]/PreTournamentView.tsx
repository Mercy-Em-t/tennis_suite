'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TournamentSandboxData, SandboxTeam } from '../../useSandboxState';

interface Props {
  tournament: TournamentSandboxData;
  updateTournament: (updates: Partial<TournamentSandboxData>) => void;
}

const randomFranchises = [
  'Spin Masters', 'Baseline Bombers', 'Net Rippers', 'Court Crusaders', 
  'Serve Stormers', 'Lob Legends', 'Ace Alliance', 'Smash Masters',
  'Volley Vipers', 'Topspin Titans', 'Drop Shot Kings', 'Deuce Devils'
];

const randomPlayers = [
  { name: 'Roger Federer', email: 'roger@tennis.com' },
  { name: 'Rafael Nadal', email: 'rafa@tennis.com' },
  { name: 'Novak Djokovic', email: 'novak@tennis.com' },
  { name: 'Carlos Alcaraz', email: 'carlos@tennis.com' },
  { name: 'Jannik Sinner', email: 'jannik@tennis.com' },
  { name: 'Daniil Medvedev', email: 'medvedev@tennis.com' },
  { name: 'Alexander Zverev', email: 'zverev@tennis.com' },
  { name: 'Taylor Fritz', email: 'fritz@tennis.com' },
  { name: 'Casper Ruud', email: 'ruud@tennis.com' },
  { name: 'Alex de Minaur', email: 'deminaur@tennis.com' }
];

export default function PreTournamentView({ tournament, updateTournament }: Props) {
  const [activeStage, setActiveStage] = useState(1);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'REFEREE' | 'MARSHALL'>('REFEREE');
  const [generatedInvite, setGeneratedInvite] = useState('');
  const [activeRosterFilter, setActiveRosterFilter] = useState('ALL');

  const referees = tournament.staff?.filter(s => s.role === 'REFEREE') || [];
  const marshalls = tournament.staff?.filter(s => s.role === 'MARSHALL') || [];

  const handleGenerateInvite = () => {
    if (!inviteEmail.trim()) {
      alert('Please enter an email address.');
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/sandbox/host/tournament/${tournament.id}/invite?role=${inviteRole}&email=${encodeURIComponent(inviteEmail)}`;
    setGeneratedInvite(link);
  };

  const handleSimulateReg = () => {
    const randomName = randomFranchises[Math.floor(Math.random() * randomFranchises.length)] + ' ' + (Math.floor(Math.random() * 90) + 10);
    const p1 = randomPlayers[Math.floor(Math.random() * randomPlayers.length)];
    let p2 = randomPlayers[Math.floor(Math.random() * randomPlayers.length)];
    while (p1.name === p2.name) {
      p2 = randomPlayers[Math.floor(Math.random() * randomPlayers.length)];
    }
    const category = Math.random() > 0.5 ? "Men's Singles" : "Open";
    
    const newTeam: SandboxTeam = {
      id: `tm-${Math.floor(Math.random() * 9000) + 1000}`,
      franchiseName: randomName,
      categories: JSON.stringify([category]),
      players: [p1, p2],
      isLateRegistration: Math.random() > 0.7
    };

    updateTournament({
      teams: [...(tournament.teams || []), newTeam],
      teamsRegistered: (tournament.teamsRegistered || 0) + 1
    });
  };

  const handleDeleteTeam = (teamId: string) => {
    updateTournament({
      teams: (tournament.teams || []).filter(t => t.id !== teamId),
      teamsRegistered: Math.max(0, (tournament.teamsRegistered || 0) - 1)
    });
  };

  const getTeamCategoryList = (team: SandboxTeam): string[] => {
    try {
      return JSON.parse(team.categories || '["Open"]');
    } catch {
      return ['Open'];
    }
  };

  const filteredTeams = (tournament.teams || []).filter(team => {
    if (activeRosterFilter === 'ALL') return true;
    const cats = getTeamCategoryList(team);
    return cats.includes(activeRosterFilter);
  });

  const uniqueCategories = Array.from(new Set(
    (tournament.teams || []).flatMap(team => getTeamCategoryList(team))
  ));

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
    teamCard: { background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', padding: '18px', position: 'relative' } as React.CSSProperties,
  };

  return (
    <div style={S.container}>
      <div style={S.sidebar}>
        <button style={S.navItem(1, true)} onClick={() => setActiveStage(1)}>
          <span>1. Launch</span>
          {tournament.isLaunched && <Badge variant="success">Done</Badge>}
        </button>
        <button style={S.navItem(2, tournament.isLaunched)} onClick={() => tournament.isLaunched && setActiveStage(2)}>
          <span>2. Registration</span>
          {tournament.registrationPhase === 'CLOSED' && <Badge variant="success">Done</Badge>}
        </button>
        <button style={S.navItem(3, tournament.registrationPhase === 'CLOSED')} onClick={() => tournament.registrationPhase === 'CLOSED' && setActiveStage(3)}>
          <span>3. Pool Manager</span>
          {tournament.poolsPublished && <Badge variant="success">Done</Badge>}
        </button>
        <button style={S.navItem(4, tournament.poolsPublished)} onClick={() => tournament.poolsPublished && setActiveStage(4)}>
          <span>4. Match Scheduling</span>
          {tournament.schedulePublished && <Badge variant="success">Done</Badge>}
        </button>
      </div>

      <div>
        {activeStage === 1 && (
          <Card style={S.card}>
            <h2 style={S.h2}>Stage 1: Launch Tournament</h2>
            <p style={{ color: '#8b949e', marginBottom: '24px', lineHeight: 1.6 }}>Verify details and assign officials to officially launch the tournament.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={S.label}>Tournament Name</label>
                <input style={S.input} value={tournament.name} readOnly />
              </div>
              <div>
                <label style={S.label}>Location</label>
                <input style={S.input} value={tournament.location || 'Ace Arena'} readOnly />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={S.label}>Referees</label>
                <select style={S.input} defaultValue={referees[0]?.id || 'none'}>
                  <option value="none">{referees.length > 0 ? `${referees[0].name} (Assigned)` : 'Select Referee...'}</option>
                  {referees.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={S.label}>Marshalls</label>
                <select style={S.input} defaultValue={marshalls[0]?.id || 'none'}>
                  <option value="none">{marshalls.length > 0 ? `${marshalls[0].name} (Assigned)` : 'Select Marshall...'}</option>
                  {marshalls.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Invite Links Generator */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginTop: '10px' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '12px', fontWeight: 600 }}>Invite Staff Members</h4>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input 
                  style={{ ...S.input, marginBottom: 0, flex: 1 }} 
                  placeholder="Official Email Address" 
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                />
                <select 
                  style={{ ...S.input, marginBottom: 0, width: '120px' }}
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as any)}
                >
                  <option value="REFEREE">Referee</option>
                  <option value="MARSHALL">Marshall</option>
                </select>
                <Button variant="primary" onClick={handleGenerateInvite}>Generate Invite Link</Button>
              </div>

              {generatedInvite && (
                <div style={{ padding: '12px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#8b949e', display: 'block', marginBottom: '4px' }}>Share this link with the official:</span>
                  <a href={generatedInvite} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#58a6ff', wordBreak: 'break-all', display: 'inline-block', marginBottom: '8px' }}>
                    {generatedInvite}
                  </a>
                  <div>
                    <Button variant="secondary" size="sm" onClick={() => {
                      navigator.clipboard.writeText(generatedInvite);
                      alert('Copied invite link!');
                    }}>Copy Invite URL</Button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
              <Button 
                variant={tournament.isLaunched ? 'secondary' : 'success'}
                onClick={() => {
                  updateTournament({ isLaunched: true });
                  setActiveStage(2);
                }}
              >
                {tournament.isLaunched ? 'Update Launch Settings' : 'Launch Tournament'}
              </Button>
            </div>
          </Card>
        )}

        {activeStage === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>Stage 2: Registration Phase</h2>
                <Badge variant={tournament.registrationPhase === 'CLOSED' ? 'default' : 'success'}>
                  {tournament.registrationPhase}
                </Badge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Magic Link</h4>
                  <p style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: '12px' }}>Copy and share public register landing page.</p>
                  <input readOnly style={{ ...S.input, marginBottom: '12px' }} value={`https://tennis-suite.com/register?t=${tournament.id}`} />
                  <Button variant="secondary" onClick={() => alert('Link copied!')}>Copy Link</Button>
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>CSV Import</h4>
                  <p style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: '12px' }}>Upload mock CSV to bulk ingest franchises.</p>
                  <label style={{ display: 'inline-block', padding: '10px 18px', background: 'rgba(88,166,255,0.08)', border: '1px dashed rgba(88,166,255,0.4)', color: '#58a6ff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    Select CSV File
                    <input type="file" style={{ display: 'none' }} onChange={() => {
                      alert('CSV Simulation: Ingested 4 mock teams!');
                      const ingestedTeams = Array.from({ length: 4 }).map(() => {
                        const randomName = randomFranchises[Math.floor(Math.random() * randomFranchises.length)] + ' ' + (Math.floor(Math.random() * 90) + 10);
                        const p1 = randomPlayers[Math.floor(Math.random() * randomPlayers.length)];
                        let p2 = randomPlayers[Math.floor(Math.random() * randomPlayers.length)];
                        while (p1.name === p2.name) {
                          p2 = randomPlayers[Math.floor(Math.random() * randomPlayers.length)];
                        }
                        return {
                          id: `tm-csv-${Math.floor(Math.random() * 9000) + 1000}`,
                          franchiseName: randomName,
                          categories: JSON.stringify(["Open"]),
                          players: [p1, p2]
                        };
                      });
                      updateTournament({
                        teams: [...(tournament.teams || []), ...ingestedTeams],
                        teamsRegistered: (tournament.teamsRegistered || 0) + 4
                      });
                    }} />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>{tournament.teamsRegistered} Teams Registered</h3>
                  <span style={{ color: '#8b949e', fontSize: '0.85rem' }}>Across categories</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="secondary" onClick={handleSimulateReg}>
                    Simulate Reg +1
                  </Button>
                  {tournament.registrationPhase !== 'CLOSED' ? (
                    <Button variant="danger" onClick={() => updateTournament({ registrationPhase: 'CLOSED' })}>
                      Close Registration
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={() => updateTournament({ registrationPhase: 'EARLY' })}>
                      Re-open Registration
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Roster list with filters */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>Roster List</h3>
                
                {/* Category Filters */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: activeRosterFilter === 'ALL' ? '#21262d' : 'transparent', color: '#fff', fontSize: '0.8rem' }}
                    onClick={() => setActiveRosterFilter('ALL')}
                  >
                    All
                  </button>
                  {uniqueCategories.map(cat => (
                    <button 
                      key={cat}
                      style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: activeRosterFilter === cat ? '#21262d' : 'transparent', color: '#fff', fontSize: '0.8rem' }}
                      onClick={() => setActiveRosterFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTeams.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', background: '#161b22', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)', color: '#8b949e' }}>
                  No teams found matching this filter.
                </div>
              ) : (
                <div style={S.teamGrid}>
                  {filteredTeams.map(t => (
                    <Card key={t.id} style={S.teamCard}>
                      <button 
                        style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '1.2rem' }}
                        onClick={() => handleDeleteTeam(t.id)}
                      >
                        &times;
                      </button>
                      <strong style={{ color: '#fff', fontSize: '1rem', display: 'block', marginBottom: '8px' }}>{t.franchiseName}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#8b949e', marginBottom: '8px' }}>
                        Category: {getTeamCategoryList(t).join(', ')}
                      </div>
                      <div>
                        {t.players?.map((p, idx) => (
                          <div key={idx} style={{ fontSize: '0.8rem', color: '#c9d1d9' }}>• {p.name}</div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeStage === 3 && (
          <Card style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>Stage 3: Pool Manager</h2>
              <Badge variant={tournament.poolsPublished ? 'success' : 'warning'}>
                {tournament.poolsPublished ? 'PUBLISHED' : 'DRAFT'}
              </Badge>
            </div>
            <p style={{ color: '#8b949e', marginBottom: '24px', lineHeight: 1.6 }}>Seed players, dynamic pool creation, and Serpentine generation.</p>

            <Button 
              variant="primary" 
              onClick={() => window.location.href = `/sandbox/host/tournament/${tournament.id}/pools`}
            >
              Enter Pool Manager Workspace
            </Button>
          </Card>
        )}

        {activeStage === 4 && (
          <Card style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>Stage 4: Match Scheduling</h2>
              <Badge variant={tournament.schedulePublished ? 'success' : 'warning'}>
                {tournament.schedulePublished ? 'SCHEDULE LIVE' : 'DRAFTING'}
              </Badge>
            </div>
            <p style={{ color: '#8b949e', marginBottom: '24px', lineHeight: 1.6 }}>Assign matches to courts. Collaborative space with Referee.</p>

            <Button 
              variant="primary" 
              onClick={() => window.location.href = `/sandbox/host/tournament/${tournament.id}/dispatcher`}
            >
              Enter Match Dispatcher Grid
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

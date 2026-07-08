'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TournamentSandboxData } from '../../useSandboxState';

interface Props {
  tournament: TournamentSandboxData;
  updateTournament: (updates: Partial<TournamentSandboxData>) => void;
}

export default function PreTournamentView({ tournament, updateTournament }: Props) {
  const [activeStage, setActiveStage] = useState(1);

  // Deriving current progress based on flags
  const highestStageUnlocked = 
    tournament.schedulePublished ? 4 :
    tournament.poolsPublished ? 4 :
    tournament.registrationPhase === 'CLOSED' ? 3 :
    tournament.isLaunched ? 2 : 1;

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
      justifyContent: 'space-between'
    }) as React.CSSProperties,
    card: { background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', padding: '32px', marginBottom: '24px' } as React.CSSProperties,
    h2: { margin: '0 0 24px', fontSize: '1.4rem', color: '#fff' } as React.CSSProperties,
    label: { display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#8b949e', fontWeight: 600 } as React.CSSProperties,
    input: { width: '100%', padding: '10px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', marginBottom: '16px' } as React.CSSProperties,
    collabSidebar: { borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px', width: '300px' } as React.CSSProperties,
    chatBubble: { background: '#21262d', padding: '12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' } as React.CSSProperties,
  };

  const renderStage1 = () => (
    <Card style={S.card}>
      <h2 style={S.h2}>Stage 1: Launch Tournament</h2>
      <p style={{ color: '#8b949e', marginBottom: '24px' }}>Verify details and assign officials to officially launch the tournament.</p>
      
      <div>
        <label style={S.label}>Tournament Name</label>
        <input style={S.input} defaultValue={tournament.name} readOnly />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={S.label}>Assign Referee</label>
          <select style={S.input} defaultValue="r1">
            <option value="none">Select Referee...</option>
            <option value="r1">Ref John (Approved)</option>
          </select>
        </div>
        <div>
          <label style={S.label}>Assign Marshall</label>
          <select style={S.input} defaultValue="none">
            <option value="none">Select Marshall...</option>
            <option value="m1">Marshall Sarah</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
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
  );

  const renderStage2 = () => (
    <Card style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>Stage 2: Registration Phase</h2>
        <Badge variant={tournament.registrationPhase === 'CLOSED' ? 'secondary' : 'success'}>
          {tournament.registrationPhase}
        </Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div style={{ padding: '16px', background: '#0d1117', borderRadius: '8px', border: '1px solid #58a6ff' }}>
          <h4 style={{ margin: '0 0 8px', color: '#58a6ff' }}>Magic Link</h4>
          <input readOnly style={S.input} value={`https://tennis-suite.com/register?t=${tournament.id}`} />
          <Button variant="secondary" style={{ width: '100%' }}>Copy Link</Button>
        </div>
        <div style={{ padding: '16px', background: '#0d1117', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)' }}>
          <h4 style={{ margin: '0 0 8px' }}>CSV Import</h4>
          <p style={{ fontSize: '0.8rem', color: '#8b949e', marginBottom: '12px' }}>Upload roster manually.</p>
          <input type="file" style={{ color: '#8b949e', fontSize: '0.8rem' }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(63,185,80,0.1)', borderRadius: '8px', marginBottom: '32px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#3fb950' }}>{tournament.teamsRegistered} Teams Registered</h3>
          <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>Across 3 Categories</span>
        </div>
        <Button variant="secondary" onClick={() => updateTournament({ teamsRegistered: tournament.teamsRegistered + 1 })}>
          Simulate Reg +1
        </Button>
      </div>

      {tournament.registrationPhase !== 'CLOSED' ? (
        <Button variant="warning" onClick={() => updateTournament({ registrationPhase: 'CLOSED' })}>
          Close Early Registration
        </Button>
      ) : (
        <Button variant="secondary" onClick={() => updateTournament({ registrationPhase: 'EARLY' })}>
          Re-open Registration
        </Button>
      )}
    </Card>
  );

  const renderStage3 = () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <div style={{ flex: 1 }}>
        <Card style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>Stage 3: Pool Manager</h2>
            <Badge variant={tournament.poolsPublished ? 'success' : 'warning'}>
              {tournament.poolsPublished ? 'PUBLISHED' : 'DRAFT'}
            </Badge>
          </div>
          <p style={{ color: '#8b949e', marginBottom: '24px' }}>Seed players, dynamic pool creation, and Serpentine generation.</p>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <Button variant="primary">Auto-Generate Serpentine</Button>
            <Button variant="secondary">Add Pool +</Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: '#0d1117', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 style={{ margin: '0 0 12px', color: '#d2a8ff' }}>Pool A</h4>
              <div style={{ padding: '8px', background: '#161b22', marginBottom: '4px', fontSize: '0.85rem' }}>1. Team Alpha (1200 pts)</div>
              <div style={{ padding: '8px', background: '#161b22', marginBottom: '4px', fontSize: '0.85rem' }}>4. Team Delta (900 pts)</div>
            </div>
            <div style={{ background: '#0d1117', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 style={{ margin: '0 0 12px', color: '#d2a8ff' }}>Pool B</h4>
              <div style={{ padding: '8px', background: '#161b22', marginBottom: '4px', fontSize: '0.85rem' }}>2. Team Bravo (1100 pts)</div>
              <div style={{ padding: '8px', background: '#161b22', marginBottom: '4px', fontSize: '0.85rem' }}>3. Team Charlie (950 pts)</div>
            </div>
          </div>

          {!tournament.poolsPublished ? (
            <Button variant="success" onClick={() => updateTournament({ poolsPublished: true })}>Publish Pools</Button>
          ) : (
            <Button variant="secondary" onClick={() => updateTournament({ poolsPublished: false })}>Unpublish</Button>
          )}
        </Card>
      </div>
      
      <div style={S.collabSidebar}>
        <h4 style={{ margin: '0 0 16px', color: '#8b949e', textTransform: 'uppercase', fontSize: '0.75rem' }}>Collaboration Log</h4>
        <div style={S.chatBubble}>
          <strong style={{ color: '#58a6ff' }}>Ref John:</strong> I've drafted the Open category pools. Looks balanced.
        </div>
        <div style={S.chatBubble}>
          <strong style={{ color: '#3fb950' }}>You:</strong> Publishing now.
        </div>
      </div>
    </div>
  );

  const renderStage4 = () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <div style={{ flex: 1 }}>
        <Card style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>Stage 4: Match Scheduling</h2>
            <Badge variant={tournament.schedulePublished ? 'success' : 'warning'}>
              {tournament.schedulePublished ? 'SCHEDULE LIVE' : 'DRAFTING'}
            </Badge>
          </div>
          <p style={{ color: '#8b949e', marginBottom: '24px' }}>Assign matches to courts. Collaborative space with Referee.</p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <Button variant="primary">Grid / Calendar View</Button>
            <Button variant="secondary">List View</Button>
          </div>

          {/* Simplified CSS Grid Calendar Mockup */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '60px 1fr 1fr', 
            gap: '1px', 
            background: 'rgba(255,255,255,0.1)', 
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '32px'
          }}>
            <div style={{ background: '#0d1117', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>Time</div>
            <div style={{ background: '#0d1117', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>Court 1</div>
            <div style={{ background: '#0d1117', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>Court 2</div>
            
            <div style={{ background: '#161b22', padding: '8px', fontSize: '0.8rem', color: '#8b949e' }}>09:00</div>
            <div style={{ background: '#21262d', padding: '8px', fontSize: '0.85rem', borderLeft: '3px solid #58a6ff' }}>Pool A: Alpha vs Delta</div>
            <div style={{ background: '#21262d', padding: '8px', fontSize: '0.85rem', borderLeft: '3px solid #58a6ff' }}>Pool B: Bravo vs Charlie</div>

            <div style={{ background: '#161b22', padding: '8px', fontSize: '0.8rem', color: '#8b949e' }}>10:30</div>
            <div style={{ background: '#161b22', padding: '8px' }}></div>
            <div style={{ background: '#21262d', padding: '8px', fontSize: '0.85rem', borderLeft: '3px solid #d2a8ff' }}>Pool A: Match 3</div>
          </div>

          {!tournament.schedulePublished ? (
            <Button variant="success" onClick={() => updateTournament({ schedulePublished: true, status: 'ACTIVE' })}>Publish Schedule & Start Event</Button>
          ) : (
            <Button variant="secondary" onClick={() => updateTournament({ schedulePublished: false })}>Revert to Draft</Button>
          )}
        </Card>
      </div>

      <div style={S.collabSidebar}>
        <h4 style={{ margin: '0 0 16px', color: '#8b949e', textTransform: 'uppercase', fontSize: '0.75rem' }}>Collaboration Log</h4>
        <div style={S.chatBubble}>
          <strong style={{ color: '#58a6ff' }}>Ref John:</strong> Blocked out Court 2 at 10:30 for maintenance.
        </div>
        <div style={S.chatBubble}>
          <strong style={{ color: '#3fb950' }}>You:</strong> Acknowledged. I'll publish the revised schedule.
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.container}>
      <div style={S.sidebar}>
        <div style={S.navItem(1, true)} onClick={() => setActiveStage(1)}>
          <span>1. Launch</span>
          {tournament.isLaunched && <Badge variant="success">Done</Badge>}
        </div>
        <div style={S.navItem(2, tournament.isLaunched)} onClick={() => tournament.isLaunched && setActiveStage(2)}>
          <span>2. Registration</span>
          {tournament.registrationPhase === 'CLOSED' && <Badge variant="success">Done</Badge>}
        </div>
        <div style={S.navItem(3, tournament.registrationPhase === 'CLOSED')} onClick={() => tournament.registrationPhase === 'CLOSED' && setActiveStage(3)}>
          <span>3. Pool Manager</span>
          {tournament.poolsPublished && <Badge variant="success">Done</Badge>}
        </div>
        <div style={S.navItem(4, tournament.poolsPublished)} onClick={() => tournament.poolsPublished && setActiveStage(4)}>
          <span>4. Match Scheduling</span>
          {tournament.schedulePublished && <Badge variant="success">Done</Badge>}
        </div>
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

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
      <p >Verify details and assign officials to officially launch the tournament.</p>
      
      <div>
        <label style={S.label}>Tournament Name</label>
        <input style={S.input} defaultValue={tournament.name} readOnly />
      </div>

      <div >
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

      <div >
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
      <div >
        <h2 >Stage 2: Registration Phase</h2>
        <Badge variant={tournament.registrationPhase === 'CLOSED' ? 'default' : 'success'}>
          {tournament.registrationPhase}
        </Badge>
      </div>

      <div >
        <div >
          <h4 >Magic Link</h4>
          <input readOnly style={S.input} value={`https://tennis-suite.com/register?t=${tournament.id}`} />
          <Button variant="secondary" >Copy Link</Button>
        </div>
        <div >
          <h4 >CSV Import</h4>
          <p >Upload roster manually.</p>
          <input type="file"  />
        </div>
      </div>

      <div >
        <div>
          <h3 >{tournament.teamsRegistered} Teams Registered</h3>
          <span >Across 3 Categories</span>
        </div>
        <Button variant="secondary" onClick={() => updateTournament({ teamsRegistered: tournament.teamsRegistered + 1 })}>
          Simulate Reg +1
        </Button>
      </div>

      {tournament.registrationPhase !== 'CLOSED' ? (
        <Button variant="danger" onClick={() => updateTournament({ registrationPhase: 'CLOSED' })}>
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
    <div >
      <div >
        <Card style={S.card}>
          <div >
            <h2 >Stage 3: Pool Manager</h2>
            <Badge variant={tournament.poolsPublished ? 'success' : 'warning'}>
              {tournament.poolsPublished ? 'PUBLISHED' : 'DRAFT'}
            </Badge>
          </div>
          <p >Seed players, dynamic pool creation, and Serpentine generation.</p>
          
          <div >
            <Button variant="secondary">Auto-Generate Serpentine</Button>
            <Button variant="secondary">Add Pool +</Button>
          </div>

          <div >
            <div >
              <h4 >Pool A</h4>
              <div >1. Team Alpha (1200 pts)</div>
              <div >4. Team Delta (900 pts)</div>
            </div>
            <div >
              <h4 >Pool B</h4>
              <div >2. Team Bravo (1100 pts)</div>
              <div >3. Team Charlie (950 pts)</div>
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
        <h4 >Collaboration Log</h4>
        <div style={S.chatBubble}>
          <strong >Ref John:</strong> I've drafted the Open category pools. Looks balanced.
        </div>
        <div style={S.chatBubble}>
          <strong >You:</strong> Publishing now.
        </div>
      </div>
    </div>
  );

  const renderStage4 = () => (
    <div >
      <div >
        <Card style={S.card}>
          <div >
            <h2 >Stage 4: Match Scheduling</h2>
            <Badge variant={tournament.schedulePublished ? 'success' : 'warning'}>
              {tournament.schedulePublished ? 'SCHEDULE LIVE' : 'DRAFTING'}
            </Badge>
          </div>
          <p >Assign matches to courts. Collaborative space with Referee.</p>

          <div >
            <Button variant="secondary">Grid / Calendar View</Button>
            <Button variant="secondary">List View</Button>
          </div>

          {/* Simplified CSS Grid Calendar Mockup */}
          <div >
            <div >Time</div>
            <div >Court 1</div>
            <div >Court 2</div>
            
            <div >09:00</div>
            <div >Pool A: Alpha vs Delta</div>
            <div >Pool B: Bravo vs Charlie</div>

            <div >10:30</div>
            <div ></div>
            <div >Pool A: Match 3</div>
          </div>

          {!tournament.schedulePublished ? (
            <Button variant="success" onClick={() => updateTournament({ schedulePublished: true, status: 'ACTIVE' })}>Publish Schedule & Start Event</Button>
          ) : (
            <Button variant="secondary" onClick={() => updateTournament({ schedulePublished: false })}>Revert to Draft</Button>
          )}
        </Card>
      </div>

      <div style={S.collabSidebar}>
        <h4 >Collaboration Log</h4>
        <div style={S.chatBubble}>
          <strong >Ref John:</strong> Blocked out Court 2 at 10:30 for maintenance.
        </div>
        <div style={S.chatBubble}>
          <strong >You:</strong> Acknowledged. I'll publish the revised schedule.
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

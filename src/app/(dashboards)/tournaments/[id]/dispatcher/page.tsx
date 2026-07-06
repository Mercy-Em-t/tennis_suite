'use client';

import React, { useState, use } from 'react';
import useSWR from 'swr';
import { DndContext, closestCorners, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CourtContainer, SortableMatch } from './dispatcher-components';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function MatchDispatcher({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  // Re-using the main tournament fetcher to get matches and courts
  const { data, error, isLoading, mutate } = useSWR(`/api/tournaments/${resolvedParams.id}`, fetcher, { refreshInterval: 5000 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Local state for optimistic drag and drop
  const [localMatches, setLocalMatches] = useState<any[]>([]);

  React.useEffect(() => {
    if (data?.tournament?.matches) {
      setLocalMatches(data.tournament.matches);
    }
  }, [data]);

  if (isLoading) return <div style={{ padding: '48px', color: '#8b949e' }}>Loading Match Dispatcher...</div>;
  if (error || !data?.success) return <div style={{ padding: '48px', color: '#f85149' }}>Failed to load tournament data.</div>;

  const tournament = data.tournament;
  const courts = tournament.courts || [];

  const handleGenerate = async (stage: string) => {
    setGenerating(true);
    const res = await fetch(`/api/tournaments/${resolvedParams.id}/matches/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, category: 'Open' }) // Using 'Open' as default for demo
    });
    const d = await res.json();
    if (!d.success) alert(`Error: ${d.error}`);
    mutate();
    setGenerating(false);
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const matchId = active.id;
    let targetCourtId = over.id; // Could be a court ID or a match ID in that court

    // If dropped over another match, find its court
    const overMatch = localMatches.find(m => m.id === targetCourtId);
    if (overMatch) {
      targetCourtId = overMatch.courtId;
    }

    // Unassigned drop zone is represented by "ready-queue"
    if (targetCourtId === 'ready-queue') {
      targetCourtId = null;
    }

    // Constraint Validation: Check if court is occupied by an IN_PROGRESS match
    if (targetCourtId) {
      const courtMatches = localMatches.filter(m => m.courtId === targetCourtId);
      const isOccupied = courtMatches.some(m => m.status === 'IN_PROGRESS' && m.id !== matchId);
      if (isOccupied) {
        alert('Conflict: This court currently has an IN_PROGRESS match. You must wait for it to complete or move it before slotting another active match.');
        // Note: For a queue system, we might allow it to be queued, but the PRD specifies 
        // "raise the issue so that system flags that instead of silently failing."
        // We will alert, but still allow it to be appended to the queue as PENDING.
      }
    }

    // Optimistic Update
    const updatedMatches = localMatches.map(m => {
      if (m.id === matchId) return { ...m, courtId: targetCourtId };
      return m;
    });
    setLocalMatches(updatedMatches);

    // Persist
    await fetch(`/api/tournaments/${resolvedParams.id}/matches/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, courtId: targetCourtId })
    });
    mutate();
  };

  const readyQueueMatches = localMatches.filter(m => !m.courtId && m.stage === tournament.currentStage);

  return (
    <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>Match Dispatcher</h1>
          <p style={{ color: '#8b949e', margin: 0 }}>Manage the order of play. Current Stage: <strong style={{color:'#fff'}}>{tournament.currentStage}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button onClick={() => handleGenerate('POOL')} variant={tournament.currentStage === 'POOL' ? 'primary' : 'secondary'} disabled={generating}>
            Generate Pool Matches
          </Button>
          <Button onClick={() => handleGenerate('KNOCKOUTS')} variant={tournament.currentStage === 'KNOCKOUTS' ? 'primary' : 'secondary'} disabled={generating}>
            Generate Knockout Brackets
          </Button>
        </div>
      </header>

      <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '32px' }}>
          
          {/* Ready Queue (Left Column) */}
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#58a6ff' }}>Ready Queue</h2>
            <CourtContainer id="ready-queue" name="Unassigned Matches" matches={readyQueueMatches} />
          </div>

          {/* Courts Grid (Right Column) */}
          <div style={{ overflow: 'hidden' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Active Courts (Order of Play)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
              {courts.map((court: any) => {
                const courtMatches = localMatches.filter(m => m.courtId === court.id);
                return (
                  <CourtContainer 
                    key={court.id} 
                    id={court.id} 
                    name={court.name} 
                    matches={courtMatches}
                    courtData={court}
                    allStaff={tournament.staff}
                  />
                );
              })}
            </div>
          </div>

        </div>
        
        <DragOverlay>
          {activeId ? (
            <Card style={{ background: '#21262d', border: '1px solid #58a6ff', padding: '16px', opacity: 0.8 }}>
              Moving Match...
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

    </div>
  );
}

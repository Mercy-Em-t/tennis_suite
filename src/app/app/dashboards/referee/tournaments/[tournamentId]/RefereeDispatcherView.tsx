'use client';

import React, { useState } from 'react';
import { DndContext, closestCorners, DragOverlay, useDroppable, useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';

// Backlog Match Draggable Item
function MatchCard({ match, isOverlay = false }: { match: any, isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: match.id,
    data: { match }
  });

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      style={{ 
        padding: '16px', 
        background: '#161b22', 
        borderRadius: '8px', 
        border: isOverlay ? '1px solid #58a6ff' : '1px solid rgba(255,255,255,0.1)',
        cursor: 'grab',
        opacity: isDragging ? 0.4 : 1,
        marginBottom: '12px',
        boxShadow: isOverlay ? '0 10px 20px rgba(0,0,0,0.5)' : 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', fontWeight: 600 }}>{match.stage}</span>
        <StatusBadge status={match.status === 'SCHEDULED' ? 'info' : undefined}>{match.status}</StatusBadge>
      </div>
      <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.1rem' }}>
        {match.teamA?.franchiseName || match.placeholderA || 'TBD'}
      </div>
      <div style={{ color: '#8b949e', fontSize: '0.9rem', margin: '4px 0' }}>vs</div>
      <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.1rem' }}>
        {match.teamB?.franchiseName || match.placeholderB || 'TBD'}
      </div>
    </div>
  );
}

// Droppable Court Container
function CourtColumn({ court }: { court: any }) {
  const { isOver, setNodeRef } = useDroppable({
    id: court.id,
    data: { court }
  });

  return (
    <div 
      ref={setNodeRef}
      style={{
        background: isOver ? 'rgba(88, 166, 255, 0.1)' : '#0d1117',
        border: isOver ? '1px dashed #58a6ff' : '1px solid rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '20px',
        minWidth: '320px',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>{court.name}</h3>
        <Badge variant={court.status === 'IDLE' ? 'default' : court.status === 'IN_PROGRESS' ? 'success' : 'warning'}>
          {court.status}
        </Badge>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {court.matches?.length === 0 ? (
          <div style={{ color: '#8b949e', fontSize: '0.9rem', textAlign: 'center', margin: 'auto' }}>
            No matches assigned. Drop a match here.
          </div>
        ) : (
          court.matches?.map((match: any) => (
            <div 
              key={match.id}
              style={{
                padding: '16px',
                background: '#161b22',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>{match.stage}</span>
                <StatusBadge status={undefined}>{match.status}</StatusBadge>
              </div>
              <div style={{ color: '#fff' }}>{match.teamA?.franchiseName || match.placeholderA || 'TBD'}</div>
              <div style={{ color: '#8b949e', fontSize: '0.8rem', margin: '2px 0' }}>vs</div>
              <div style={{ color: '#fff' }}>{match.teamB?.franchiseName || match.placeholderB || 'TBD'}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function RefereeDispatcherView({ tournamentId, tournament, mutate }: any) {
  const [activeMatch, setActiveMatch] = useState<any>(null);

  const handleDragStart = (event: any) => {
    const { active } = event;
    const match = active.data.current?.match;
    if (match) setActiveMatch(match);
  };

  const handleDragEnd = async (event: any) => {
    setActiveMatch(null);
    const { active, over } = event;

    if (!over) return; // Dropped outside a court

    const matchId = active.id;
    const courtId = over.id;

    if (tournamentId === 'sandbox-1') {
      alert(`Sandbox Mode: Match ${matchId} dispatched to Court ${courtId}.`);
      return;
    }

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, courtId })
      });

      const d = await res.json();
      if (!res.ok) {
        alert(d.error || 'Failed to dispatch match');
      } else {
        mutate();
      }
    } catch (e: any) {
      alert('Error connecting to dispatcher');
    }
  };

  const backlogMatches = tournament.matches || [];

  return (
    <div style={{ marginTop: '32px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: '#fff' }}>Match Dispatcher</h2>
        <p style={{ color: '#8b949e', margin: 0 }}>Drag unassigned matches from the backlog onto a court to dispatch them.</p>
      </header>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* Backlog Column */}
          <div style={{ width: '350px', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', minHeight: '600px', maxHeight: '800px', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between' }}>
              Backlog 
              <Badge variant="default">{backlogMatches.length}</Badge>
            </h3>
            
            {backlogMatches.length === 0 ? (
              <p style={{ color: '#8b949e', textAlign: 'center', marginTop: '48px' }}>No pending matches in the backlog.</p>
            ) : (
              backlogMatches.map((match: any) => (
                <MatchCard key={match.id} match={match} />
              ))
            )}
          </div>

          {/* Courts Grid */}
          <div style={{ flex: 1, display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '24px' }}>
            {tournament.courts?.map((court: any) => (
              <CourtColumn key={court.id} court={court} />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeMatch ? <MatchCard match={activeMatch} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

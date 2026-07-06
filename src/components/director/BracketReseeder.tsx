'use client';

import React, { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Shuffle, ShieldAlert } from 'lucide-react';

interface SeedSlot {
  id: string; // The match ID for simplicity
  teamName: string;
  status: string;
}

function SortableItem({ slot }: { slot: SeedSlot }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: slot.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: '#374151',
    padding: '1rem',
    marginBottom: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #4b5563',
    display: 'flex',
    justifyContent: 'space-between',
    color: 'white',
    cursor: 'grab'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>{slot.teamName}</strong>
      <span style={{ fontSize: '0.85rem', color: slot.status === 'COMPLETED' ? '#ef4444' : '#10b981' }}>
        {slot.status}
      </span>
    </div>
  );
}

export function BracketReseeder() {
  const { activeTournamentId } = useTournamentContext();
  const [items, setItems] = useState<SeedSlot[]>([
    { id: 'match_1', teamName: 'Nadal / Alcaraz', status: 'SCHEDULED' },
    { id: 'match_2', teamName: 'Williams / Williams', status: 'SCHEDULED' },
    { id: 'match_3', teamName: 'Federer / Hingis', status: 'COMPLETED' }, // Completed match to trigger Integrity lock
  ]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    setErrorMsg('');
    setIsSaving(true);
    
    try {
      // Hit the API to execute the swap and trigger the integrity lock check
      const res = await fetch('/api/director/reseed-bracket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId: activeTournamentId,
          matchIdA: active.id as string,
          matchIdB: over.id as string,
          reason: 'Emergency Reseeding via Drag-and-Drop'
        })
      });
      const data = await res.json();
      
      if (data.error) {
        // Integrity Lock tripped
        setErrorMsg(data.error);
      } else {
        // Optimistic UI update (swap places in list for simple mockup)
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = [...items];
        const temp = newItems[oldIndex];
        newItems[oldIndex] = newItems[newIndex];
        newItems[newIndex] = temp;
        setItems(newItems);
      }
    } catch (err) {
      setErrorMsg('Failed to reseed bracket.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ background: '#1f2937', padding: '2rem', borderRadius: '12px', color: 'white', maxWidth: '600px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#10b981' }}>
        <Shuffle size={24} />
        <h2 style={{ margin: 0 }}>BRACKET RE-SEEDER</h2>
      </div>
      
      <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Drag and drop teams across active slots to instantly adjust the draw. The Integrity Lock will prevent modifying completed matches.
      </p>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fca5a5' }}>
          <ShieldAlert size={20} />
          <strong>INTEGRITY LOCK:</strong> {errorMsg}
        </div>
      )}

      {isSaving && <div style={{ color: '#10b981', marginBottom: '1rem', fontWeight: 'bold' }}>Executing Force-Push to Player Devices...</div>}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map(slot => (
            <SortableItem key={slot.id} slot={slot} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

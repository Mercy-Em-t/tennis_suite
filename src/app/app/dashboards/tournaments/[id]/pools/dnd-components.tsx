'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function SortableTeam({ poolTeam }: { poolTeam: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: poolTeam.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: '#161b22',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '12px',
    marginBottom: '8px',
    borderRadius: '6px',
    cursor: 'grab',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#8b949e', fontWeight: 600 }}>{poolTeam.seed}</span>
        <span style={{ color: '#fff', fontWeight: 500 }}>{poolTeam.team.franchiseName}</span>
      </div>
      {poolTeam.isLateAssign && <Badge variant="warning">LATE</Badge>}
    </div>
  );
}

export function PoolContainer({ pool }: { pool: any }) {
  const { setNodeRef } = useDroppable({ id: pool.id });
  const poolTeamIds = pool.poolTeams.map((pt: any) => pt.id);

  return (
    <Card 
      style={{ 
        background: '#0d1117', 
        border: '1px solid rgba(255,255,255,0.1)', 
        minWidth: '350px', 
        padding: '24px' 
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#58a6ff' }}>{pool.name}</h3>
        <Badge variant="secondary">{pool.versionId}</Badge>
      </div>

      <div ref={setNodeRef} style={{ minHeight: '200px', background: '#161b22', borderRadius: '6px', padding: '8px' }}>
        <SortableContext items={poolTeamIds} strategy={verticalListSortingStrategy}>
          {pool.poolTeams.map((pt: any) => (
            <SortableTeam key={pt.id} poolTeam={pt} />
          ))}
        </SortableContext>
      </div>
    </Card>
  );
}

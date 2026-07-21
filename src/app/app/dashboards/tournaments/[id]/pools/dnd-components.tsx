'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function SortableTeam({ poolTeam, isUnassigned = false, onManualSeedChange }: { poolTeam: any, isUnassigned?: boolean, onManualSeedChange?: (poolTeamId: string, poolId: string, newSeed: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: poolTeam.id });
  const [isEditing, setIsEditing] = React.useState(false);
  const [seedVal, setSeedVal] = React.useState(poolTeam.seed);

  React.useEffect(() => setSeedVal(poolTeam.seed), [poolTeam.seed]);

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

  const handleBlur = () => {
    setIsEditing(false);
    if (seedVal !== poolTeam.seed && onManualSeedChange && !isUnassigned) {
      onManualSeedChange(poolTeam.id, poolTeam.poolId, seedVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {!isUnassigned && (
          isEditing ? (
            <input 
              type="number" 
              value={seedVal} 
              onChange={e => setSeedVal(Number(e.target.value))}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{ width: '40px', background: '#0d1117', color: '#fff', border: '1px solid #58a6ff', borderRadius: '4px', padding: '2px 4px' }}
              onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking input
            />
          ) : (
            <span 
              style={{ color: '#8b949e', fontWeight: 600, cursor: 'text', minWidth: '24px' }} 
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {poolTeam.seed}
            </span>
          )
        )}
        <span style={{ color: '#fff', fontWeight: 500 }}>{poolTeam.team.franchiseName}</span>
      </div>
      {poolTeam.isLateAssign && !isUnassigned && <Badge variant="warning">LATE</Badge>}
    </div>
  );
}

export function PoolContainer({ pool, onManualSeedChange, onDelete }: { pool: any, onManualSeedChange?: (poolTeamId: string, poolId: string, newSeed: number) => void, onDelete?: (poolId: string) => void }) {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant={
            pool.status === 'COMMITTED' ? 'success' :
            pool.status === 'PUBLISHED' ? 'warning' : 'default'
          }>
            {pool.status === 'COMMITTED' ? `COMMITTED (${pool.versionId})` :
             pool.status === 'PUBLISHED' ? `PUBLISHED (${pool.versionId})` : pool.versionId}
          </Badge>
          {onDelete && (
            <button 
              onClick={() => onDelete(pool.id)}
              style={{ background: 'transparent', border: 'none', color: '#ff7b72', cursor: 'pointer', padding: '4px', fontSize: '1rem' }}
              title="Delete Pool"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div ref={setNodeRef} style={{ minHeight: '200px', background: '#161b22', borderRadius: '6px', padding: '8px' }}>
        <SortableContext items={poolTeamIds} strategy={verticalListSortingStrategy}>
          {pool.poolTeams.map((pt: any) => (
            <SortableTeam key={pt.id} poolTeam={pt} onManualSeedChange={onManualSeedChange} />
          ))}
        </SortableContext>
      </div>
    </Card>
  );
}

export function UnassignedContainer({ unassignedIds, unassignedTeams }: { unassignedIds: string[], unassignedTeams: any[] }) {
  const { setNodeRef } = useDroppable({ id: 'unassigned' });

  return (
    <Card 
      style={{ 
        background: '#0d1117', 
        border: '1px dashed #8b949e', 
        minWidth: '350px', 
        padding: '24px' 
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#8b949e' }}>Unassigned Registrations</h3>
        <Badge variant="default">{unassignedTeams.length}</Badge>
      </div>

      <div ref={setNodeRef} style={{ minHeight: '200px', background: '#161b22', borderRadius: '6px', padding: '8px' }}>
        <SortableContext items={unassignedIds} strategy={verticalListSortingStrategy}>
          {unassignedTeams.map((t: any) => (
            <SortableTeam key={t.id} poolTeam={t} isUnassigned={true} />
          ))}
        </SortableContext>
      </div>
    </Card>
  );
}

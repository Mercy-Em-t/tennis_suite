'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function SortableMatch({ match }: { match: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: match.id });

  let healthBorder = '';
  let warningMessage = '';
  if (match.status === 'IN_PROGRESS' && match.startedAt) {
    const elapsedMinutes = (Date.now() - new Date(match.startedAt).getTime()) / 60000;
    if (elapsedMinutes > 90) {
      healthBorder = '2px dashed #ff7b72'; // Red/Amber warning
      warningMessage = `Stalled: ${Math.floor(elapsedMinutes)}m`;
    }
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: match.status === 'REQUIRES_INTERVENTION' ? '#3b1c1c' : '#161b22',
    border: match.status === 'REQUIRES_INTERVENTION' ? '1px solid #f85149' 
          : healthBorder ? healthBorder
          : match.status === 'IN_PROGRESS' ? '1px solid #d2a8ff' 
          : '1px solid rgba(255,255,255,0.1)',
    padding: '12px',
    marginBottom: '8px',
    borderRadius: '6px',
    cursor: match.status === 'REQUIRES_INTERVENTION' ? 'not-allowed' : 'grab',
    opacity: match.status === 'REQUIRES_INTERVENTION' ? 0.8 : 1,
    minWidth: '220px',
    maxWidth: '220px',
    flexShrink: 0,
  };

  const handleDoubleClick = () => {
    if (match.status === 'REQUIRES_INTERVENTION') return;
    window.location.href = `/tournaments/${match.tournamentId}/matches/${match.id}/score`;
  };

  const handleManageWithdrawal = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/tournaments/${match.tournamentId}/matches/${match.id}/override`;
  };

  const getTeamName = (teamId: string | null, placeholder: string | null, match: any) => {
    if (teamId) {
      if (match.teamAId === teamId && match.teamA) return match.teamA.franchiseName;
      if (match.teamBId === teamId && match.teamB) return match.teamB.franchiseName;
      return "TBD";
    }
    return placeholder || "TBD";
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onDoubleClick={handleDoubleClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase' }}>
          {match.stage} 
          {warningMessage && <span style={{ color: '#ff7b72', marginLeft: '8px', fontWeight: 'bold' }}>{warningMessage}</span>}
        </span>
        {match.status === 'IN_PROGRESS' && <Badge variant="primary">LIVE</Badge>}
        {match.status === 'PENDING' && <Badge variant="secondary">PENDING</Badge>}
        {match.status === 'COMPLETED' && <Badge variant="success">FINISHED</Badge>}
        {match.status === 'REQUIRES_INTERVENTION' && <Badge variant="destructive">PAUSED</Badge>}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff' }}>{getTeamName(match.teamAId, match.placeholderA, match)}</span>
        </div>
        <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>vs</span>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff' }}>{getTeamName(match.teamBId, match.placeholderB, match)}</span>
        </div>
      </div>
      
      {match.status === 'REQUIRES_INTERVENTION' && (
        <div style={{ marginTop: '12px' }}>
          <Button variant="destructive" onClick={handleManageWithdrawal} style={{ width: '100%', fontSize: '0.8rem', padding: '4px' }}>
            Manage Withdrawal
          </Button>
        </div>
      )}

      {/* Quick Dispatch Button for unassigned matches */}
      {!match.courtId && match.status !== 'REQUIRES_INTERVENTION' && (
        <div style={{ marginTop: '12px' }}>
          <Button 
            variant="secondary" 
            onClick={async (e) => {
              e.stopPropagation();
              await fetch(`/api/tournaments/${match.tournamentId}/matches/${match.id}/auto-dispatch`, { method: 'POST' });
              window.location.reload(); // Simple reload for MVP to reflect dispatch
            }} 
            style={{ width: '100%', fontSize: '0.8rem', padding: '4px', background: '#21262d', border: '1px solid #58a6ff', color: '#58a6ff' }}
          >
            ⚡ Quick Dispatch
          </Button>
        </div>
      )}
    </div>
  );
}

export function CourtContainer({ id, name, matches, courtData, allStaff = [] }: { id: string, name: string, matches: any[], courtData?: any, allStaff?: any[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const matchIds = matches.map(m => m.id);

  const referees = allStaff.filter(s => s.role === 'REFEREE' && s.status === 'APPROVED');
  const marshalls = allStaff.filter(s => s.role === 'MARSHALL' && s.status === 'APPROVED');

  const handleStaffAssign = async (roleType: 'refereeId' | 'marshallId', staffId: string) => {
    if (!courtData?.tournamentId) return;
    await fetch(`/api/tournaments/${courtData.tournamentId}/courts/${id}/staff`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [roleType]: staffId })
    });
    // For MVP, we simply alert on success since SWR isn't passed down easily. 
    // Ideally, we'd trigger a mutate() here. We can just reload for MVP simplicity if needed, but the DB updates instantly.
  };

  return (
    <Card 
      style={{ 
        background: isOver ? '#21262d' : '#0d1117', 
        border: '1px solid rgba(255,255,255,0.1)', 
        padding: '16px',
        transition: 'background 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{name}</h3>
        <span style={{ color: '#8b949e', fontSize: '0.9rem' }}>{matches.length} queued</span>
      </div>

      {courtData && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <select 
            style={{ flex: 1, background: '#161b22', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '4px', fontSize: '0.8rem', borderRadius: '4px' }}
            defaultValue={courtData.refereeId || ""}
            onChange={(e) => handleStaffAssign('refereeId', e.target.value)}
          >
            <option value="">No Referee</option>
            {referees.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <select 
            style={{ flex: 1, background: '#161b22', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '4px', fontSize: '0.8rem', borderRadius: '4px' }}
            defaultValue={courtData.marshallId || ""}
            onChange={(e) => handleStaffAssign('marshallId', e.target.value)}
          >
            <option value="">No Marshall</option>
            {marshalls.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      )}

      <div ref={setNodeRef} style={{ 
        minHeight: '120px', 
        background: '#161b22', 
        borderRadius: '6px', 
        padding: '8px',
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        overflowX: 'auto'
      }}>
        <SortableContext items={matchIds} strategy={horizontalListSortingStrategy}>
          {matches.map(m => (
            <SortableMatch key={m.id} match={m} />
          ))}
        </SortableContext>
        {matches.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: '#8b949e', fontSize: '0.9rem', width: '100%' }}>
            Drop matches here
          </div>
        )}
      </div>
    </Card>
  );
}

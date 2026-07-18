'use client';

import React, { useState, useMemo } from 'react';
import { DndContext, closestCorners, DragOverlay } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Reusing the same drag-and-drop components from the Host workspace
import { PoolContainer, UnassignedContainer } from '@/app/app/dashboards/tournaments/[id]/pools/dnd-components';

export default function RefereePoolsView({ tournamentId, tournament, mutate, localPools, setLocalPools }: any) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Open');
  const [selectedVersion, setSelectedVersion] = useState<string>('v1.0');

  const allCategories = useMemo(() => {
    if (!tournament) return [];
    try {
      if (tournament.categories) return JSON.parse(tournament.categories);
    } catch { }
    return ['Open'];
  }, [tournament]);

  const availableVersions = useMemo(() => {
    const versions = new Set<string>();
    localPools.forEach((p: any) => {
      if (p.category === selectedCategory) versions.add(p.versionId);
    });
    return Array.from(versions).sort((a, b) => {
      const numA = parseFloat(a.replace('v', '')) || 0;
      const numB = parseFloat(b.replace('v', '')) || 0;
      return numB - numA;
    });
  }, [localPools, selectedCategory]);

  React.useEffect(() => {
    if (availableVersions.length > 0 && !availableVersions.includes(selectedVersion)) {
      setSelectedVersion(availableVersions[0]);
    } else if (availableVersions.length === 0) {
      setSelectedVersion('v1.0');
    }
  }, [availableVersions, selectedCategory, selectedVersion]);

  const visiblePools = useMemo(() => {
    return localPools.filter((p: any) => p.category === selectedCategory && p.versionId === selectedVersion);
  }, [localPools, selectedCategory, selectedVersion]);

  const unassignedTeams = useMemo(() => {
    if (!tournament) return [];
    const categoryTeams = tournament.teams.filter((t: any) => {
      try {
        const cats = JSON.parse(t.categories || '[]');
        return cats.includes(selectedCategory);
      } catch { return false; }
    });

    const assignedTeamIds = new Set<string>();
    visiblePools.forEach((p: any) => {
      p.poolTeams.forEach((pt: any) => assignedTeamIds.add(pt.teamId));
    });

    return categoryTeams
      .filter((t: any) => !assignedTeamIds.has(t.id))
      .map((t: any) => ({
        id: t.id,
        teamId: t.id,
        team: t,
        seed: '-',
        isLateAssign: false,
        poolId: 'unassigned'
      }));
  }, [tournament, selectedCategory, visiblePools]);

  const currentStatus = visiblePools.length > 0 ? visiblePools[0].status : 'REFEREE_DRAFT';
  const isReadOnly = currentStatus !== 'REFEREE_DRAFT';

  // Gatekeeping
  if (tournament.registrationPhase === 'EARLY') {
    return (
      <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Registration is still Open</h2>
        <p style={{ color: '#8b949e', marginBottom: '24px' }}>The Host must close main registrations before Pools can be generated.</p>
      </div>
    );
  }

  const handleGenerate = async (category: string) => {
    if (tournamentId === 'sandbox-1') {
      alert('Sandbox mode: Pools would be auto-generated here using the serpentine algorithm.');
      return;
    }
    setGenerating(true);
    const res = await fetch(`/api/tournaments/${tournamentId}/pools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, numPools: 2 })
    });
    const d = await res.json();
    if (!d.success) alert(`Error: ${d.error}`);
    mutate();
    setGenerating(false);
  };

  const handleSubmitDraw = async () => {
    if (tournamentId === 'sandbox-1') {
      alert('Sandbox mode: Draw would be submitted to host for approval.');
      return;
    }
    if (visiblePools.length === 0) return;
    const res = await fetch(`/api/tournaments/${tournamentId}/pools/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: selectedCategory, versionId: selectedVersion })
    });
    if (res.ok) {
      alert('Draw Submitted! It is now locked and awaiting Host approval.');
      mutate();
    } else {
      const d = await res.json();
      alert(`Error: ${d.error}`);
    }
  };

  const handleManualSeedChange = async (poolTeamId: string, poolId: string, newSeed: number) => {
    if (isReadOnly) return;
    if (tournamentId === 'sandbox-1') return; // no-op for sandbox

    const newPools = [...localPools];
    const poolIndex = newPools.findIndex(p => p.id === poolId);
    if (poolIndex === -1) return;

    const oldIndex = newPools[poolIndex].poolTeams.findIndex((pt: any) => pt.id === poolTeamId);
    let targetIndex = newSeed - 1;
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= newPools[poolIndex].poolTeams.length) targetIndex = newPools[poolIndex].poolTeams.length - 1;

    if (oldIndex === targetIndex) return;

    newPools[poolIndex].poolTeams = arrayMove(newPools[poolIndex].poolTeams, oldIndex, targetIndex);
    newPools[poolIndex].poolTeams.forEach((pt: any, i: number) => pt.seed = i + 1);
    setLocalPools(newPools);

    await fetch(`/api/tournaments/${tournamentId}/pools/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poolId, poolTeams: newPools[poolIndex].poolTeams.map((pt:any) => pt.id) })
    });
    mutate();
  };

  const handleDragStart = (event: any) => {
    if (isReadOnly) return;
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: any) => {};

  const handleDragEnd = async (event: any) => {
    if (isReadOnly) return;
    setActiveId(null);
    if (tournamentId === 'sandbox-1') return; // no-op for sandbox
    
    const { active, over } = event;
    if (!over) return;

    const activeIdStr = active.id;
    const overIdStr = over.id;

    if (activeIdStr === overIdStr) return;

    let sourceContainer: string | null = null;
    let targetContainer: string | null = null;

    if (unassignedTeams.find((t: any) => t.id === activeIdStr)) sourceContainer = 'unassigned';
    else {
      visiblePools.forEach((p: any) => {
        if (p.poolTeams.find((pt: any) => pt.id === activeIdStr)) sourceContainer = p.id;
      });
    }

    if (overIdStr === 'unassigned' || unassignedTeams.find((t: any) => t.id === overIdStr)) {
      targetContainer = 'unassigned';
    } else {
      visiblePools.forEach((p: any) => {
        if (p.id === overIdStr || p.poolTeams.find((pt: any) => pt.id === overIdStr)) targetContainer = p.id;
      });
    }

    if (!sourceContainer || !targetContainer) return;

    const newPools = [...localPools];

    if (sourceContainer === targetContainer && sourceContainer !== 'unassigned') {
      const poolIndex = newPools.findIndex(p => p.id === sourceContainer);
      const oldIndex = newPools[poolIndex].poolTeams.findIndex((pt: any) => pt.id === activeIdStr);
      const newIndex = newPools[poolIndex].poolTeams.findIndex((pt: any) => pt.id === overIdStr);
      
      newPools[poolIndex].poolTeams = arrayMove(newPools[poolIndex].poolTeams, oldIndex, newIndex);
      newPools[poolIndex].poolTeams.forEach((pt: any, i: number) => pt.seed = i + 1);
      
      setLocalPools(newPools);

      await fetch(`/api/tournaments/${tournamentId}/pools/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId: sourceContainer, poolTeams: newPools[poolIndex].poolTeams.map((pt:any) => pt.id) })
      });
      mutate();
    } else if (sourceContainer !== targetContainer) {
      let itemToMove: any = null;
      let teamId = '';

      if (sourceContainer === 'unassigned') {
        const t: any = unassignedTeams.find((t: any) => t.id === activeIdStr);
        if (t) {
          teamId = t.teamId;
          itemToMove = { id: `temp-${Date.now()}`, teamId: t.teamId, team: t.team, isLateAssign: true };
        }
      } else {
        const poolIndex = newPools.findIndex(p => p.id === sourceContainer);
        const itemIndex = newPools[poolIndex].poolTeams.findIndex((pt: any) => pt.id === activeIdStr);
        [itemToMove] = newPools[poolIndex].poolTeams.splice(itemIndex, 1);
        teamId = itemToMove.teamId;
        newPools[poolIndex].poolTeams.forEach((pt: any, i: number) => pt.seed = i + 1);
      }

      if (targetContainer !== 'unassigned' && itemToMove) {
        const poolIndex = newPools.findIndex(p => p.id === targetContainer);
        let newIndex = newPools[poolIndex].poolTeams.findIndex((pt: any) => pt.id === overIdStr);
        if (newIndex === -1) newIndex = newPools[poolIndex].poolTeams.length;
        
        itemToMove.poolId = targetContainer;
        newPools[poolIndex].poolTeams.splice(newIndex, 0, itemToMove);
        newPools[poolIndex].poolTeams.forEach((pt: any, i: number) => pt.seed = i + 1);
      }

      setLocalPools(newPools);

      await fetch(`/api/tournaments/${tournamentId}/pools/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          poolTeamId: sourceContainer === 'unassigned' ? null : activeIdStr, 
          teamId,
          sourcePoolId: sourceContainer === 'unassigned' ? null : sourceContainer, 
          targetPoolId: targetContainer === 'unassigned' ? null : targetContainer,
          targetPoolTeamIds: targetContainer !== 'unassigned' ? newPools.find(p => p.id === targetContainer)?.poolTeams.map((pt:any)=>pt.id || teamId) : []
        })
      });
      mutate();
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${tournament.name} - ${selectedCategory} Pools (${selectedVersion})`, 14, 22);

    visiblePools.forEach((pool: any, index: number) => {
      const startY = index === 0 ? 30 : (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text(`${pool.name}`, 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['Seed', 'Team Name', 'Status']],
        body: pool.poolTeams.map((pt: any) => [pt.seed, pt.team.franchiseName, pt.isLateAssign ? 'LATE' : 'STANDARD']),
      });
    });
    doc.save(`${tournament.name}_draft_pools.pdf`);
  };

  return (
    <div style={{ marginTop: '32px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: '#fff' }}>Draft Pools Generation</h2>
          <p style={{ color: '#8b949e', margin: 0 }}>Draft pools and submit to the tournament host for final approval.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button onClick={exportPDF} variant="secondary">Export PDF</Button>
          
          {currentStatus === 'REFEREE_DRAFT' && visiblePools.length > 0 && (
            <Button onClick={handleSubmitDraw} variant="primary">Submit Draw for Approval</Button>
          )}

          {currentStatus === 'AWAITING_APPROVAL' && (
            <div style={{ padding: '8px 16px', background: 'rgba(210,153,34,0.1)', color: '#d29922', border: '1px solid rgba(210,153,34,0.4)', borderRadius: '6px', fontWeight: 600 }}>
              Awaiting Host Approval
            </div>
          )}
          
          {currentStatus === 'ACTIVE' && (
            <div style={{ padding: '8px 16px', background: 'rgba(63,185,80,0.1)', color: '#3fb950', border: '1px solid rgba(63,185,80,0.4)', borderRadius: '6px', fontWeight: 600 }}>
              Host Approved (Active)
            </div>
          )}
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {allCategories.map((cat: string) => (
            <Button 
              key={cat} 
              variant={selectedCategory === cat ? 'primary' : 'secondary'}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
        
        {availableVersions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#8b949e' }}>Snapshot Version:</span>
            <select 
              value={selectedVersion} 
              onChange={e => setSelectedVersion(e.target.value)}
              style={{ padding: '8px 16px', background: '#161b22', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px' }}
            >
              {availableVersions.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {visiblePools.length === 0 ? (
        <Card style={{ background: '#161b22', padding: '48px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#fff' }}>No drafts generated for {selectedCategory}</h3>
          <p style={{ color: '#8b949e', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
            Click below to auto-generate draft pools using the Serpentine Algorithm. You can tweak them before submitting.
          </p>
          <Button 
            onClick={() => handleGenerate(selectedCategory)} 
            disabled={generating || (tournament.poolGenerationCount || 0) >= 5}
            variant="success"
          >
            {generating ? 'Generating...' : 'Auto-Generate Draft Pools'}
          </Button>
        </Card>
      ) : (
        <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '24px', opacity: isReadOnly ? 0.7 : 1 }}>
            
            {!isReadOnly && (
              <UnassignedContainer unassignedIds={unassignedTeams.map((t: any) => t.id)} unassignedTeams={unassignedTeams} />
            )}

            {visiblePools.map((pool: any) => (
              <PoolContainer key={pool.id} pool={pool} onManualSeedChange={handleManualSeedChange} />
            ))}
          </div>
          
          <DragOverlay>
            {activeId ? (
              <Card style={{ background: '#21262d', border: '1px solid #58a6ff', padding: '16px', opacity: 0.8 }}>
                Moving Team...
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

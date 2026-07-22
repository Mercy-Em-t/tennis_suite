'use client';

import React, { useState, use, useMemo } from 'react';
import useSWR from 'swr';
import { DndContext, closestCorners, DragOverlay } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PoolContainer, UnassignedContainer } from './dnd-components';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PoolsWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data, error, isLoading, mutate } = useSWR(`/api/tournaments/${resolvedParams.id}/pools`, fetcher);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Open');
  const [selectedVersion, setSelectedVersion] = useState<string>('v1.0');
  const [numPools, setNumPools] = useState<number>(2);

  // We keep a local state of pools for optimistic updates
  const [localPools, setLocalPools] = useState<any[]>([]);
  
  // Sync local pools when data changes
  React.useEffect(() => {
    if (data?.tournament?.pools) {
      setLocalPools(data.tournament.pools);
    }
  }, [data]);

  const tournament = data?.tournament;

  const allCategories = useMemo(() => {
    if (!tournament) return [];
    const catSet = new Set<string>();
    
    // Add tournament settings categories
    try {
      if (tournament.categories) {
        const tCats = JSON.parse(tournament.categories);
        tCats.forEach((c: string) => catSet.add(c));
      }
    } catch { }

    // Add any categories teams actually have (prevents orphaned teams from being hidden)
    if (tournament.teams && Array.isArray(tournament.teams)) {
      tournament.teams.forEach((t: any) => {
        try {
          const tCats = JSON.parse(t.categories || '[]');
          tCats.forEach((c: string) => catSet.add(c));
        } catch { }
      });
    }
    
    if (catSet.size === 0) catSet.add('Open');
    return Array.from(catSet);
  }, [tournament]);

  const availableVersions = useMemo(() => {
    const versions = new Set<string>();
    localPools.forEach(p => {
      if (p.category === selectedCategory) versions.add(p.versionId);
    });
    return Array.from(versions).sort((a, b) => {
      const numA = parseFloat(a.replace('v', '')) || 0;
      const numB = parseFloat(b.replace('v', '')) || 0;
      return numB - numA;
    }); // sort descending
  }, [localPools, selectedCategory]);

  React.useEffect(() => {
    if (allCategories.length > 0 && !allCategories.includes(selectedCategory)) {
      setSelectedCategory(allCategories[0]);
    }
  }, [allCategories, selectedCategory]);

  React.useEffect(() => {
    if (availableVersions.length > 0 && !availableVersions.includes(selectedVersion)) {
      setSelectedVersion(availableVersions[0]);
    } else if (availableVersions.length === 0) {
      setSelectedVersion('v1.0');
    }
  }, [availableVersions, selectedCategory, selectedVersion]);

  const visiblePools = useMemo(() => {
    return localPools.filter(p => p.category === selectedCategory && p.versionId === selectedVersion);
  }, [localPools, selectedCategory, selectedVersion]);

  // Unassigned Teams
  const unassignedTeams = useMemo(() => {
    if (!tournament) return [];
    const categoryTeams = tournament.teams.filter((t: any) => {
      try {
        const cats = JSON.parse(t.categories || '[]');
        return cats.includes(selectedCategory);
      } catch { return false; }
    });

    const assignedTeamIds = new Set<string>();
    visiblePools.forEach(p => {
      p.poolTeams.forEach((pt: any) => assignedTeamIds.add(pt.teamId));
    });

    return categoryTeams
      .filter((t: any) => !assignedTeamIds.has(t.id))
      .map((t: any) => ({
        id: t.id, // For dnd-kit id
        teamId: t.id,
        team: t,
        seed: '-',
        isLateAssign: false,
        poolId: 'unassigned'
      }));
  }, [tournament, selectedCategory, visiblePools]);

  const currentStatus = visiblePools.length > 0 ? visiblePools[0].status : 'ACTIVE';
  const isReadOnly = currentStatus === 'PUBLISHED';
  const isAppendOnly = currentStatus === 'COMMITTED';

  if (isLoading) return <div style={{ padding: '48px', color: '#8b949e' }}>Loading Pools Workspace...</div>;
  if (error || !data?.success) return <div style={{ padding: '48px', color: '#f85149' }}>Failed to load pools.</div>;

  // Gatekeeping
  if (tournament.registrationPhase === 'EARLY') {
    return (
      <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Registration is still Open</h2>
        <p style={{ color: '#8b949e', marginBottom: '24px' }}>You must close main registrations before entering the Pools Workspace.</p>
        <Button variant="secondary" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const handleGenerate = async (category: string) => {
    setGenerating(true);
    const res = await fetch(`/api/tournaments/${resolvedParams.id}/pools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, numPools })
    });
    const d = await res.json();
    if (!d.success) alert(`Error: ${d.error}`);
    mutate();
    setGenerating(false);
  };

  const handleAddPool = async () => {
    const res = await fetch(`/api/tournaments/${resolvedParams.id}/pools/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: selectedCategory, versionId: selectedVersion })
    });
    if (res.ok) mutate();
    else alert('Failed to add pool');
  };

  const handleDeletePool = async (poolId: string) => {
    const res = await fetch(`/api/tournaments/${resolvedParams.id}/pools/${poolId}`, {
      method: 'DELETE'
    });
    if (res.ok) mutate();
    else {
      const d = await res.json();
      alert(`Error: ${d.error}`);
    }
  };

  const handleGenerateKnockouts = async () => {
    if (!window.confirm("This will draft placeholder knockout matches based on the current pools. Proceed?")) return;
    const res = await fetch(`/api/tournaments/${resolvedParams.id}/bracket/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: selectedCategory, versionId: selectedVersion })
    });
    const d = await res.json();
    if (d.success) alert(d.message);
    else alert(`Error: ${d.error}`);
  };

  const handleApproveRefereeDraw = async () => {
    if (visiblePools.length === 0) return;
    const res = await fetch(`/api/tournaments/${resolvedParams.id}/pools/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: selectedCategory, versionId: selectedVersion })
    });
    if (res.ok) {
      alert('Draw Approved! It is now in your ACTIVE workspace.');
      mutate();
    } else {
      const d = await res.json();
      alert(`Error: ${d.error}`);
    }
  };

  const handleRejectRefereeDraw = async () => {
    if (visiblePools.length === 0) return;
    if (!window.confirm("Are you sure you want to reject this draw and send it back to the Referee?")) return;
    const res = await fetch(`/api/tournaments/${resolvedParams.id}/pools/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: selectedCategory, versionId: selectedVersion })
    });
    if (res.ok) {
      alert('Draw Rejected and sent back to the Referee.');
      mutate();
    } else {
      const d = await res.json();
      alert(`Error: ${d.error}`);
    }
  };

  const handlePublish = async () => {
    if (visiblePools.length === 0) return;
    const res = await fetch(`/api/tournaments/${resolvedParams.id}/pools/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: selectedCategory, versionId: selectedVersion })
    });
    if (res.ok) {
      alert('Draw Published! You are now in Read-Only review mode.');
      mutate();
    } else {
      const d = await res.json();
      alert(`Error: ${d.error}`);
    }
  };

  const handleRevert = async () => {
    const res = await fetch(`/api/tournaments/${resolvedParams.id}/pools/revert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: selectedCategory, versionId: selectedVersion })
    });
    if (res.ok) {
      alert('Reverted to Draft workspace.');
      mutate();
    }
  };

  const handleCommit = async () => {
    const res = await fetch(`/api/tournaments/${resolvedParams.id}/pools/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: selectedCategory, versionId: selectedVersion })
    });
    if (res.ok) {
      alert('Snapshot Committed! You can dispatch the emails when all categories are ready.');
      mutate();
    } else {
      const d = await res.json();
      alert(`Error: ${d.error}`);
    }
  };

  const handleDispatchEmails = async () => {
    if (!window.confirm("This will send the unified official draw email to all participants. Ensure you have committed all desired categories. Are you sure?")) {
      return;
    }
    const res = await fetch(`/api/tournaments/${resolvedParams.id}/pools/dispatch-emails`, {
      method: 'POST'
    });
    if (res.ok) {
      alert('Unified Draw Emails have been dispatched!');
    } else {
      const d = await res.json();
      alert(`Error: ${d.error}`);
    }
  };

  const handleManualSeedChange = async (poolTeamId: string, poolId: string, newSeed: number) => {
    if (isReadOnly || isAppendOnly) return;
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

    await fetch(`/api/tournaments/${resolvedParams.id}/pools/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poolId, poolTeams: newPools[poolIndex].poolTeams.map((pt:any) => pt.id) })
    });
    mutate();
  };

  const handleDragStart = (event: any) => {
    if (isReadOnly) return;
    if (isAppendOnly) {
      // In Append-Only mode, you can only drag from Unassigned or drag Late Assignees
      const isUnassigned = unassignedTeams.find((t: any) => t.id === event.active.id);
      let isLateAssign = false;
      if (!isUnassigned) {
        visiblePools.forEach(p => {
          const pt = p.poolTeams.find((pt: any) => pt.id === event.active.id);
          if (pt && pt.isLateAssign) isLateAssign = true;
        });
      }
      if (!isUnassigned && !isLateAssign) return; // Prevent dragging standard players
    }
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: any) => {};

  const handleDragEnd = async (event: any) => {
    if (isReadOnly) return;
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeIdStr = active.id;
    const overIdStr = over.id;

    if (activeIdStr === overIdStr) return;

    let sourceContainer: string | null = null;
    let targetContainer: string | null = null;

    if (unassignedTeams.find((t: any) => t.id === activeIdStr)) sourceContainer = 'unassigned';
    else {
      visiblePools.forEach(p => {
        if (p.poolTeams.find((pt: any) => pt.id === activeIdStr)) sourceContainer = p.id;
      });
    }

    if (overIdStr === 'unassigned' || unassignedTeams.find((t: any) => t.id === overIdStr)) {
      targetContainer = 'unassigned';
    } else {
      visiblePools.forEach(p => {
        if (p.id === overIdStr || p.poolTeams.find((pt: any) => pt.id === overIdStr)) targetContainer = p.id;
      });
    }

    if (!sourceContainer || !targetContainer) return;

    const newPools = [...localPools];

    if (sourceContainer === targetContainer && sourceContainer !== 'unassigned') {
      if (isAppendOnly) return; // Cannot reorder within pool in Append-Only mode

      // Reorder within pool
      const poolIndex = newPools.findIndex(p => p.id === sourceContainer);
      const oldIndex = newPools[poolIndex].poolTeams.findIndex((pt: any) => pt.id === activeIdStr);
      const newIndex = newPools[poolIndex].poolTeams.findIndex((pt: any) => pt.id === overIdStr);
      
      newPools[poolIndex].poolTeams = arrayMove(newPools[poolIndex].poolTeams, oldIndex, newIndex);
      newPools[poolIndex].poolTeams.forEach((pt: any, i: number) => pt.seed = i + 1);
      
      setLocalPools(newPools);

      await fetch(`/api/tournaments/${resolvedParams.id}/pools/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId: sourceContainer, poolTeams: newPools[poolIndex].poolTeams.map((pt:any) => pt.id) })
      });
      mutate();
    } else if (sourceContainer !== targetContainer) {
      let itemToMove: any = null;
      let teamId = '';

      if (isAppendOnly && sourceContainer === 'unassigned' && targetContainer !== 'unassigned') {
        if (!window.confirm("Are you sure you want to commit this late player to this pool? This will permanently lock them in and generate their matches against the existing pool participants immediately. This action cannot be undone.")) {
          setActiveId(null);
          return;
        }
      }

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
        // In Append-Only mode, force append to end
        let newIndex = newPools[poolIndex].poolTeams.length;
        if (!isAppendOnly && overIdStr !== targetContainer) {
           newIndex = newPools[poolIndex].poolTeams.findIndex((pt: any) => pt.id === overIdStr);
           if (newIndex === -1) newIndex = newPools[poolIndex].poolTeams.length;
        }
        itemToMove.poolId = targetContainer;
        newPools[poolIndex].poolTeams.splice(newIndex, 0, itemToMove);
        newPools[poolIndex].poolTeams.forEach((pt: any, i: number) => pt.seed = i + 1);
      }

      setLocalPools(newPools);

      await fetch(`/api/tournaments/${resolvedParams.id}/pools/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          poolTeamId: sourceContainer === 'unassigned' ? null : activeIdStr, 
          teamId,
          sourcePoolId: sourceContainer === 'unassigned' ? null : sourceContainer, 
          targetPoolId: targetContainer === 'unassigned' ? null : targetContainer,
          targetPoolTeamIds: targetContainer !== 'unassigned' 
            ? newPools.find(p => p.id === targetContainer)?.poolTeams.map((pt:any) => (pt.id && !pt.id.startsWith('temp-')) ? pt.id : teamId) 
            : []
        })
      });
      mutate();
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${tournament.name} - ${selectedCategory} Pools (${selectedVersion})`, 14, 22);

    visiblePools.forEach((pool, index) => {
      const startY = index === 0 ? 30 : (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text(`${pool.name}`, 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['Seed', 'Team Name', 'Status']],
        body: pool.poolTeams.map((pt: any) => [pt.seed, pt.team.franchiseName, pt.isLateAssign ? 'LATE' : 'STANDARD']),
      });
    });
    doc.save(`${tournament.name}_pools.pdf`);
  };

  return (
    <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' }}>
        <div>
          <Button variant="ghost" onClick={() => window.history.back()} style={{ marginBottom: '16px', padding: 0, color: '#58a6ff' }}>
            &larr; Back to {tournament.name} Dashboard
          </Button>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>{tournament.name} Pools Workspace</h1>
          <p style={{ color: '#8b949e', margin: 0 }}>Drag and drop franchises to override seeding. Create snapshots for versions.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button onClick={exportPDF} variant="secondary">Export PDF</Button>
          
          {currentStatus === 'AWAITING_APPROVAL' && (
            <>
              <Button onClick={handleApproveRefereeDraw} variant="primary">Approve Draw</Button>
              <Button onClick={handleRejectRefereeDraw} variant="danger">Reject Draw</Button>
            </>
          )}

          {currentStatus === 'ACTIVE' && visiblePools.length > 0 && (
            <Button onClick={handlePublish} variant="primary">Publish Draw</Button>
          )}

          {currentStatus === 'PUBLISHED' && (
            <>
              <Button onClick={handleRevert} variant="secondary">Revert to Draft</Button>
              <Button onClick={handleCommit} variant="success">Commit Draft</Button>
            </>
          )}

          <Button onClick={handleDispatchEmails} variant="success" style={{ marginLeft: '16px', background: '#238636', color: '#fff', border: '1px solid rgba(240,246,252,0.1)' }}>
            Email Official Draw
          </Button>
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

      {currentStatus === 'AWAITING_APPROVAL' && visiblePools.length > 0 && (
        <div style={{ background: 'rgba(210,153,34,0.1)', border: '1px solid rgba(210,153,34,0.4)', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ color: '#d29922', display: 'block', marginBottom: '4px' }}>Draft Draw Submitted by Referee</strong>
            <span style={{ color: '#8b949e', fontSize: '0.9rem' }}>A referee has drafted these pools and submitted them for your approval. You can approve them to edit them, or reject them.</span>
          </div>
        </div>
      )}

      {visiblePools.length === 0 ? (
        <Card style={{ background: '#161b22', padding: '48px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>No pools generated for {selectedCategory}</h3>
          <p style={{ color: '#8b949e', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
            The auto-generation system uses a <strong>Serpentine Algorithm</strong> to seed players based on global XP and skill ratings.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ color: '#8b949e' }}>Number of Pools:</label>
              <input 
                type="number" 
                min={2} 
                max={16}
                value={numPools} 
                onChange={e => setNumPools(parseInt(e.target.value))} 
                style={{ width: '60px', padding: '8px', background: '#0d1117', color: '#fff', border: '1px solid #30363d', borderRadius: '6px' }}
              />
            </div>
            <Button 
              onClick={() => handleGenerate(selectedCategory)} 
              disabled={generating || (tournament.poolGenerationCount || 0) >= 5}
              variant="success"
            >
              {generating ? 'Generating...' : 'Auto-Generate Pools'}
            </Button>
          </div>
        </Card>
      ) : (
        <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '24px', opacity: isReadOnly && !isAppendOnly ? 0.7 : 1 }}>
            
            {(!isReadOnly || isAppendOnly) && (
              <UnassignedContainer unassignedIds={unassignedTeams.map((t: any) => t.id)} unassignedTeams={unassignedTeams} />
            )}

            {visiblePools.map(pool => (
              <PoolContainer key={pool.id} pool={pool} onManualSeedChange={handleManualSeedChange} onDelete={isReadOnly ? undefined : handleDeletePool} />
            ))}
            
            {!isReadOnly && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button onClick={handleAddPool} variant="secondary" style={{ height: '100%', minHeight: '200px', border: '1px dashed #58a6ff', background: 'transparent' }}>
                  + Add Pool
                </Button>
              </div>
            )}
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

      {/* Knockout Draft Section */}
      {visiblePools.length > 0 && (
        <div style={{ marginTop: '48px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>Knockout Draft Placeholder</h2>
              <p style={{ color: '#8b949e', margin: 0, marginTop: '8px' }}>Pre-generate placeholder matches (A1 vs B2, etc.) based on your pools. Ensure you have 2 or 4 pools before drafting.</p>
            </div>
            <Button variant="primary" onClick={handleGenerateKnockouts}>Generate Knockout Bracket</Button>
          </div>
        </div>
      )}
    </div>
  );
}

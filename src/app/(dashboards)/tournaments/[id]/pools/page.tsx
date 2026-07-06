'use client';

import React, { useState, use, useMemo } from 'react';
import useSWR from 'swr';
import { DndContext, closestCorners, DragOverlay } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PoolContainer, SortableTeam } from './dnd-components';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PoolsWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data, error, isLoading, mutate } = useSWR(`/api/tournaments/${resolvedParams.id}/pools`, fetcher);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Open');

  // We keep a local state of pools for optimistic updates
  const [localPools, setLocalPools] = useState<any[]>([]);
  
  // Sync local pools when data changes
  React.useEffect(() => {
    if (data?.tournament?.pools) {
      setLocalPools(data.tournament.pools);
    }
  }, [data]);

  if (isLoading) return <div style={{ padding: '48px', color: '#8b949e' }}>Loading Pools Workspace...</div>;
  if (error || !data?.success) return <div style={{ padding: '48px', color: '#f85149' }}>Failed to load pools.</div>;

  const tournament = data.tournament;

  // Extract all categories entered by teams in this tournament
  const allCategories = Array.from(new Set(
    tournament.teams.flatMap((t: any) => {
      try { return JSON.parse(t.categories || '[]'); } catch { return []; }
    })
  )) as string[];

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
      body: JSON.stringify({ category, numPools: 2 }) // default 2 pools for demo
    });
    const d = await res.json();
    if (!d.success) alert(`Error: ${d.error}`);
    mutate();
    setGenerating(false);
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    // Logic to move item between pools optimistically
    // We will find which pool the active item is in, and which pool it's moving to.
  };

  const handleDragEnd = async (event: any) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activePoolTeamId = active.id;
    const overId = over.id;

    // Find source pool
    let sourcePoolId = null;
    let targetPoolId = null;
    
    localPools.forEach(p => {
      if (p.poolTeams.find((pt: any) => pt.id === activePoolTeamId)) sourcePoolId = p.id;
      if (p.id === overId || p.poolTeams.find((pt: any) => pt.id === overId)) targetPoolId = p.id;
    });

    if (sourcePoolId && targetPoolId && sourcePoolId !== targetPoolId) {
      // Optimistic update
      const newPools = [...localPools];
      const sourcePoolIndex = newPools.findIndex(p => p.id === sourcePoolId);
      const targetPoolIndex = newPools.findIndex(p => p.id === targetPoolId);
      
      const itemIndex = newPools[sourcePoolIndex].poolTeams.findIndex((pt: any) => pt.id === activePoolTeamId);
      const [item] = newPools[sourcePoolIndex].poolTeams.splice(itemIndex, 1);
      
      // Bump version locally
      const inc = (v: string) => `v${(parseFloat(v.replace('v', '')) + 0.1).toFixed(1)}`;
      newPools[sourcePoolIndex].versionId = inc(newPools[sourcePoolIndex].versionId);
      newPools[targetPoolIndex].versionId = inc(newPools[targetPoolIndex].versionId);

      newPools[targetPoolIndex].poolTeams.push({ ...item, poolId: targetPoolId });
      setLocalPools(newPools);

      // Persist
      await fetch(`/api/tournaments/${resolvedParams.id}/pools/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolTeamId: activePoolTeamId, sourcePoolId, targetPoolId, newSeed: newPools[targetPoolIndex].poolTeams.length })
      });
      mutate();
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${tournament.name} - ${selectedCategory} Pools`, 14, 22);

    localPools.filter(p => p.category === selectedCategory).forEach((pool, index) => {
      const startY = index === 0 ? 30 : (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text(`${pool.name} (${pool.versionId})`, 14, startY);
      
      const tableData = pool.poolTeams.map((pt: any) => [
        pt.seed,
        pt.team.franchiseName,
        pt.isLateAssign ? 'LATE' : 'STANDARD'
      ]);

      autoTable(doc, {
        startY: startY + 5,
        head: [['Seed', 'Team Name', 'Status']],
        body: tableData,
      });
    });

    doc.save(`${tournament.name}_pools.pdf`);
  };

  const exportCSV = () => {
    let csv = 'Pool,Version,Seed,Team,Status\n';
    localPools.filter(p => p.category === selectedCategory).forEach(pool => {
      pool.poolTeams.forEach((pt: any) => {
        csv += `"${pool.name}","${pool.versionId}","${pt.seed}","${pt.team.franchiseName}","${pt.isLateAssign ? 'LATE' : 'STANDARD'}"\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tournament.name}_pools.csv`;
    a.click();
  };

  const visiblePools = localPools.filter(p => p.category === selectedCategory);

  return (
    <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>Pools Workspace</h1>
          <p style={{ color: '#8b949e', margin: 0 }}>Drag and drop franchises to override seeding. Versioning is automatic.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button onClick={exportCSV} variant="secondary">Export CSV</Button>
          <Button onClick={exportPDF} variant="primary">Export PDF</Button>
        </div>
      </header>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        {allCategories.map(cat => (
          <Button 
            key={cat} 
            variant={selectedCategory === cat ? 'primary' : 'secondary'}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {visiblePools.length === 0 ? (
        <Card style={{ background: '#161b22', padding: '48px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>No pools generated for {selectedCategory}</h3>
          <p style={{ color: '#8b949e', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
            The auto-generation system uses a <strong>Serpentine Algorithm</strong> (e.g., 1, 8, 9, 16 into Pool A). 
            You can run this process a maximum of 3 times. ({3 - tournament.poolGenerationCount} attempts remaining).
          </p>
          <Button 
            onClick={() => handleGenerate(selectedCategory)} 
            disabled={generating || tournament.poolGenerationCount >= 3}
            variant="success"
          >
            {generating ? 'Generating...' : 'Auto-Generate Pools'}
          </Button>
        </Card>
      ) : (
        <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '24px' }}>
            {visiblePools.map(pool => (
              <PoolContainer key={pool.id} pool={pool} />
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

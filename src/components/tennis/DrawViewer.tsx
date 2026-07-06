'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Shield } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface DrawViewerProps {
  tournamentId: string;
  myTeamId: string;
}

export function DrawViewer({ tournamentId, myTeamId }: DrawViewerProps) {
  const [viewMode, setViewMode] = useState<'pool' | 'overall'>('pool');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data, error, isLoading } = useSWR(`/api/tournaments/${tournamentId}/bracket`, fetcher, { refreshInterval: 10000 });

  if (isLoading) return <div style={{ color: '#8b949e', padding: '24px', textAlign: 'center' }}>Loading Draw Data...</div>;
  if (error || !data?.success) return <div style={{ color: '#f85149', padding: '24px', textAlign: 'center' }}>Failed to load Draw.</div>;

  const { pools, knockouts, categories } = data;

  // Initialize selected category if not set
  let currentCategory = selectedCategory;
  if (!currentCategory && categories && categories.length > 0) {
    // Try to find the category the player is in
    const myPool = pools.find((p: any) => p.standings.some((s: any) => s.teamId === myTeamId));
    currentCategory = myPool?.category || categories[0];
  }

  // Filter data based on category
  const filteredPools = pools.filter((p: any) => p.category === currentCategory || !p.category);
  const filteredKnockouts = knockouts.filter((k: any) => k.category === currentCategory || !k.category);

  // Find the pool my team is in (within this category)
  const myPool = filteredPools.find((p: any) => p.standings.some((s: any) => s.teamId === myTeamId));

  // Change category handler
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    // If we change category, and the player is not in any pool in this category, we might want to default to 'overall'
    // But for now let's just keep the viewMode as is, it handles missing pools gracefully.
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Primary Tabs: Category Selector */}
      {categories && categories.length > 1 && (
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', overflowX: 'auto' }}>
          {categories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              style={{
                background: 'transparent',
                border: 'none',
                color: currentCategory === cat ? '#f0f6fc' : '#8b949e',
                fontWeight: currentCategory === cat ? 700 : 500,
                fontSize: '1.1rem',
                cursor: 'pointer',
                position: 'relative',
                padding: '0 8px 8px 8px',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
              {currentCategory === cat && (
                <motion.div
                  layoutId="activeCategory"
                  style={{
                    position: 'absolute',
                    bottom: -17,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: '#58a6ff'
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Secondary Tabs: View Toggle */}
      <div style={{ display: 'flex', background: '#161b22', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', width: 'fit-content' }}>
        <button
          onClick={() => setViewMode('pool')}
          style={{
            padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
            background: viewMode === 'pool' ? '#58a6ff' : 'transparent',
            color: viewMode === 'pool' ? '#0d1117' : '#8b949e',
            transition: 'all 0.2s'
          }}
        >
          My Pool
        </button>
        <button
          onClick={() => setViewMode('overall')}
          style={{
            padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
            background: viewMode === 'overall' ? '#58a6ff' : 'transparent',
            color: viewMode === 'overall' ? '#0d1117' : '#8b949e',
            transition: 'all 0.2s'
          }}
        >
          Overall Draw
        </button>
      </div>

      {/* Layered View Container */}
      <div style={{ position: 'relative', minHeight: '500px', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          
          {/* POOL VIEW */}
          {viewMode === 'pool' && (
            <motion.div
              key="pool"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {!myPool ? (
                <Card style={{ background: '#161b22', padding: '48px', textAlign: 'center', color: '#8b949e' }}>
                  Your team is not currently assigned to an active pool.
                </Card>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                  
                  {/* Standings */}
                  <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <h3 style={{ margin: 0, color: '#f0f6fc' }}>{myPool.name} - Leaderboard</h3>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ color: '#8b949e', fontSize: '0.85rem', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '8px' }}>TEAM</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>W</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>L</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>SET DIFF</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myPool.standings.map((s: any, idx: number) => (
                            <tr key={s.teamId} style={{ 
                              background: s.teamId === myTeamId ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                              boxShadow: s.teamId === myTeamId ? 'inset 2px 0 0 #58a6ff' : 'none'
                            }}>
                              <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: s.teamId === myTeamId ? 700 : 400, color: '#f0f6fc' }}>
                                <Badge variant="default" style={{ background: 'transparent' }}>{idx + 1}</Badge>
                                {s.name}
                              </td>
                              <td style={{ padding: '12px 8px', textAlign: 'center', color: '#3fb950', fontWeight: 700 }}>{s.stats.wins}</td>
                              <td style={{ padding: '12px 8px', textAlign: 'center', color: '#f85149', fontWeight: 700 }}>{s.stats.losses}</td>
                              <td style={{ padding: '12px 8px', textAlign: 'center', color: '#f0f6fc' }}>
                                {(s.stats.setsFor - s.stats.setsAgainst) > 0 ? '+' : ''}{(s.stats.setsFor - s.stats.setsAgainst)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Head-to-Head Context */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f0f6fc' }}>Pool Matches</h3>
                    {myPool.matches.map((m: any) => (
                      <Card key={m.id} style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', fontWeight: 700 }}>{m.status.replace('_', ' ')}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: m.winnerId === m.teamA ? '#3fb950' : '#f0f6fc', fontWeight: m.winnerId === m.teamA ? 700 : 400 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14}/> {m.teamA}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: m.winnerId === m.teamB ? '#3fb950' : '#f0f6fc', fontWeight: m.winnerId === m.teamB ? 700 : 400 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14}/> {m.teamB}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                </div>
              )}
            </motion.div>
          )}

          {/* OVERALL DRAW VIEW */}
          {viewMode === 'overall' && (
            <motion.div
              key="overall"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <Card style={{ 
                background: '#161b22', 
                border: '1px solid rgba(255,255,255,0.1)', 
                height: '100%',
                overflow: 'auto',
                position: 'relative'
              }}>
                <div style={{ padding: '24px', minWidth: '800px', display: 'flex', gap: '48px', alignItems: 'center' }}>
                  {/* Simplistic flex-based bracket rendering for macro view */}
                  {knockouts.length === 0 ? (
                    <div style={{ color: '#8b949e', textAlign: 'center', width: '100%' }}>No knockouts generated yet.</div>
                  ) : (
                    <div style={{ display: 'flex', gap: '48px' }}>
                      {/* Quarter Finals */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', justifyContent: 'center' }}>
                        {knockouts.filter((k: any) => k.stage === 'QUARTER').map((k: any) => (
                          <BracketNode key={k.id} match={k} myTeamId={myTeamId} />
                        ))}
                      </div>
                      {/* Semi Finals */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '72px', justifyContent: 'center' }}>
                        {knockouts.filter((k: any) => k.stage === 'SEMI').map((k: any) => (
                          <BracketNode key={k.id} match={k} myTeamId={myTeamId} />
                        ))}
                      </div>
                      {/* Finals */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', justifyContent: 'center' }}>
                        {knockouts.filter((k: any) => k.stage === 'FINAL').map((k: any) => (
                          <BracketNode key={k.id} match={k} myTeamId={myTeamId} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Minimap Helper */}
                <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: '#0d1117', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', color: '#8b949e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>↔ Drag to pan</span>
                </div>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}

// Simple internal component for rendering a macro bracket node
function BracketNode({ match, myTeamId }: { match: any, myTeamId: string }) {
  const isMyMatch = match.teamAId === myTeamId || match.teamBId === myTeamId;
  return (
    <div style={{ 
      background: '#0d1117', 
      border: isMyMatch ? '1px solid #58a6ff' : '1px solid rgba(255,255,255,0.1)', 
      borderRadius: '8px', 
      width: '200px',
      position: 'relative',
      boxShadow: isMyMatch ? '0 0 20px rgba(88,166,255,0.2)' : 'none'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ color: match.winnerId === match.teamAId ? '#3fb950' : '#f0f6fc', fontWeight: isMyMatch && match.teamAId === myTeamId ? 700 : 400, fontSize: '0.9rem' }}>
          {match.teamA || 'TBD'}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px' }}>
        <span style={{ color: match.winnerId === match.teamBId ? '#3fb950' : '#f0f6fc', fontWeight: isMyMatch && match.teamBId === myTeamId ? 700 : 400, fontSize: '0.9rem' }}>
          {match.teamB || 'TBD'}
        </span>
      </div>
    </div>
  );
}

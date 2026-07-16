'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Shield, MessageSquare, CheckCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface DrawViewerProps {
  tournamentId: string;
  myTeamId: string;
}

export function DrawViewer({ tournamentId, myTeamId }: DrawViewerProps) {
  const [viewMode, setViewMode] = useState<'pool' | 'overall'>('pool');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

      {/* Secondary Tabs: View Toggle & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <input 
          type="text" 
          placeholder="Search player or seed (e.g. [1])..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '8px', color: '#fff', outline: 'none', minWidth: '250px' }}
        />
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
                <>
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
                            <th style={{ padding: '8px', textAlign: 'center' }}>PTS</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>MP</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>W</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>L</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>SET DIFF</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myPool.standings.filter((s: any) => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((s: any, idx: number) => (
                            <tr key={s.teamId} style={{ 
                              background: s.teamId === myTeamId ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                              boxShadow: s.teamId === myTeamId ? 'inset 2px 0 0 #58a6ff' : 'none'
                            }}>
                              <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: s.teamId === myTeamId ? 700 : 400, color: '#f0f6fc' }}>
                                <Badge variant="default">{idx + 1}</Badge>
                                {s.seed && <span style={{ color: '#8b949e', fontSize: '0.85rem', fontWeight: 700 }}>[{s.seed}]</span>}
                                {s.name}
                              </td>
                              <td style={{ padding: '12px 8px', textAlign: 'center', color: '#f0f6fc', fontWeight: 700 }}>{s.stats.points || (s.stats.wins * 3)}</td>
                              <td style={{ padding: '12px 8px', textAlign: 'center', color: '#8b949e' }}>{(s.stats.wins || 0) + (s.stats.losses || 0)}</td>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                  
                  {/* Pool Insights Panel */}
                  <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={20} color="#58a6ff" /> Pool Insights
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.85rem', color: '#8b949e', textTransform: 'uppercase', marginBottom: '8px' }}>Winning Streak</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3fb950' }}>3</div>
                      </div>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.85rem', color: '#8b949e', textTransform: 'uppercase', marginBottom: '8px' }}>Avg Set Score</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc' }}>6.2 - 2.1</div>
                      </div>
                    </div>
                    <div style={{ height: '200px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[{ match: 'M1', pts: 3 }, { match: 'M2', pts: 6 }, { match: 'M3', pts: 9 }, { match: 'M4', pts: 9 }]}>
                          <XAxis dataKey="match" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="pts" stroke="#58a6ff" strokeWidth={3} dot={{ fill: '#58a6ff', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Verified Pool Discussion Board */}
                  <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageSquare size={20} color="#3fb950" /> Verified Pool Discussion
                    </h3>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px', paddingRight: '8px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>JD</div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>John Doe</span>
                            <CheckCircle size={12} color="#3fb950" />
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', color: '#c9d1d9' }}>Great match today everyone, the courts are playing fast!</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#58a6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d1117', fontWeight: 700 }}>ME</div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>You</span>
                            <CheckCircle size={12} color="#3fb950" />
                          </div>
                          <div style={{ background: 'rgba(88,166,255,0.1)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', color: '#c9d1d9' }}>Yeah, watch out for the sun on Court 4.</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder="Send a message..." style={{ flex: 1, background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }} />
                      <button style={{ background: '#3fb950', border: 'none', padding: '0 24px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Send</button>
                    </div>
                  </Card>
                </div>
                </>
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
                          <BracketNode key={k.id} match={k} myTeamId={myTeamId} searchQuery={searchQuery} />
                        ))}
                      </div>
                      {/* Semi Finals */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '72px', justifyContent: 'center' }}>
                        {knockouts.filter((k: any) => k.stage === 'SEMI').map((k: any) => (
                          <BracketNode key={k.id} match={k} myTeamId={myTeamId} searchQuery={searchQuery} />
                        ))}
                      </div>
                      {/* Finals */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', justifyContent: 'center' }}>
                        {knockouts.filter((k: any) => k.stage === 'FINAL').map((k: any) => (
                          <BracketNode key={k.id} match={k} myTeamId={myTeamId} searchQuery={searchQuery} />
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
function BracketNode({ match, myTeamId, searchQuery }: { match: any, myTeamId: string, searchQuery: string }) {
  const isMyMatch = match.teamAId === myTeamId || match.teamBId === myTeamId;
  const isSearched = searchQuery && (
    match.teamA?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    match.teamB?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Predictive Pathing: Mock a predicted path glow for future unresolved matches
  const isPredictivePath = isMyMatch && match.status !== 'COMPLETED';

  return (
    <>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setShowDetails(true)}
        style={{ 
          background: '#0d1117', 
          border: isSearched ? '2px solid #d2a8ff' : isMyMatch ? '2px solid #58a6ff' : isPredictivePath ? '2px dashed rgba(88,166,255,0.5)' : '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '8px', 
          width: '220px',
          position: 'relative',
          cursor: 'pointer',
          boxShadow: isSearched ? '0 0 20px rgba(210,168,255,0.4)' : isMyMatch ? '0 0 20px rgba(88,166,255,0.4)' : 'none',
          zIndex: isHovered ? 10 : 1
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ color: match.winnerId === match.teamAId ? '#3fb950' : '#f0f6fc', fontWeight: (isMyMatch && match.teamAId === myTeamId) || (isSearched && match.teamA?.toLowerCase().includes(searchQuery.toLowerCase())) ? 800 : 400, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {match.seedA && <span style={{ background: 'rgba(210,168,255,0.15)', color: '#d2a8ff', fontSize: '0.7rem', padding: '2px 4px', borderRadius: '4px', fontWeight: 800 }}>{match.seedA}</span>}
            {match.teamA || 'TBD'}
          </span>
          {match.status === 'COMPLETED' && <span style={{ fontWeight: 700, color: match.winnerId === match.teamAId ? '#3fb950' : '#8b949e' }}>{match.scoreState?.setsA || 0}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px' }}>
          <span style={{ color: match.winnerId === match.teamBId ? '#3fb950' : '#f0f6fc', fontWeight: (isMyMatch && match.teamBId === myTeamId) || (isSearched && match.teamB?.toLowerCase().includes(searchQuery.toLowerCase())) ? 800 : 400, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {match.seedB && <span style={{ background: 'rgba(210,168,255,0.15)', color: '#d2a8ff', fontSize: '0.7rem', padding: '2px 4px', borderRadius: '4px', fontWeight: 800 }}>{match.seedB}</span>}
            {match.teamB || 'TBD'}
          </span>
          {match.status === 'COMPLETED' && <span style={{ fontWeight: 700, color: match.winnerId === match.teamBId ? '#3fb950' : '#8b949e' }}>{match.scoreState?.setsB || 0}</span>}
        </div>
        
        {/* Hover Scores Tooltip */}
        <AnimatePresence>
          {isHovered && match.status === 'COMPLETED' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', background: '#161b22', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', whiteSpace: 'nowrap', color: '#f0f6fc', zIndex: 20 }}
            >
              {match.scoreState?.scoreString || 'Scores Unavailable'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Click Modal for Match Details */}
      <AnimatePresence>
        {showDetails && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDetails(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', width: '400px', maxWidth: '90%' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#f0f6fc', textAlign: 'center' }}>Match Details</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: match.winnerId === match.teamAId ? '#3fb950' : '#f0f6fc' }}>{match.teamA || 'TBD'}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{match.scoreState?.setsA || 0}</div>
                </div>
                <div style={{ color: '#8b949e', fontWeight: 700 }}>VS</div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: match.winnerId === match.teamBId ? '#3fb950' : '#f0f6fc' }}>{match.teamB || 'TBD'}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{match.scoreState?.setsB || 0}</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b949e' }}>Stage</span><span style={{ color: '#f0f6fc' }}>{match.stage}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b949e' }}>Status</span><span style={{ color: '#f0f6fc' }}>{match.status.replace('_', ' ')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b949e' }}>Court</span><span style={{ color: '#f0f6fc' }}>{match.court?.name || 'TBA'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b949e' }}>Detailed Score</span><span style={{ color: '#f0f6fc' }}>{match.scoreState?.scoreString || '-'}</span></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

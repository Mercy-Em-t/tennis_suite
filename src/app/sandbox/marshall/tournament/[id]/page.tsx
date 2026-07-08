'use client';

import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useMarshallState, MatchData, CourtData } from '../../useMarshallState';

// --- Draggable Match Card ---
function DraggableMatch({ match }: { match: MatchData }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: match.id,
    data: { match },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    background: '#21262d',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '8px',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={{ fontSize: '0.8rem', color: '#8b949e', marginBottom: '4px' }}>{match.category} • {match.round}</div>
      <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#f0f6fc' }}>
        {match.team1Name} <span style={{ color: '#8b949e', fontWeight: 'normal' }}>vs</span> {match.team2Name}
      </div>
    </div>
  );
}

// --- Droppable Court Container ---
function DroppableCourt({ court, match, children }: { court: CourtData, match: MatchData | null, children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: court.id,
    disabled: court.status !== 'EMPTY' && court.status !== 'MAINTENANCE',
  });

  const style = {
    background: isOver ? 'rgba(88,166,255,0.1)' : '#161b22',
    border: isOver ? '2px dashed #58a6ff' : '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '16px',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column' as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>{court.name}</h3>
        <Badge variant={court.status === 'EMPTY' ? 'success' : court.status === 'IN_PROGRESS' ? 'primary' : 'warning'}>
          {court.status.replace('_', ' ')}
        </Badge>
      </div>
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}

// --- Main Dashboard Component ---
export default function SpecificMarshallDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { courts, matches, logs, updateCourt, updateMatchStatus, addLog, loaded } = useMarshallState();
  const [chatInput, setChatInput] = useState('');
  const [modals, setModals] = useState<{ type: 'INSPECTION' | 'RESOURCE' | 'SCORE' | null, courtId?: string, matchId?: string }>({ type: null });

  if (!loaded) return <div style={{ padding: '48px', color: '#8b949e', background: '#0d1117', minHeight: '100vh' }}>Loading...</div>;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const matchId = active.id as string;
    const courtId = over.id as string;

    // Remove match from any previous court
    courts.forEach(c => {
      if (c.activeMatchId === matchId) {
        updateCourt(c.id, { activeMatchId: null, status: 'EMPTY' });
      }
    });

    // Assign to new court
    updateCourt(courtId, { activeMatchId: matchId, status: 'EMPTY' }); // Still EMPTY or ASSIGNED, waiting for WARMUP
    addLog(`Match ${matchId} dispatched to ${courtId}`, 'INFO', 'You');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    addLog(chatInput, 'CHAT', 'You');
    setChatInput('');
  };

  const scheduledMatches = Object.values(matches).filter(m => m.status === 'SCHEDULED' && !courts.some(c => c.activeMatchId === m.id));

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ padding: '24px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
          <div>
            <Button variant="secondary" onClick={() => window.location.href = '/sandbox/marshall'} style={{ padding: '4px 8px', fontSize: '0.8rem', marginBottom: '12px' }}>← Back</Button>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>Event Operations Dispatch</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="warning" onClick={() => setModals({ type: 'INSPECTION' })}>Report Inspection</Button>
            <Button variant="primary" onClick={() => setModals({ type: 'RESOURCE' })}>Request Resources</Button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 300px', gap: '24px', height: 'calc(100vh - 150px)' }}>
          
          {/* Scheduled Queue Sidebar */}
          <div style={{ background: '#161b22', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px', color: '#8b949e', fontSize: '0.9rem', textTransform: 'uppercase' }}>Dispatch Queue</h3>
            {scheduledMatches.length === 0 ? (
              <p style={{ color: '#8b949e', fontSize: '0.85rem' }}>No pending matches.</p>
            ) : (
              scheduledMatches.map(m => <DraggableMatch key={m.id} match={m} />)
            )}
          </div>

          {/* Court Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', alignContent: 'start', overflowY: 'auto' }}>
            {courts.map(court => {
              const activeMatch = court.activeMatchId ? matches[court.activeMatchId] : null;

              return (
                <DroppableCourt key={court.id} court={court} match={activeMatch}>
                  {activeMatch ? (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <DraggableMatch match={activeMatch} />
                      
                      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activeMatch.status === 'SCHEDULED' && (
                          <Button 
                            variant="primary" 
                            onClick={() => {
                              updateMatchStatus(activeMatch.id, 'WARMUP');
                              updateCourt(court.id, { status: 'WARMUP' });
                              addLog(`Players checking in. Match ${activeMatch.id} transitioning to WARMUP on ${court.name}. Referee notified.`, 'INFO', 'You');
                            }}
                          >
                            Transition to WARMUP
                          </Button>
                        )}

                        {activeMatch.status === 'WARMUP' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button 
                              variant="success" 
                              style={{ flex: 1 }}
                              onClick={() => {
                                updateMatchStatus(activeMatch.id, 'IN_PROGRESS');
                                updateCourt(court.id, { status: 'IN_PROGRESS' });
                                addLog(`Referee started Match ${activeMatch.id} on ${court.name}.`, 'INFO', 'System Mock');
                              }}
                            >
                              [Simulate Ref Start]
                            </Button>
                          </div>
                        )}

                        {activeMatch.status === 'IN_PROGRESS' && (
                          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                            <div style={{ background: '#0d1117', padding: '8px', borderRadius: '4px', fontSize: '0.8rem', textAlign: 'center', fontFamily: 'monospace' }}>
                              Score tracking via Umpire...
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <Button 
                                variant="secondary" 
                                style={{ flex: 1 }}
                                onClick={() => setModals({ type: 'SCORE', matchId: activeMatch.id, courtId: court.id })}
                              >
                                Manual Score Override
                              </Button>
                              <Button 
                                variant="warning" 
                                onClick={() => {
                                  updateMatchStatus(activeMatch.id, 'COMPLETED');
                                  updateCourt(court.id, { activeMatchId: null, status: 'EMPTY' });
                                  addLog(`Match ${activeMatch.id} completed. Court freed.`, 'INFO', 'You');
                                }}
                              >
                                End Match
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '6px' }}>
                      {court.status === 'MAINTENANCE' ? 'Court under maintenance' : 'Drag match here'}
                    </div>
                  )}
                </DroppableCourt>
              );
            })}
          </div>

          {/* Comm Center */}
          <div style={{ background: '#161b22', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Comm Center</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {logs.map(log => (
                <div key={log.id} style={{ 
                  padding: '8px 12px', 
                  borderRadius: '8px', 
                  background: log.type === 'EMERGENCY' ? 'rgba(248,81,73,0.1)' : log.type === 'RESOURCE_REQUEST' ? 'rgba(210,168,255,0.1)' : '#21262d',
                  border: log.type === 'EMERGENCY' ? '1px solid #f85149' : '1px solid transparent',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ color: '#8b949e', fontSize: '0.7rem', marginBottom: '4px' }}>{log.sender} • {log.timestamp}</div>
                  <div style={{ color: '#c9d1d9' }}>{log.message}</div>
                </div>
              ))}
            </div>
            <form style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' }} onSubmit={handleSendChat}>
              <input type="text" placeholder="Message..." value={chatInput} onChange={e => setChatInput(e.target.value)} style={{ flex: 1, padding: '8px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
              <Button variant="primary" type="submit">Send</Button>
            </form>
          </div>
        </div>

        {/* Modals */}
        {modals.type && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <Card style={{ background: '#0d1117', padding: '32px', width: '400px', border: '1px solid #58a6ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, color: '#fff' }}>
                  {modals.type === 'INSPECTION' ? 'Court Inspection' : modals.type === 'RESOURCE' ? 'Request Resources' : 'Manual Score Override'}
                </h2>
                <Button variant="secondary" onClick={() => setModals({ type: null })}>X</Button>
              </div>

              {modals.type === 'INSPECTION' && (
                <div>
                  <p style={{ color: '#8b949e', marginBottom: '16px' }}>Flag a court for maintenance.</p>
                  <select id="inspection-court" style={{ width: '100%', padding: '8px', background: '#161b22', color: '#fff', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                    {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <Button variant="warning" style={{ width: '100%' }} onClick={() => {
                    const el = document.getElementById('inspection-court') as HTMLSelectElement;
                    updateCourt(el.value, { status: 'MAINTENANCE' });
                    addLog(`Court ${el.value} flagged for MAINTENANCE.`, 'EMERGENCY', 'You');
                    setModals({ type: null });
                  }}>Submit Report</Button>
                </div>
              )}

              {modals.type === 'RESOURCE' && (
                <div>
                  <p style={{ color: '#8b949e', marginBottom: '16px' }}>Ping Delegate for resources.</p>
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <Button variant="secondary" onClick={() => { addLog('Requesting Ball Kids for Court 1', 'RESOURCE_REQUEST', 'You'); setModals({ type: null }); }}>Request Ball Kids</Button>
                    <Button variant="secondary" onClick={() => { addLog('Requesting Towels/Water for Center Court', 'RESOURCE_REQUEST', 'You'); setModals({ type: null }); }}>Request Towels & Water</Button>
                  </div>
                </div>
              )}

              {modals.type === 'SCORE' && (
                <div>
                  <p style={{ color: '#8b949e', marginBottom: '16px' }}>Only use if umpire tablet fails.</p>
                  <Button variant="primary" style={{ width: '100%' }} onClick={() => {
                    addLog(`Manual score override requested by Marshall for Match ${modals.matchId}.`, 'INFO', 'You');
                    setModals({ type: null });
                  }}>Ping Referee for Score Access</Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </DndContext>
  );
}

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
      <div >{match.category} • {match.round}</div>
      <div >
        {match.team1Name} <span >vs</span> {match.team2Name}
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
      <div >
        <h3 >{court.name}</h3>
        <Badge variant={court.status === 'EMPTY' ? 'success' : court.status === 'IN_PROGRESS' ? 'default' : 'warning'}>
          {court.status.replace('_', ' ')}
        </Badge>
      </div>
      <div >
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

  if (!loaded) return <div >Loading...</div>;

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
      <div >
        
        {/* Header */}
        <header >
          <div>
            <Button variant="secondary" onClick={() => window.location.href = '/sandbox/marshall'} >← Back</Button>
            <h1 >Event Operations Dispatch</h1>
          </div>
          <div >
            <Button variant="danger" onClick={() => setModals({ type: 'INSPECTION' })}>Report Inspection</Button>
            <Button variant="secondary" onClick={() => setModals({ type: 'RESOURCE' })}>Request Resources</Button>
          </div>
        </header>

        <div >
          
          {/* Scheduled Queue Sidebar */}
          <div >
            <h3 >Dispatch Queue</h3>
            {scheduledMatches.length === 0 ? (
              <p >No pending matches.</p>
            ) : (
              scheduledMatches.map(m => <DraggableMatch key={m.id} match={m} />)
            )}
          </div>

          {/* Court Grid */}
          <div >
            {courts.map(court => {
              const activeMatch = court.activeMatchId ? matches[court.activeMatchId] : null;

              return (
                <DroppableCourt key={court.id} court={court} match={activeMatch}>
                  {activeMatch ? (
                    <div >
                      <DraggableMatch match={activeMatch} />
                      
                      <div >
                        {activeMatch.status === 'SCHEDULED' && (
                          <Button 
                            variant="secondary" 
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
                          <div >
                            <Button 
                              variant="success" 
                              
                              onClick={() => {
                                updateMatchStatus(activeMatch.id, 'IN_PROGRESS');
                                updateCourt(court.id, { status: 'IN_PROGRESS' });
                                addLog(`Referee started Match ${activeMatch.id} on ${court.name}.`, 'INFO', 'You');
                              }}
                            >
                              [Simulate Ref Start]
                            </Button>
                          </div>
                        )}

                        {activeMatch.status === 'IN_PROGRESS' && (
                          <div >
                            <div >
                              Score tracking via Umpire...
                            </div>
                            <div >
                              <Button 
                                variant="secondary" 
                                
                                onClick={() => setModals({ type: 'SCORE', matchId: activeMatch.id, courtId: court.id })}
                              >
                                Manual Score Override
                              </Button>
                              <Button 
                                variant="danger" 
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
                    <div >
                      {court.status === 'MAINTENANCE' ? 'Court under maintenance' : 'Drag match here'}
                    </div>
                  )}
                </DroppableCourt>
              );
            })}
          </div>

          {/* Comm Center */}
          <div >
            <div >
              <h3 >Comm Center</h3>
            </div>
            <div >
              {logs.map(log => (
                <div key={log.id} >
                  <div >{log.sender} • {log.timestamp}</div>
                  <div >{log.message}</div>
                </div>
              ))}
            </div>
            <form  onSubmit={handleSendChat}>
              <input type="text" placeholder="Message..." value={chatInput} onChange={e => setChatInput(e.target.value)}  />
              <Button variant="secondary" type="submit">Send</Button>
            </form>
          </div>
        </div>

        {/* Modals */}
        {modals.type && (
          <div >
            <Card >
              <div >
                <h2 >
                  {modals.type === 'INSPECTION' ? 'Court Inspection' : modals.type === 'RESOURCE' ? 'Request Resources' : 'Manual Score Override'}
                </h2>
                <Button variant="secondary" onClick={() => setModals({ type: null })}>X</Button>
              </div>

              {modals.type === 'INSPECTION' && (
                <div>
                  <p >Flag a court for maintenance.</p>
                  <select id="inspection-court" >
                    {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <Button variant="danger"  onClick={() => {
                    const el = document.getElementById('inspection-court') as HTMLSelectElement;
                    updateCourt(el.value, { status: 'MAINTENANCE' });
                    addLog(`Court ${el.value} flagged for MAINTENANCE.`, 'EMERGENCY', 'You');
                    setModals({ type: null });
                  }}>Submit Report</Button>
                </div>
              )}

              {modals.type === 'RESOURCE' && (
                <div>
                  <p >Ping Delegate for resources.</p>
                  <div >
                    <Button variant="secondary" onClick={() => { addLog('Requesting Ball Kids for Court 1', 'RESOURCE_REQUEST', 'You'); setModals({ type: null }); }}>Request Ball Kids</Button>
                    <Button variant="secondary" onClick={() => { addLog('Requesting Towels/Water for Center Court', 'RESOURCE_REQUEST', 'You'); setModals({ type: null }); }}>Request Towels & Water</Button>
                  </div>
                </div>
              )}

              {modals.type === 'SCORE' && (
                <div>
                  <p >Only use if umpire tablet fails.</p>
                  <Button variant="secondary"  onClick={() => {
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

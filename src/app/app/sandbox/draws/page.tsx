'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useDrawState, DrawFormat } from './useDrawState';
import { Users, LayoutList, Trophy, FileText, CheckCircle2 } from 'lucide-react';

export default function DrawsSandbox() {
  const { 
    players, activeCategory, setActiveCategory, updateManualSeed, 
    generateDraw, activeDraft, publishDraw, logs 
  } = useDrawState();

  const [format, setFormat] = useState<DrawFormat>("KNOCKOUT");
  const [bracketSizeOverride, setBracketSizeOverride] = useState<number | undefined>(undefined);

  return (
    <div >
      
      <header >
        <div>
          <h1 >Registration & Draws Sandbox</h1>
          <p >Simulate pulling verified players into algorithmic bracket logic.</p>
        </div>
        <div >
          <Button variant={activeCategory === 'MEN_SINGLES' ? 'primary' : 'secondary'} onClick={() => setActiveCategory('MEN_SINGLES')}>Men's Singles</Button>
          <Button variant={activeCategory === 'WOMEN_SINGLES' ? 'primary' : 'secondary'} onClick={() => setActiveCategory('WOMEN_SINGLES')}>Women's Singles</Button>
        </div>
      </header>

      <div >
        
        {/* LEFT SIDEBAR: REGISTRATION POOL */}
        <Card >
          <div >
            <h2 >
              <Users size={18} /> Verified Registrations
            </h2>
            <div >Total: {players.length} Players</div>
          </div>
          
          <div >
            {players.map(p => (
              <div key={p.id} >
                <div >{p.name}</div>
                <div >
                  <span >ITF Points: {p.ranking}</span>
                  <div >
                    <span >Seed:</span>
                    <input 
                      type="number" 
                      min="1" max="32" 
                      placeholder="Auto"
                      value={p.manualSeed || ''}
                      onChange={(e) => updateManualSeed(p.id, e.target.value ? parseInt(e.target.value) : null)}
                      
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* MAIN AREA: DRAW ENGINE & VISUALIZER */}
        <div >
          
          {/* Controls */}
          <Card >
            <div >
              <div>
                <label >Draw Format</label>
                <select 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value as DrawFormat)}
                  
                >
                  <option value="KNOCKOUT">Standard Knockout (Tree)</option>
                  <option value="POOLS_TO_KNOCKOUT">Pools / Round Robin</option>
                </select>
              </div>
              <div>
                <label >Knockout Size (Optional Override)</label>
                <select 
                  value={bracketSizeOverride || ''} 
                  onChange={(e) => setBracketSizeOverride(e.target.value ? parseInt(e.target.value) : undefined)}
                  
                >
                  <option value="">Auto-Calculate (Best Fit)</option>
                  <option value="16">Round of 16</option>
                  <option value="32">Round of 32</option>
                  <option value="64">Round of 64</option>
                </select>
              </div>
            </div>
            <Button size="lg" onClick={() => generateDraw(format, bracketSizeOverride)}>
              <LayoutList size={18}  />
              GENERATE NEW DRAFT
            </Button>
          </Card>

          {/* Visualizer Output */}
          <Card >
            {!activeDraft ? (
              <div >
                <Trophy size={48}  />
                <p>No active draw draft. Generate one above.</p>
              </div>
            ) : (
              <div>
                <div >
                  <div>
                    <h3 >Draft Version: {activeDraft.version}</h3>
                    <p >
                      {activeDraft.config.format === 'KNOCKOUT' ? `Round of ${activeDraft.config.bracketSize}` : 'Round Robin Pools'} | {activeDraft.config.category}
                    </p>
                  </div>
                  <div >
                    <Badge variant={activeDraft.status === 'PUBLISHED' ? 'success' : 'warning'}>
                      {activeDraft.status}
                    </Badge>
                    {activeDraft.status === 'DRAFT' && (
                      <Button variant="success" onClick={publishDraw}>
                        <CheckCircle2 size={16}  /> PUBLISH DRAW
                      </Button>
                    )}
                  </div>
                </div>

                {/* Render Knockout Tree (Simplified) */}
                {activeDraft.config.format === 'KNOCKOUT' && (
                  <div >
                    {activeDraft.slots.map(slot => (
                      <div key={slot.matchId} >
                        <div >
                          Match {slot.matchId}
                        </div>
                        <div >
                          {slot.player1 === 'BYE' ? <span >BYE</span> : slot.player1?.name}
                        </div>
                        <div >
                          {slot.player2 === 'BYE' ? <span >BYE</span> : slot.player2?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Render Pools Grid */}
                {activeDraft.config.format === 'POOLS_TO_KNOCKOUT' && activeDraft.pools && (
                  <div >
                    {Object.entries(activeDraft.pools).map(([poolName, pList]) => (
                      <div key={poolName} >
                        <div >
                          {poolName}
                        </div>
                        <div >
                          {pList.map((p, i) => (
                            <div key={p.id} >
                              <span >{i + 1}.</span> {p.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT SIDEBAR: AUDIT LOGS */}
        <Card >
          <div >
            <h2 >
              <FileText size={18} /> Draw Meta-Logs
            </h2>
          </div>
          <div >
            {logs.map((log, i) => (
              <div key={i} >
                {log}
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}

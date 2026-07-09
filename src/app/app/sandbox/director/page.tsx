'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Mic, Radio, Network, GitMerge, Settings2, Activity } from 'lucide-react';
import { DynamicButton } from '@/components/ui/DynamicButton';

export default function DirectorSandbox() {
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [globalSuspension, setGlobalSuspension] = useState(false);

  return (
    <div >
      
      {/* ── Header ── */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        
      >
        <div>
          <div >
            <AlertTriangle size={32} color="#f85149" />
            <h1 >
              CRISIS CONTROL
            </h1>
          </div>
          <p >
            Emergency interventions and global event flow management.
          </p>
        </div>
        
        {/* Global Suspension Toggle */}
        <motion.div 
          animate={{
            borderColor: globalSuspension ? 'rgba(248,81,73,0.8)' : 'rgba(255,255,255,0.1)',
            boxShadow: globalSuspension ? '0 0 30px rgba(248,81,73,0.2)' : 'none'
          }}
          
        >
          <div>
            <h3 >Global Suspension</h3>
            <p >Halts all active matches.</p>
          </div>
          <DynamicButton 
            variant="secondary" 
            
            onClick={() => setGlobalSuspension(!globalSuspension)}
          >
            {globalSuspension ? 'LIFT SUSPENSION' : 'ENGAGE LOCKDOWN'}
          </DynamicButton>
        </motion.div>
      </motion.header>

      <div >
        
        {/* ── Left Column: Comms & PA ── */}
        <div >
          
          {/* Emergency PA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            
          >
            <div >
              <Mic size={24} color="#58a6ff" />
              <h2 >P.A. Override System</h2>
            </div>
            
            <textarea 
              placeholder="Type emergency broadcast message..."
              
            />
            
            <div >
              <div >
                <Activity size={16} color={broadcastActive ? '#3fb950' : 'var(--text-muted)'} />
                Status: {broadcastActive ? <span >Transmitting</span> : 'Idle'}
              </div>
              <DynamicButton 
                variant="secondary" 
                onClick={() => setBroadcastActive(!broadcastActive)}
                
              >
                {broadcastActive ? 'Stop Broadcast' : 'Broadcast to All Screens'}
              </DynamicButton>
            </div>
          </motion.div>

          {/* Broadcast Quality Alert */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            
          >
            <div >
              <Radio size={24} color="#d2a8ff" />
              <h2 >Stream Telemetry</h2>
            </div>
            
            <div >
              <div >
                <span >Court 1 Encode</span>
                <span >1080p / 60fps (Stable)</span>
              </div>
              <div >
                <span >Court 2 Packet Loss</span>
                <span >14% (Degraded)</span>
              </div>
              <div >
                <span >Audio Sync</span>
                <span >0ms Drift</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ── Right Column: Structural ── */}
        <div >
          
          {/* Bracket Reseeder */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            
          >
            <div >
              <GitMerge size={24} color="#e3b341" />
              <h2 >Surgical Bracket Editing</h2>
            </div>
            <p >
              Use this tool to forcefully redraw tournament trees, override referee decisions, or process disqualifications without relying on standard workflow.
            </p>

            <div >
              <div >
                <label >Select Tournament</label>
                <select >
                  <option>Summer Smash 2026</option>
                  <option>Winter Classic 2025</option>
                </select>
              </div>

              <div >
                <label >Target Node (Match ID)</label>
                <input type="text" placeholder="e.g. M-1042"  />
              </div>

              <div >
                <div >
                  <Settings2 size={16} /> Override Action
                </div>
                <div >
                  <label >
                    <input type="radio" name="action" /> Force Walkover
                  </label>
                  <label >
                    <input type="radio" name="action" /> Inject Sub
                  </label>
                  <label >
                    <input type="radio" name="action" /> Nullify Score
                  </label>
                </div>
              </div>

              <DynamicButton variant="secondary" >
                Execute Surgical Edit
              </DynamicButton>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

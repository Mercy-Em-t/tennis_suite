'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Mic, Radio, Network, GitMerge, Settings2, Activity } from 'lucide-react';
import { DynamicButton } from '@/components/ui/DynamicButton';

export default function DirectorSandbox() {
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [globalSuspension, setGlobalSuspension] = useState(false);

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* ── Header ── */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <AlertTriangle size={32} color="#f85149" />
            <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: 0, color: '#f85149', letterSpacing: '-0.02em', textShadow: '0 0 20px rgba(248,81,73,0.3)' }}>
              CRISIS CONTROL
            </h1>
          </div>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: 0 }}>
            Emergency interventions and global event flow management.
          </p>
        </div>
        
        {/* Global Suspension Toggle */}
        <motion.div 
          animate={{
            borderColor: globalSuspension ? 'rgba(248,81,73,0.8)' : 'rgba(255,255,255,0.1)',
            boxShadow: globalSuspension ? '0 0 30px rgba(248,81,73,0.2)' : 'none'
          }}
          style={{ 
            background: globalSuspension ? 'rgba(248,81,73,0.1)' : 'rgba(0,0,0,0.3)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            padding: '16px 24px', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 4px 0', color: globalSuspension ? '#f85149' : '#fff', fontSize: '1.1rem' }}>Global Suspension</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Halts all active matches.</p>
          </div>
          <DynamicButton 
            variant="outline" 
            style={{ 
              borderColor: globalSuspension ? '#f85149' : 'var(--card-border)', 
              color: globalSuspension ? '#fff' : 'var(--text-muted)',
              background: globalSuspension ? '#f85149' : 'transparent'
            }}
            onClick={() => setGlobalSuspension(!globalSuspension)}
          >
            {globalSuspension ? 'LIFT SUSPENSION' : 'ENGAGE LOCKDOWN'}
          </DynamicButton>
        </motion.div>
      </motion.header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px', alignItems: 'start' }}>
        
        {/* ── Left Column: Comms & PA ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Emergency PA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid var(--card-border)', padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Mic size={24} color="#58a6ff" />
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem' }}>P.A. Override System</h2>
            </div>
            
            <textarea 
              placeholder="Type emergency broadcast message..."
              style={{ width: '100%', height: '100px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', color: '#fff', resize: 'none', marginBottom: '16px', fontSize: '1rem' }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Activity size={16} color={broadcastActive ? '#3fb950' : 'var(--text-muted)'} />
                Status: {broadcastActive ? <span style={{ color: '#3fb950' }}>Transmitting</span> : 'Idle'}
              </div>
              <DynamicButton 
                variant="primary" 
                onClick={() => setBroadcastActive(!broadcastActive)}
                style={{ background: broadcastActive ? '#f85149' : 'var(--primary)', borderColor: broadcastActive ? '#f85149' : 'var(--primary)' }}
              >
                {broadcastActive ? 'Stop Broadcast' : 'Broadcast to All Screens'}
              </DynamicButton>
            </div>
          </motion.div>

          {/* Broadcast Quality Alert */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid var(--card-border)', padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Radio size={24} color="#d2a8ff" />
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem' }}>Stream Telemetry</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Court 1 Encode</span>
                <span style={{ color: '#3fb950', fontWeight: 600 }}>1080p / 60fps (Stable)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', padding: '12px 16px', borderRadius: '8px' }}>
                <span style={{ color: '#f85149' }}>Court 2 Packet Loss</span>
                <span style={{ color: '#f85149', fontWeight: 600 }}>14% (Degraded)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Audio Sync</span>
                <span style={{ color: '#3fb950', fontWeight: 600 }}>0ms Drift</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ── Right Column: Structural ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Bracket Reseeder */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid var(--card-border)', padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <GitMerge size={24} color="#e3b341" />
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem' }}>Surgical Bracket Editing</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Use this tool to forcefully redraw tournament trees, override referee decisions, or process disqualifications without relying on standard workflow.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select Tournament</label>
                <select style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}>
                  <option>Summer Smash 2026</option>
                  <option>Winter Classic 2025</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Target Node (Match ID)</label>
                <input type="text" placeholder="e.g. M-1042" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }} />
              </div>

              <div style={{ background: 'rgba(227, 179, 65, 0.1)', border: '1px dashed rgba(227, 179, 65, 0.3)', padding: '16px', borderRadius: '8px', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e3b341', marginBottom: '8px', fontWeight: 600 }}>
                  <Settings2 size={16} /> Override Action
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.9rem' }}>
                    <input type="radio" name="action" /> Force Walkover
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.9rem' }}>
                    <input type="radio" name="action" /> Inject Sub
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.9rem' }}>
                    <input type="radio" name="action" /> Nullify Score
                  </label>
                </div>
              </div>

              <DynamicButton variant="outline" style={{ marginTop: '16px', borderColor: '#e3b341', color: '#e3b341' }}>
                Execute Surgical Edit
              </DynamicButton>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

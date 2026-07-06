'use client';
import React, { useState } from 'react';
import useSWR from 'swr';
import { ShieldAlert, Activity, AlertCircle, X, ChevronDown, Lock } from 'lucide-react';
import { KillSwitch } from './KillSwitch';
import { useTournamentContext } from '@/lib/context/TournamentContext';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function DirectorHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { activeTournamentId, setActiveTournamentId } = useTournamentContext();
  
  // Only poll if we have an active tournament context
  const { data, error } = useSWR(
    activeTournamentId ? `/api/director/health?tournamentId=${activeTournamentId}` : null, 
    fetcher, 
    { refreshInterval: 5000 }
  );

  // Fallbacks while loading
  const isHealthy = data?.systemStatus === 'HEALTHY';
  const alertsCount = data?.activeDisputes || 0;

  // Mock list of tournaments this Delegate is authorized to manage
  const authorizedTournaments = [
    { id: 'T_LONDON_24', name: 'London Open 2024' },
    { id: 'T_PARIS_24', name: 'Paris Masters' }
  ];

  if (!activeTournamentId) {
    return (
      <div style={{ padding: '3rem', maxWidth: '600px', margin: '4rem auto', background: '#1f2937', borderRadius: '12px', border: '1px solid #374151', color: 'white', textAlign: 'center' }}>
        <Lock size={48} color="#60a5fa" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>TENANT ISOLATION LOCK</h2>
        <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>You must select an active tournament context to access the Delegate Command Tower.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {authorizedTournaments.map(t => (
            <button 
              key={t.id}
              onClick={() => setActiveTournamentId(t.id)}
              style={{ background: '#374151', border: '1px solid #4b5563', padding: '1rem', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Enter: {t.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* The Global Status Bar */}
      <header style={{
        background: '#111827',
        borderBottom: '1px solid #374151',
        padding: '0.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        color: 'white'
      }}>
        {/* Left: Context Switcher & Pulse Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>CONTEXT:</span>
            <select 
              value={activeTournamentId}
              onChange={(e) => setActiveTournamentId(e.target.value)}
              style={{ background: '#1f2937', border: '1px solid #4b5563', color: 'white', padding: '0.5rem', borderRadius: '6px', fontWeight: 'bold' }}
            >
              {authorizedTournaments.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1f2937', padding: '0.5rem 1rem', borderRadius: '999px', border: `1px solid ${isHealthy ? '#10b981' : '#f59e0b'}` }}>
            <Activity size={16} color={isHealthy ? '#10b981' : '#f59e0b'} />
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: isHealthy ? '#10b981' : '#f59e0b' }}>
              {isHealthy ? 'SYSTEM NOMINAL' : 'WARNING DEGRADED'}
            </span>
          </div>
        </div>

        {/* Right: Alerts & Kill Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: alertsCount > 0 ? '#ef4444' : '#9ca3af' }}>
            <AlertCircle size={20} />
            <span style={{ fontWeight: 'bold' }}>{alertsCount} Active Alerts</span>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            style={{
              background: '#b91c1c',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1.5rem',
              borderRadius: '6px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(185, 28, 28, 0.5)'
            }}
          >
            <ShieldAlert size={18} />
            EMERGENCY OVERRIDE
          </button>
        </div>
      </header>

      {/* The High-Alert Modal for the Kill Switch */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '800px', padding: '2rem' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '0', right: '0', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
            >
              <X size={32} />
            </button>
            {/* Render the massive original Kill Switch slider */}
            <KillSwitch />
          </div>
        </div>
      )}
    </>
  );
}

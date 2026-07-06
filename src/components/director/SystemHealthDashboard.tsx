'use client';

import React from 'react';
import useSWR from 'swr';
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTournamentContext } from '@/lib/context/TournamentContext';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function SystemHealthDashboard() {
  const { activeTournamentId } = useTournamentContext();
  const { data, error } = useSWR(activeTournamentId ? `/api/director/health?tournamentId=${activeTournamentId}` : null, fetcher, { refreshInterval: 5000 });

  if (error) return <div style={{ color: '#ef4444' }}>Failed to load telemetry.</div>;
  if (!data) return <div style={{ color: '#9ca3af' }}>Connecting to health sensors...</div>;

  const isHealthy = data.systemStatus === 'HEALTHY';

  return (
    <div style={{ background: '#1f2937', padding: '1.5rem', borderRadius: '12px', color: 'white', maxWidth: '600px', border: `2px solid ${isHealthy ? '#10b981' : '#f59e0b'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isHealthy ? '#10b981' : '#f59e0b' }}>
          <Activity size={24} />
          <h2 style={{ margin: 0 }}>SYSTEM TELEMETRY</h2>
        </div>
        <div style={{ background: isHealthy ? '#065f46' : '#b45309', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 'bold' }}>
          {data.systemStatus}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div style={{ background: '#111827', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '0.5rem' }}>ACTIVE MATCHES</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.activeMatches || 0}</div>
        </div>
        
        <div style={{ background: '#111827', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.5rem' }}>ACTIVE DISPUTES</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: data.activeDisputes > 0 ? '#ef4444' : 'white' }}>
            {data.activeDisputes || 0}
          </div>
        </div>

        <div style={{ background: '#111827', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ color: '#60a5fa', fontSize: '0.8rem', marginBottom: '0.5rem' }}>1HR INTERVENTIONS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.interventionsLastHour || 0}</div>
        </div>
      </div>

      {!isHealthy && (
        <div style={{ marginTop: '1.5rem', background: 'rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fbbf24' }}>
          <AlertTriangle size={20} />
          <span style={{ fontSize: '0.9rem' }}>High dispute rate detected. Consider escalating to Manual Override on affected courts.</span>
        </div>
      )}
      {isHealthy && (
        <div style={{ marginTop: '1.5rem', background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#34d399' }}>
          <ShieldCheck size={20} />
          <span style={{ fontSize: '0.9rem' }}>All active courts reporting nominal telemetry.</span>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useNetworkState, Device } from './useNetworkState';
import { Database, Server, Wifi, Battery, Activity, RotateCcw, PowerOff, ShieldAlert } from 'lucide-react';

export default function NetworkAdminDashboard() {
  const { network, pingDatabase, forceSleepDatabase, restartDevice, loaded } = useNetworkState();
  const [theme, setTheme] = useState<'MODERN' | 'TERMINAL'>('TERMINAL');

  if (!loaded) return <div style={{ background: '#000', color: '#0f0', padding: '40px' }}>INITIALIZING IT KERNEL...</div>;

  // --- Themes ---
  const isTerminal = theme === 'TERMINAL';
  
  const S = {
    page: { 
      padding: '24px', 
      minHeight: '100vh', 
      background: isTerminal ? '#050505' : '#f8fafc',
      color: isTerminal ? '#3fb950' : '#0f172a',
      fontFamily: isTerminal ? '"Fira Code", monospace' : 'Inter, system-ui, sans-serif',
      transition: 'all 0.3s ease'
    } as React.CSSProperties,
    card: { 
      background: isTerminal ? '#0d1117' : '#ffffff', 
      border: `1px solid ${isTerminal ? '#3fb950' : '#e2e8f0'}`, 
      padding: '24px', 
      borderRadius: isTerminal ? '4px' : '12px',
      boxShadow: isTerminal ? '0 0 10px rgba(63,185,80,0.1)' : '0 4px 6px rgba(0,0,0,0.05)'
    } as React.CSSProperties,
    header: { 
      borderBottom: `2px solid ${isTerminal ? '#3fb950' : '#e2e8f0'}`, 
      paddingBottom: '16px', 
      marginBottom: '24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    } as React.CSSProperties,
    grid: { display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' } as React.CSSProperties,
    title: { margin: 0, fontWeight: 900, fontSize: '1.5rem', textTransform: isTerminal ? 'uppercase' : 'none' } as React.CSSProperties,
    deviceBox: { 
      padding: '16px', 
      background: isTerminal ? '#000' : '#f1f5f9', 
      border: `1px solid ${isTerminal ? 'rgba(63,185,80,0.3)' : '#cbd5e1'}`,
      borderRadius: isTerminal ? '0' : '8px',
      display: 'flex', flexDirection: 'column', gap: '12px'
    } as React.CSSProperties,
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 50) return isTerminal ? '#3fb950' : '#10b981'; // Green
    if (latency < 150) return isTerminal ? '#d2a8ff' : '#f59e0b'; // Yellow/Purple
    return '#f85149'; // Red
  };

  const renderDevice = (d: Device) => {
    const isCritical = d.status === 'OFFLINE' || d.battery < 20 || d.latency > 500;
    const borderCol = isCritical ? '#f85149' : (isTerminal ? 'rgba(63,185,80,0.3)' : '#cbd5e1');
    
    return (
      <div key={d.id} style={{ ...S.deviceBox, border: `1px solid ${borderCol}`, boxShadow: isCritical && isTerminal ? '0 0 10px rgba(248,81,73,0.3)' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '4px' }}>{d.role}</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isCritical ? '#f85149' : 'inherit' }}>{d.name}</div>
          </div>
          <Badge variant={d.status === 'ONLINE' ? 'success' : d.status === 'OFFLINE' ? 'destructive' : 'warning'}>{d.status}</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: d.battery < 20 ? '#f85149' : 'inherit' }}>
            <Battery size={16} /> {d.battery}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wifi size={16} /> Signal: {d.signalStrength}/4
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: getLatencyColor(d.latency) }}>
            <Activity size={16} /> Ping: {d.status === 'ONLINE' ? `${d.latency}ms` : 'ERR'}
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: `1px solid ${isTerminal ? 'rgba(63,185,80,0.1)' : '#e2e8f0'}`, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant={isTerminal ? 'outline' : 'secondary'}
            onClick={() => restartDevice(d.id)}
            disabled={d.status === 'REBOOTING' || d.status === 'SYNCING'}
            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
          >
            <RotateCcw size={12} style={{ marginRight: '4px' }} />
            {d.status === 'REBOOTING' ? 'REBOOTING...' : 'REMOTE RESTART'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div style={S.page}>
      
      <header style={S.header}>
        <div>
          <h1 style={S.title}>
            {isTerminal ? '> TENNIS_SUITE // IT_NOC_TERMINAL' : 'Network Operations Center'}
          </h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>
              {isTerminal ? 'Authorized Personnel Only. Connection secured.' : 'Monitor device health and infrastructure connectivity.'}
            </p>
            <Badge variant="success" style={{ fontSize: '0.7rem' }}>
              <ShieldAlert size={12} style={{ marginRight: '4px' }} />
              FAIL-SAFE LOCAL CACHE: ACTIVE
            </Badge>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button 
            variant={isTerminal ? 'outline' : 'secondary'} 
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(network, null, 2));
              const downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute("href", dataStr);
              downloadAnchorNode.setAttribute("download", "network_diagnostics_backup.json");
              document.body.appendChild(downloadAnchorNode);
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
            }}
            style={{ fontFamily: 'inherit', fontSize: '0.8rem' }}
          >
            EXPORT DIAGNOSTICS
          </Button>
          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>THEME:</span>
            <Button 
              variant={isTerminal ? 'success' : 'secondary'} 
              onClick={() => setTheme(isTerminal ? 'MODERN' : 'TERMINAL')}
              style={{ fontFamily: 'inherit' }}
            >
              {isTerminal ? 'TERMINAL' : 'MODERN'}
            </Button>
          </div>
        </div>
      </header>

      <div style={S.grid}>
        
        {/* Main Fleet View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} /> Active Device Fleet
              </h2>
              <Badge variant="primary">Total: {network.devices.length}</Badge>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {network.devices.map(renderDevice)}
            </div>
          </Card>
        </div>

        {/* Sidebar: Servers & Database */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <Card style={S.card}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={20} /> Edge Database Node
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: isTerminal ? '#000' : '#f1f5f9', borderRadius: isTerminal ? 0 : '8px' }}>
                <span>Status</span>
                <Badge variant={network.dbStatus === 'AWAKE' ? 'success' : network.dbStatus === 'ASLEEP' ? 'destructive' : 'warning'}>
                  {network.dbStatus}
                </Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: isTerminal ? '#000' : '#f1f5f9', borderRadius: isTerminal ? 0 : '8px' }}>
                <span>Latency (Ping)</span>
                <span style={{ fontWeight: 'bold', color: getLatencyColor(network.dbLatency) }}>
                  {network.dbStatus === 'ASLEEP' ? 'N/A' : `${network.dbLatency}ms`}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <Button 
                  variant={isTerminal ? (network.dbStatus === 'ASLEEP' ? 'success' : 'outline') : 'primary'}
                  onClick={pingDatabase}
                  disabled={network.dbStatus === 'COLD_STARTING'}
                  style={{ width: '100%', fontFamily: 'inherit' }}
                >
                  <Activity size={16} style={{ marginRight: '8px' }} />
                  {network.dbStatus === 'ASLEEP' ? 'INITIATE COLDSTART' : 'PING DATABASE'}
                </Button>
                
                <Button 
                  variant="destructive"
                  onClick={forceSleepDatabase}
                  disabled={network.dbStatus === 'ASLEEP'}
                  style={{ width: '100%', fontFamily: 'inherit' }}
                >
                  <PowerOff size={16} style={{ marginRight: '8px' }} />
                  SIMULATE NODE SLEEP
                </Button>
              </div>
            </div>
          </Card>

          <Card style={S.card}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={20} /> WebSocket Traffic
            </h2>
            <div style={{ height: '150px', background: isTerminal ? '#000' : '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
              {/* Simulated traffic graph using CSS */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: isTerminal ? 'rgba(63,185,80,0.2)' : 'rgba(16,185,129,0.2)', clipPath: 'polygon(0 100%, 0 50%, 20% 40%, 40% 70%, 60% 30%, 80% 60%, 100% 20%, 100% 100%)' }} />
              <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.8rem', opacity: 0.7 }}>
                Packets: ~420/s
              </div>
            </div>
          </Card>

        </div>

      </div>

      {/* CSS For Terminal Glow Effect */}
      {isTerminal && (
        <style>{`
          * {
            text-shadow: 0 0 2px rgba(63,185,80,0.3);
          }
          ::selection {
            background: rgba(63,185,80,0.3);
          }
        `}</style>
      )}

    </div>
  );
}

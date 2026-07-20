'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface LifecycleVisualizerProps {
  role: string;
  token?: string;
}

export function LifecycleVisualizer({ role, token }: LifecycleVisualizerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [simulatedRole, setSimulatedRole] = useState(role.toUpperCase());

  // Available roles for the simulator dropdown
  const availableRoles = ['MANAGER', 'HOST', 'PLAYER', 'REFEREE', 'MARSHALL', 'BROADCAST', 'PUBLIC'];

  useEffect(() => {
    // Once the iframe is loaded, we can send the context securely to the 3D engine
    if (loaded && iframeRef.current && iframeRef.current.contentWindow) {
      // Pass the persona/role down to the 3D canvas so it can lock/unlock nodes
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'SET_USER_CONTEXT',
          payload: {
            role: simulatedRole,
            token: token
          }
        },
        window.location.origin
      );
    }
  }, [loaded, simulatedRole, token]);

  return (
    <Card style={{ padding: '0', overflow: 'hidden', height: 'calc(100vh - 150px)', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20, display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(0,0,0,0.8)', padding: '8px 16px', borderRadius: '24px', border: '1px solid var(--accent-cyan)' }}>
        <span style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '1px' }}>Simulate Persona:</span>
        <select 
          value={simulatedRole} 
          onChange={(e) => setSimulatedRole(e.target.value)}
          style={{ background: 'transparent', color: 'var(--accent-cyan)', border: 'none', outline: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}
        >
          {availableRoles.map(r => (
            <option key={r} value={r} style={{ background: '#050814', color: '#fff' }}>{r}</option>
          ))}
        </select>
      </div>

      <iframe
        ref={iframeRef}
        src="/3d-state-machine/index.html"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: '#050814'
        }}
        title="3D Lifecycle State Machine"
        sandbox="allow-scripts allow-same-origin"
      />
    </Card>
  );
}

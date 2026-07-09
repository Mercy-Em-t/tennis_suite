'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { TabletSmartphone, Wifi, WifiOff, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CourtClient() {
  const [courtId, setCourtId] = useState('court-alpha-1');
  const [isPinging, setIsPinging] = useState(true);
  const [simulatedLatency, setSimulatedLatency] = useState(0); // Add artificial delay to client timestamp
  const [lastPingStatus, setLastPingStatus] = useState<'SUCCESS' | 'FAILED' | null>(null);
  const pingCount = useRef(0);

  useEffect(() => {
    if (!isPinging) {
      setLastPingStatus(null);
      return;
    }

    const ping = async () => {
      try {
        const clientTimestamp = Date.now() - simulatedLatency; 
        const res = await fetch('/api/monitor/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courtId, courtName: `Center Court ${courtId.split('-')[2] || '1'}`, clientTimestamp })
        });
        if (res.ok) {
          setLastPingStatus('SUCCESS');
          pingCount.current += 1;
        } else {
          setLastPingStatus('FAILED');
        }
      } catch (e) {
        setLastPingStatus('FAILED');
      }
    };

    // Ping immediately, then every 3 seconds
    ping();
    const interval = setInterval(ping, 3000);
    return () => clearInterval(interval);
  }, [courtId, isPinging, simulatedLatency]);

  return (
    <div style={{ padding: '48px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <TabletSmartphone size={36} color="var(--primary)" />
          Court Umpire iPad
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>
          Telemetry Generator
        </p>
      </header>

      <Card style={{ padding: '32px', background: '#161b22', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{courtId}</div>
          <AnimatePresence mode="popLayout">
            {isPinging ? (
              <motion.div
                key="online"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}
              >
                <Wifi size={20} /> Transmitting
              </motion.div>
            ) : (
              <motion.div
                key="offline"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}
              >
                <WifiOff size={20} /> Offline
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Pings</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{pingCount.current}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Added Latency</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: simulatedLatency > 0 ? '#d29922' : '#c9d1d9' }}>{simulatedLatency}ms</div>
          </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-muted)' }}>Simulation Controls</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <DynamicButton 
            variant={simulatedLatency === 0 ? 'primary' : 'outline'}
            onClick={() => setSimulatedLatency(0)}
          >
            Normal Connection (0ms delay)
          </DynamicButton>
          
          <DynamicButton 
            variant={simulatedLatency === 600 ? 'primary' : 'outline'}
            onClick={() => setSimulatedLatency(600)}
            style={simulatedLatency === 600 ? { background: '#d29922', color: '#000', borderColor: '#d29922' } : { borderColor: '#d29922', color: '#d29922' }}
          >
            Simulate Weak WiFi (600ms latency)
          </DynamicButton>

          <DynamicButton 
            variant={!isPinging ? 'primary' : 'outline'}
            onClick={() => setIsPinging(!isPinging)}
            style={!isPinging ? { background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' } : { borderColor: 'var(--danger)', color: 'var(--danger)' }}
          >
            {isPinging ? 'Simulate Total Disconnect (Stop Pinging)' : 'Reconnect Device'}
          </DynamicButton>
        </div>
      </Card>
    </div>
  );
}

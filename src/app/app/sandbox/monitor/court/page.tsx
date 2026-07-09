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
    <div >
      <header >
        <h1 >
          <TabletSmartphone size={36} color="var(--primary)" />
          Court Umpire iPad
        </h1>
        <p >
          Telemetry Generator
        </p>
      </header>

      <Card >
        <div >
          <div >{courtId}</div>
          <AnimatePresence mode="popLayout">
            {isPinging ? (
              <motion.div
                key="online"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                
              >
                <Wifi size={20} /> Transmitting
              </motion.div>
            ) : (
              <motion.div
                key="offline"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                
              >
                <WifiOff size={20} /> Offline
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div >
          <div >
            <div >Total Pings</div>
            <div >{pingCount.current}</div>
          </div>
          <div >
            <div >Added Latency</div>
            <div >{simulatedLatency}ms</div>
          </div>
        </div>

        <h3 >Simulation Controls</h3>
        <div >
          <DynamicButton 
            variant={simulatedLatency === 0 ? 'primary' : 'secondary'}
            onClick={() => setSimulatedLatency(0)}
          >
            Normal Connection (0ms delay)
          </DynamicButton>
          
          <DynamicButton 
            variant={simulatedLatency === 600 ? 'primary' : 'secondary'}
            onClick={() => setSimulatedLatency(600)}
            style={simulatedLatency === 600 ? { background: '#d29922', color: '#000', borderColor: '#d29922' } : { borderColor: '#d29922', color: '#d29922' }}
          >
            Simulate Weak WiFi (600ms latency)
          </DynamicButton>

          <DynamicButton 
            variant={!isPinging ? 'primary' : 'secondary'}
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

import { useState, useEffect } from 'react';

export type DeviceRole = 'UMPIRE' | 'MARSHALL' | 'BROADCAST' | 'HOST';
export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'REBOOTING';
export type DbStatus = 'AWAKE' | 'ASLEEP' | 'COLD_STARTING';

export interface Device {
  id: string;
  name: string;
  role: DeviceRole;
  battery: number;
  signalStrength: number; // 0 to 4
  status: DeviceStatus;
  latency: number; // ms
  lastPing: string;
}

export interface NetworkStateData {
  dbStatus: DbStatus;
  dbLatency: number;
  devices: Device[];
}

const defaultState: NetworkStateData = {
  dbStatus: 'AWAKE',
  dbLatency: 45,
  devices: [
    { id: 'd1', name: 'Court 1 Umpire Tablet', role: 'UMPIRE', battery: 85, signalStrength: 4, status: 'ONLINE', latency: 32, lastPing: 'Just now' },
    { id: 'd2', name: 'Court 2 Umpire Tablet', role: 'UMPIRE', battery: 42, signalStrength: 2, status: 'ONLINE', latency: 150, lastPing: 'Just now' },
    { id: 'd3', name: 'Marshall Radio Alpha', role: 'MARSHALL', battery: 12, signalStrength: 1, status: 'OFFLINE', latency: 999, lastPing: '5 mins ago' },
    { id: 'd4', name: 'Graphics Engine Mac', role: 'BROADCAST', battery: 100, signalStrength: 4, status: 'ONLINE', latency: 12, lastPing: 'Just now' },
    { id: 'd5', name: 'Host Desk iPad', role: 'HOST', battery: 67, signalStrength: 3, status: 'ONLINE', latency: 45, lastPing: 'Just now' },
  ]
};

export function useNetworkState() {
  const [network, setNetwork] = useState<NetworkStateData>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('network_sandbox_v1');
    if (stored) {
      setNetwork(JSON.parse(stored));
    } else {
      localStorage.setItem('network_sandbox_v1', JSON.stringify(defaultState));
    }
    setLoaded(true);
  }, []);

  const saveState = (newState: NetworkStateData) => {
    setNetwork(newState);
    localStorage.setItem('network_sandbox_v1', JSON.stringify(newState));
  };

  // Simulate network fluctuation
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      setNetwork(prev => {
        // Only awake DB fluctuates
        const newDbLatency = prev.dbStatus === 'AWAKE' ? Math.max(10, prev.dbLatency + (Math.random() * 20 - 10)) : prev.dbLatency;
        
        const newDevices = prev.devices.map(d => {
          if (d.status === 'ONLINE' || d.status === 'SYNCING') {
            return {
              ...d,
              latency: Math.max(5, d.latency + (Math.random() * 30 - 15)),
              signalStrength: Math.random() > 0.95 ? Math.max(1, Math.min(4, d.signalStrength + (Math.random() > 0.5 ? 1 : -1))) : d.signalStrength
            };
          }
          return d;
        });
        
        const next = { ...prev, dbLatency: Math.round(newDbLatency), devices: newDevices };
        localStorage.setItem('network_sandbox_v1', JSON.stringify(next));
        return next;
      });
    }, 3000); // Fluctuate every 3s
    return () => clearInterval(interval);
  }, [loaded]);

  const pingDatabase = () => {
    if (network.dbStatus === 'ASLEEP') {
      saveState({ ...network, dbStatus: 'COLD_STARTING', dbLatency: 999 });
      setTimeout(() => {
        setNetwork(prev => {
          const next = { ...prev, dbStatus: 'AWAKE' as DbStatus, dbLatency: 120 };
          localStorage.setItem('network_sandbox_v1', JSON.stringify(next));
          return next;
        });
      }, 3000);
    } else {
      // Just a normal ping visual feedback
      saveState({ ...network, dbLatency: Math.max(10, network.dbLatency - 20) });
    }
  };

  const forceSleepDatabase = () => {
    saveState({ ...network, dbStatus: 'ASLEEP', dbLatency: 0 });
  };

  const restartDevice = (deviceId: string) => {
    saveState({
      ...network,
      devices: network.devices.map(d => d.id === deviceId ? { ...d, status: 'REBOOTING', latency: 0 } : d)
    });
    
    setTimeout(() => {
      setNetwork(prev => {
        const next = {
          ...prev,
          devices: prev.devices.map(d => d.id === deviceId ? { ...d, status: 'SYNCING' as DeviceStatus, battery: d.battery > 0 ? d.battery : 100 } : d)
        };
        localStorage.setItem('network_sandbox_v1', JSON.stringify(next));
        return next;
      });
    }, 4000);

    setTimeout(() => {
      setNetwork(prev => {
        const next = {
          ...prev,
          devices: prev.devices.map(d => d.id === deviceId ? { ...d, status: 'ONLINE' as DeviceStatus, latency: 45, signalStrength: 4 } : d)
        };
        localStorage.setItem('network_sandbox_v1', JSON.stringify(next));
        return next;
      });
    }, 7000);
  };

  return {
    network,
    pingDatabase,
    forceSleepDatabase,
    restartDevice,
    loaded
  };
}

import { systemHealth } from './SystemHealthService';

/**
 * Mock utility representing the Client-Side Telemetry generator.
 * In a real app, this logic lives inside the Referee PWA and Broadcaster app.
 */
export function startMockClientHeartbeat(courtId: string, clientId: string, role: 'REFEREE' | 'BROADCASTER') {
  setInterval(() => {
    // Simulate varying network conditions
    const isDegraded = Math.random() > 0.8;
    const isOffline = Math.random() > 0.95;

    if (isOffline) {
      // Don't pulse, simulating a total disconnect
      return; 
    }

    const latencyMs = isDegraded ? Math.floor(Math.random() * 800) + 300 : Math.floor(Math.random() * 80) + 10;
    const packetLossPercent = isDegraded ? Math.floor(Math.random() * 15) : 0;

    // Send payload (Mocking an API POST to the backend hook)
    systemHealth.recordHeartbeat(courtId, clientId, role, latencyMs, packetLossPercent);
  }, 3000); // Pulse every 3 seconds
}

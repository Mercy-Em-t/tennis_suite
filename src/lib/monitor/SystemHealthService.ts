export type HealthStatus = 'GREEN' | 'AMBER' | 'RED';

export interface TelemetryData {
  courtId: string;
  clientId: string; // e.g., 'referee_1', 'broadcaster_pool_a'
  role: 'REFEREE' | 'BROADCASTER' | 'PLAYER';
  latencyMs: number;
  packetLossPercent: number;
  lastHeartbeat: string; // ISO String
}

export class SystemHealthService {
  private telemetryStore: Map<string, TelemetryData> = new Map();

  constructor() {
    // Inject mock data for the simulation
    this.recordHeartbeat('court_1', 'referee_c1', 'REFEREE', 45, 0); // Green
    
    // Amber: High latency
    const c2 = new Date().getTime() - 2500;
    this.telemetryStore.set('referee_c2', {
      courtId: 'court_2', clientId: 'referee_c2', role: 'REFEREE',
      latencyMs: 650, packetLossPercent: 2, lastHeartbeat: new Date(c2).toISOString()
    });
    
    // Red: Critical loss
    const b1 = new Date().getTime() - 6000;
    this.telemetryStore.set('broadcaster_1', {
      courtId: 'center_court', clientId: 'broadcaster_1', role: 'BROADCASTER',
      latencyMs: 1200, packetLossPercent: 15, lastHeartbeat: new Date(b1).toISOString()
    });
  }

  /**
   * Ingests a heartbeat pulse from an active client.
   */
  public recordHeartbeat(courtId: string, clientId: string, role: TelemetryData['role'], latencyMs: number, packetLossPercent: number): void {
    const data: TelemetryData = {
      courtId,
      clientId,
      role,
      latencyMs,
      packetLossPercent,
      lastHeartbeat: new Date().toISOString(),
    };
    this.telemetryStore.set(clientId, data);
  }

  /**
   * Retrieves the current system health overview for the Monitor dashboard.
   */
  public getSystemOverview(): Record<string, HealthStatus> {
    const overview: Record<string, HealthStatus> = {};
    const now = new Date().getTime();

    for (const [clientId, data] of this.telemetryStore.entries()) {
      const lastPulse = new Date(data.lastHeartbeat).getTime();
      const timeSincePulse = now - lastPulse;

      // Threshold definitions
      if (timeSincePulse > 3000 || data.packetLossPercent > 10) {
        // More than 3 seconds without a pulse, or high packet loss -> RED (Critical)
        overview[clientId] = 'RED';
      } else if (timeSincePulse > 1500 || data.latencyMs > 500) {
        // More than 1.5 seconds without a pulse, or >500ms latency -> AMBER (Degraded)
        overview[clientId] = 'AMBER';
      } else {
        // Optimal -> GREEN
        overview[clientId] = 'GREEN';
      }
    }

    return overview;
  }

  /**
   * Retrieves full details for a specific court's clients
   */
  public getCourtDetails(courtId: string): TelemetryData[] {
    const result: TelemetryData[] = [];
    for (const data of this.telemetryStore.values()) {
      if (data.courtId === courtId) {
        result.push(data);
      }
    }
    return result;
  }
}

export const systemHealth = new SystemHealthService();

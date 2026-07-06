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
  // In-memory mock of the `health_monitor` table
  private telemetryStore: Map<string, TelemetryData> = new Map();

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
      if (timeSincePulse > 5000 || data.packetLossPercent > 10) {
        // More than 5 seconds without a pulse, or high packet loss -> RED (Critical)
        overview[clientId] = 'RED';
      } else if (timeSincePulse > 2000 || data.latencyMs > 500) {
        // More than 2 seconds, or high latency -> AMBER (Degraded)
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

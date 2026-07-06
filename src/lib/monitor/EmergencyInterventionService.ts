import { systemHealth } from './SystemHealthService';

export class EmergencyInterventionService {
  private auditLog: string[] = [];

  /**
   * Instantly reroutes a degraded broadcast stream to a backup encoder.
   */
  public hotSwapStream(courtId: string, backupEncoderIp: string, requestedBy: string): void {
    // Logic to reroute the ingest server
    console.log(`[EMERGENCY] Rerouting stream for Court ${courtId} to ${backupEncoderIp}`);
    
    // Log for the Technical Audit Trail
    this.logIncident(`Hot-Swap Stream`, `Court ${courtId} rerouted to ${backupEncoderIp}`, requestedBy);
  }

  /**
   * Forces a re-handshake for a specific client node.
   */
  public forceConnectionReset(clientId: string, requestedBy: string): void {
    // Emit a specific command through the WebSocket/Transport layer telling the client to reconnect
    console.log(`[EMERGENCY] Forcing connection reset for Client ${clientId}`);
    
    this.logIncident(`Connection Reset`, `Forced reconnect for ${clientId}`, requestedBy);
  }

  private logIncident(action: string, details: string, monitorId: string): void {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] MONITOR: ${monitorId} | ACTION: ${action} | DETAILS: ${details}`;
    this.auditLog.push(entry);
    console.log(`[AUDIT TRAIL] ${entry}`);
  }

  public getAuditTrail(): string[] {
    return [...this.auditLog];
  }
}

export const emergencyIntervention = new EmergencyInterventionService();

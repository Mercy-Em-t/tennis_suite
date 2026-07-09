import { EventEmitter } from 'events';

export type CourtStatus = 'ONLINE' | 'LATENCY_WARNING' | 'OFFLINE';

export interface TelemetryData {
  courtId: string;
  courtName: string;
  lastPingAt: number; // server timestamp
  latencyMs: number;
  status: CourtStatus;
}

class TelemetryStore extends EventEmitter {
  private store: Map<string, TelemetryData> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    // In dev, we don't want to leak intervals if this module reloads
    if (typeof global !== 'undefined' && !(global as any).telemetryStore) {
      this.startCleanupInterval();
    }
  }

  private startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let changed = false;

      for (const [courtId, data] of this.store.entries()) {
        const timeSinceLastPing = now - data.lastPingAt;
        let newStatus = data.status;

        // If no ping for > 5000ms, mark OFFLINE
        if (timeSinceLastPing > 5000) {
          newStatus = 'OFFLINE';
        } else if (data.latencyMs > 500) {
          newStatus = 'LATENCY_WARNING';
        } else {
          newStatus = 'ONLINE';
        }

        if (newStatus !== data.status) {
          data.status = newStatus;
          changed = true;
        }
      }

      if (changed) {
        this.emit('update', this.getAll());
      }
    }, 1000); // Check every second
  }

  public recordPing(courtId: string, courtName: string, clientTimestamp: number) {
    const serverTimestamp = Date.now();
    // Simulate latency by honoring the client's timestamp diff, 
    // ensuring it doesn't go negative if clocks are slightly off
    const rawLatency = serverTimestamp - clientTimestamp;
    const latencyMs = Math.max(0, rawLatency);

    let status: CourtStatus = 'ONLINE';
    if (latencyMs > 500) {
      status = 'LATENCY_WARNING';
    }

    this.store.set(courtId, {
      courtId,
      courtName,
      lastPingAt: serverTimestamp,
      latencyMs,
      status
    });

    // Emit update immediately on ping
    this.emit('update', this.getAll());
  }

  public getAll(): TelemetryData[] {
    return Array.from(this.store.values());
  }

  public clear() {
    this.store.clear();
    this.emit('update', this.getAll());
  }
}

// Ensure global singleton for Next.js hot reloading
const globalForTelemetry = global as unknown as { telemetryStore: TelemetryStore };

export const telemetryStore = globalForTelemetry.telemetryStore || new TelemetryStore();

if (process.env.NODE_ENV !== 'production') {
  globalForTelemetry.telemetryStore = telemetryStore;
}

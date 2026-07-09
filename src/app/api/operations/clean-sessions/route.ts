import { NextResponse } from 'next/server';
import { telemetryStore } from '@/lib/telemetry';
import { matchEventEmitter } from '@/lib/eventEmitter';

export async function POST() {
  try {
    const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
    const now = Date.now();
    const allTelemetry = telemetryStore.getAll();
    
    let purgedCount = 0;
    const purgedCourts: string[] = [];

    const storeMap = (telemetryStore as any).store;

    for (const t of allTelemetry) {
      const stagnantTime = now - t.lastPingAt;
      if (stagnantTime > TWELVE_HOURS_MS) {
        // 1. Fire forced logout payload to client
        matchEventEmitter.emit(`SESSION_EXPIRED:${t.courtId}`, { action: 'FORCE_LOGOUT', reason: 'STAGNANT_SESSION' });
        
        // 2. Evict from memory
        storeMap.delete(t.courtId);
        
        purgedCount++;
        purgedCourts.push(t.courtId);
      }
    }

    if (purgedCount > 0) {
      // Force update of global stream
      telemetryStore.emit('update', telemetryStore.getAll());
    }

    return NextResponse.json({
      success: true,
      message: `Session Clean complete. Purged ${purgedCount} stagnant connections.`,
      purgedCourts
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { telemetryStore } from '@/lib/telemetry';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    if (!tournamentId) {
      return NextResponse.json({ error: 'tournamentId required' }, { status: 400 });
    }

    // 1. Fetch truth from DB
    const dbCourts = await prisma.court.findMany({
      where: { tournamentId },
      select: { id: true, name: true, status: true }
    });

    // 2. Fetch live hardware telemetry
    const liveTelemetry = telemetryStore.getAll();
    const telemetryMap = new Map(liveTelemetry.map(t => [t.courtId, t]));

    // 3. Cross-reference
    const report = dbCourts.map(court => {
      const live = telemetryMap.get(court.id);
      
      let health = 'MISSING';
      let latency = null;
      let lastPingAt = null;

      if (live) {
        health = live.status;
        latency = live.latencyMs;
        lastPingAt = live.lastPingAt;
      }

      return {
        courtId: court.id,
        courtName: court.name,
        dbStatus: court.status,
        health,
        latency,
        lastPingAt
      };
    });

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      report
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

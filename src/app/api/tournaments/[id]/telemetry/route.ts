import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { telemetryStore } from '@/lib/telemetry';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const tournamentId = params.id;

    if (!tournamentId) {
      return NextResponse.json({ error: 'Missing tournament ID' }, { status: 400 });
    }

    const courts = await prisma.court.findMany({
      where: { tournamentId },
      include: {
        matches: {
          where: { status: 'IN_PROGRESS' },
          include: { teamA: true, teamB: true }
        }
      }
    });

    const activeTelemetry = telemetryStore.getAll();
    
    // Map DB courts to telemetry data
    const merged = courts.map(court => {
      const liveData = activeTelemetry.find(t => t.courtId === court.id);
      return {
        id: court.id,
        name: court.name,
        activeMatch: court.matches[0] || null,
        telemetry: liveData || {
          status: 'OFFLINE',
          lastPingAt: 0,
          latencyMs: 0
        }
      };
    });

    return NextResponse.json({
      success: true,
      courts: merged
    });
  } catch (error: any) {
    console.error('[api/tournaments/telemetry]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

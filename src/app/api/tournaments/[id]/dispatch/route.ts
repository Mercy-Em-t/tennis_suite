import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { matchEventEmitter } from '@/lib/eventEmitter';
import { logger } from '@/lib/logger';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { matchId, courtId } = await request.json();

    if (!matchId || !courtId) {
      return NextResponse.json({ error: 'Missing matchId or courtId' }, { status: 400 });
    }

    // Wrap in an atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Validation: Check if Court exists, belongs to this tournament, and is available
      const court = await tx.court.findUnique({
        where: { id: courtId }
      });

      if (!court || court.tournamentId !== params.id) {
        throw new Error('Invalid court for this tournament');
      }

      if (court.status === 'IN_PROGRESS' || court.status === 'MAINTENANCE') {
        throw new Error(`Court is currently occupied (Status: ${court.status}).`);
      }

      // Validation: Check if Match is SCHEDULED
      const targetMatch = await tx.match.findUnique({
        where: { id: matchId }
      });

      if (!targetMatch || targetMatch.status !== 'SCHEDULED') {
        throw new Error('Target match must be in SCHEDULED state.');
      }

      // Atomic State Mutation
      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: {
          courtId: courtId,
          status: 'READY'
        },
        include: { court: true }
      });

      const updatedCourt = await tx.court.update({
        where: { id: courtId },
        data: { status: 'WARMUP' }
      });

      return { match: updatedMatch, court: updatedCourt };
    });

    // Broadcast the update to SSE listeners (Player Command Center)
    matchEventEmitter.emit(`matchUpdated:${matchId}`, {
      ...result.match,
      _dispatch_event: true,
      _court_status: result.court.status
    });

    // Fire Phase 4.3 Automated Alert for Referee PWA
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    fetch(`${origin}/api/notifications/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId: result.match.id,
        courtName: result.match.court?.name || 'TBD',
        action: 'REPORT_TO_COURT'
      })
    }).catch(e => logger.warn("Failed to fire push notification webhook", e));

    return NextResponse.json({ 
      success: true, 
      message: `Match ${matchId} dispatched to Court ${result.court.name}. Status updated to READY.`,
      match: result.match 
    });

  } catch (error: any) {
    logger.error('[tournaments/dispatch/POST]', error.message);
    const status = error.message.includes('occupied') || error.message.includes('SCHEDULED') ? 409 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}

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

      // Validation: Check if Match is SCHEDULED or PENDING
      const targetMatch = await tx.match.findUnique({
        where: { id: matchId }
      });

      if (!targetMatch || !['SCHEDULED', 'PENDING'].includes(targetMatch.status)) {
        throw new Error('Target match must be in PENDING or SCHEDULED state to be dispatched.');
      }

      // Validation: Check for player double-booking (scheduling collision)
      if (targetMatch.teamAId && targetMatch.teamBId) {
        const teams = await tx.team.findMany({
          where: { id: { in: [targetMatch.teamAId, targetMatch.teamBId] } },
          include: { players: true }
        });
        
        const playerIds = teams.flatMap(t => t.players.map(p => p.id));
        
        if (playerIds.length > 0) {
          const activeMatches = await tx.match.findMany({
            where: {
              status: { in: ['IN_PROGRESS', 'WARMUP'] },
              OR: [
                { teamA: { players: { some: { id: { in: playerIds } } } } },
                { teamB: { players: { some: { id: { in: playerIds } } } } }
              ]
            }
          });
          
          if (activeMatches.length > 0) {
            throw new Error('Player double-booking detected. One or more players are currently in an active match.');
          }
        }
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
    const origin = request.headers.get('origin') || 'https://sports.tmsavannah.com';
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
    const status = error.message.includes('occupied') || error.message.includes('SCHEDULED') || error.message.includes('double-booking') ? 409 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}

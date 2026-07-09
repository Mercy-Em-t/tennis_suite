import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { matchEventEmitter } from '@/lib/eventEmitter';
import { logger } from '@/lib/logger';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const { umpireId, action } = await request.json(); // action: 'ASSIGN' or 'REVOKE'

    if (action === 'ASSIGN' && !umpireId) {
      return NextResponse.json({ error: 'umpireId is required to delegate.' }, { status: 400 });
    }

    const targetMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: { teamA: true, teamB: true }
    });

    if (!targetMatch) {
      return NextResponse.json({ error: 'Match not found.' }, { status: 404 });
    }

    if (targetMatch.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Cannot delegate a completed match.' }, { status: 400 });
    }

    // Atomic update
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        umpireId: action === 'ASSIGN' ? umpireId : null
      },
      include: { teamA: true, teamB: true } // Need team data for the client UI
    });

    // Broadcast the update to all clients listening to this match.
    // The player's client will see umpireId has changed to their ID, and instantly morph the UI.
    matchEventEmitter.emit(`matchUpdated:${matchId}`, updatedMatch);

    logger.info(`Match ${matchId} umpiring rights ${action === 'ASSIGN' ? 'delegated to' : 'revoked from'} ${umpireId}`);

    return NextResponse.json({
      success: true,
      message: `Umpire role successfully ${action === 'ASSIGN' ? 'delegated' : 'revoked'}.`,
      match: updatedMatch
    });

  } catch (error: any) {
    logger.error('[matches/delegate/POST]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';



export async function POST(request: Request) {
  try {
    const authResult = await requireAuth(['REFEREE', 'ADMIN']);
    if (authResult instanceof NextResponse) return authResult;

    const { matchId } = await request.json();

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match || (match.status !== 'IN_PROGRESS' && match.status !== 'COMPLETED')) {
      return NextResponse.json({ error: 'Match not found or invalid status' }, { status: 400 });
    }

    if (!match.previousScoreState) {
      return NextResponse.json({ error: 'No previous state to undo' }, { status: 400 });
    }

    // Restore previous state
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        scoreState: match.previousScoreState,
        previousScoreState: null, // Clear it so we can't undo twice
        status: 'IN_PROGRESS', // Ensure it returns to in progress
      },
    });

    logger.info('Score undone', {
      matchId,
      recordedBy: authResult.id,
    });

    return NextResponse.json({
      success: true,
      match: updatedMatch,
    });
  } catch (error) {
    logger.error('[match/undo] Failed to undo score', {}, error);
    return NextResponse.json({ error: 'Failed to undo score' }, { status: 500 });
  }
}

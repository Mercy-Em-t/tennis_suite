import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { advanceScore, TennisScoreState, createInitialScoreState } from '@/lib/engine/scoring';
import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';



export async function POST(request: Request) {
  try {
    // Layer 8: Only REFEREE and ADMIN roles may record scores
    const authResult = await requireAuth(['REFEREE', 'ADMIN']);
    if (authResult instanceof NextResponse) return authResult;
    const user = (authResult as any).user;

    const { matchId, scoringTeam } = await request.json();

    // 1. Fetch current match state
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { teamA: true, teamB: true },
    });

    if (!match || match.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Match not found or not active' }, { status: 400 });
    }

    // RBAC Security Check
    const isHost = user.role === 'HOST' || user.role === 'ADMIN';
    const tournamentStaff = await prisma.staff.findFirst({
      where: {
        userId: user.id,
        tournamentId: match.tournamentId,
        role: 'REFEREE',
        status: 'APPROVED'
      }
    });
    const isTournamentReferee = !!tournamentStaff;

    if (!isHost && !isTournamentReferee) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 403 });
    }

    // 2. Determine new score
    let currentState: TennisScoreState = createInitialScoreState();
    try {
      const parsed =
        typeof match.scoreState === 'string'
          ? JSON.parse(match.scoreState)
          : match.scoreState;
      if (parsed && parsed.pointsA !== undefined) currentState = parsed;
    } catch (_) {}

    // Process point via Engine
    const { newState, matchCompleted, matchWinnerId } = advanceScore(
      currentState,
      scoringTeam as 'A' | 'B'
    );

    // 3. Persist new state to database
    const updateData: any = {
      scoreState: JSON.stringify(newState),
      previousScoreState: match.scoreState, // Cache for Undo
      status: matchCompleted ? 'COMPLETED' : 'IN_PROGRESS',
    };

    if (matchCompleted && !match.completedAt) {
      updateData.completedAt = new Date();
    }
    if (!match.startedAt) {
      updateData.startedAt = new Date();
    }

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: updateData,
    });

    logger.info('Score recorded', {
      matchId,
      scoringTeam,
      matchCompleted,
      recordedBy: authResult.id,
    });

    return NextResponse.json({
      success: true,
      match: updatedMatch,
      matchCompleted,
      matchWinnerId,
    });
  } catch (error) {
    logger.error('[match/score] Failed to record score', {}, error);
    return NextResponse.json({ error: 'Failed to record score' }, { status: 400 });
  }
}

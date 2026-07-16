import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { advanceScore, TennisScoreState, createInitialScoreState } from '@/lib/engine/scoring';
import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    
    // Layer 8: Role Gate - Allow REFEREE, ADMIN, PLAYER, HOST
    const authResult = await requireAuth(['REFEREE', 'ADMIN', 'PLAYER', 'HOST']);
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult as { id: string, role: string };

    const { scoringTeam } = await request.json();

    if (scoringTeam !== 'A' && scoringTeam !== 'B') {
      return NextResponse.json({ error: 'Invalid scoringTeam' }, { status: 400 });
    }

    // Run the atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current match state
      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: { tournament: { select: { lifecyclePhase: true } } }
      });

      if (!match || match.status !== 'IN_PROGRESS') {
        throw new Error('Match not found or not active');
      }

      if (match.tournament?.lifecyclePhase === 'ARCHIVED') {
        throw new Error('UNAUTHORIZED_ARCHIVED');
      }

      // RBAC Security Check
      const isHost = user.role === 'HOST' || user.role === 'ADMIN';
      const tournamentStaff = await tx.staff.findFirst({
        where: {
          userId: user.id,
          tournamentId: match.tournamentId,
          role: 'REFEREE',
          status: 'APPROVED'
        }
      });
      const isTournamentReferee = !!tournamentStaff;
      const isPlayerUmpire = user.role === 'PLAYER' && match.umpireId === user.id;

      if (!isHost && !isTournamentReferee && !isPlayerUmpire) {
        throw new Error('UNAUTHORIZED');
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
      // Assuming matchWinnerId is 'A' or 'B', we map it to team ID
      if (matchWinnerId === 'A' && match.teamAId) {
        updateData.winnerId = match.teamAId;
      } else if (matchWinnerId === 'B' && match.teamBId) {
        updateData.winnerId = match.teamBId;
      }

      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: updateData,
        include: { teamA: true, teamB: true }
      });

      return { updatedMatch, matchCompleted, matchWinnerId };
    });

    logger.info('Score recorded atomically', {
      matchId,
      scoringTeam,
      matchCompleted: result.matchCompleted,
      recordedBy: user.id,
    });

    return NextResponse.json({
      success: true,
      match: result.updatedMatch,
      matchCompleted: result.matchCompleted,
      matchWinnerId: result.matchWinnerId,
    });
  } catch (error: any) {
    logger.error('[matches/[matchId]/score] Failed to record score', {}, error);
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 403 });
    }
    if (error.message === 'UNAUTHORIZED_ARCHIVED') {
      return NextResponse.json({ error: 'Tournament is archived and read-only' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to record score' }, { status: 400 });
  }
}

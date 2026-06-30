import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { advanceScore, TennisScoreState, createInitialScoreState } from '@/lib/engine/scoring';
import { verifyJwtRole } from '@/lib/auth/jwt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const auth = verifyJwtRole(request.headers.get('Authorization'), ['REFEREE', 'ADMIN']);
    if (!auth.valid) return NextResponse.json({ error: auth.error }, { status: 403 });

    const { matchId, scoringTeam } = await request.json();

    // 1. Fetch current match state
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { teamA: true, teamB: true }
    });

    if (!match || match.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Match not found or not active' }, { status: 400 });
    }

    // 2. Determine new score
    // Reconstruct state machine payload
    let currentState: TennisScoreState = createInitialScoreState();
    try { 
      const parsed = typeof match.scoreState === 'string' ? JSON.parse(match.scoreState) : match.scoreState; 
      if (parsed && parsed.pointsA) currentState = parsed;
    } catch(e){}
    
    // Process point via Engine
    const { newState, matchCompleted, matchWinnerId } = advanceScore(currentState, scoringTeam as 'A' | 'B');

    // 3. Persist new state to database
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        scoreState: JSON.stringify(newState),
        status: matchCompleted ? 'COMPLETED' : 'IN_PROGRESS',
      }
    });

    return NextResponse.json({ 
      success: true, 
      match: updatedMatch,
      matchCompleted,
      matchWinnerId
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to record score' }, { status: 400 });
  }
}

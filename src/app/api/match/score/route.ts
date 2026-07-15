import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { advanceScore, createInitialScoreState, TennisScoreState, DEFAULT_MATCH_FORMAT } from '@/lib/engine/scoring';

export async function POST(request: Request) {
  try {
    const { matchId, scoringTeam } = await request.json();

    if (!matchId || !scoringTeam) {
      return NextResponse.json({ error: 'Missing matchId or scoringTeam' }, { status: 400 });
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    // Fetch the match
    const match = await prisma.match.findUnique({
      where: { id: matchId }
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Parse current score state, or initialize if empty
    let currentState: TennisScoreState;
    try {
      currentState = match.scoreState ? JSON.parse(match.scoreState as string) : createInitialScoreState();
    } catch (e) {
      currentState = createInitialScoreState();
    }

    // Advance the score using our Tennis Engine
    const { newState, matchCompleted, matchWinnerId } = advanceScore(currentState, scoringTeam as 'A' | 'B', DEFAULT_MATCH_FORMAT);

    // Update in database (this triggers SSE broadcasts automatically if the Prisma extension is set up, 
    // but the Next.js routes we built poll/stream based on updated `scoreState`)
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        scoreState: JSON.stringify(newState),
        status: matchCompleted ? 'COMPLETED' : match.status,
        winnerId: matchCompleted ? (matchWinnerId === 'A' ? match.teamAId : match.teamBId) : null,
      }
    });

    return NextResponse.json({
      success: true,
      match: updatedMatch,
      matchCompleted
    });
  } catch (error: any) {
    console.error('[api/match/score]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

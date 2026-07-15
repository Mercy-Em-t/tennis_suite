import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createInitialScoreState, TennisScoreState } from '@/lib/engine/scoring';

export async function POST(request: Request) {
  try {
    const { matchId } = await request.json();

    if (!matchId) {
      return NextResponse.json({ error: 'Missing matchId' }, { status: 400 });
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const match = await prisma.match.findUnique({
      where: { id: matchId }
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    let currentState: TennisScoreState;
    try {
      currentState = match.scoreState ? JSON.parse(match.scoreState as string) : createInitialScoreState();
    } catch (e) {
      currentState = createInitialScoreState();
    }

    // Very rudimentary undo: Just reset current game points to 0 if they aren't already.
    // A true undo would require an event-sourcing history log which we can build in a future sprint.
    const newState = {
      ...currentState,
      pointsA: '0' as const,
      pointsB: '0' as const
    };

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        scoreState: JSON.stringify(newState),
        // If it was completed, undoing un-completes it
        status: match.status === 'COMPLETED' ? 'IN_PROGRESS' : match.status,
        winnerId: match.status === 'COMPLETED' ? null : match.winnerId,
      }
    });

    return NextResponse.json({
      success: true,
      match: updatedMatch
    });
  } catch (error: any) {
    console.error('[api/match/undo]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

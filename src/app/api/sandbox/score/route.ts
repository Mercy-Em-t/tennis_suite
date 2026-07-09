import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');

    if (!matchId) {
      return NextResponse.json({ error: 'matchId query parameter is required' }, { status: 400 });
    }

    // Fetch the match
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Modify the score (bypassing normal auth/engine just to test stability)
    // Parse current state
    const currentState = JSON.parse(match.scoreState || '{}');
    
    // Hardcode an increment to Team A's games for testing
    const newState = {
      ...currentState,
      gamesA: (currentState.gamesA || 0) + 1
    };

    // Update in database (this will also trigger the Prisma extension broadcast if configured)
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        scoreState: JSON.stringify(newState),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Match score modified successfully',
      match: updatedMatch
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

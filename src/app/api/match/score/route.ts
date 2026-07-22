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

    // Fetch the match metadata
    const match = await prisma.match.findUnique({
      where: { id: matchId }
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // 1. Get Live State from Redis (Buffer) or DB
    const { getLiveScoreState, saveLiveScoreState } = await import('@/lib/engine/match-buffer');
    const currentState = (await getLiveScoreState(matchId)) || createInitialScoreState();

    // 2. Advance the score using our Tennis Engine
    const { newState, matchCompleted, matchWinnerId } = advanceScore(currentState, scoringTeam as 'A' | 'B', DEFAULT_MATCH_FORMAT);

    let updatedMatch = match;

    if (matchCompleted) {
      // 3A. If match is over, commit final state and winner to Postgres instantly
      updatedMatch = await prisma.match.update({
        where: { id: matchId },
        data: {
          scoreState: JSON.stringify(newState),
          status: 'COMPLETED',
          winnerId: matchWinnerId === 'A' ? match.teamAId : match.teamBId,
        }
      });
      // Clean up Redis
      const { redis, isRedisConfigured } = await import('@/lib/redis');
      if (isRedisConfigured) {
        await redis.del(`match:${matchId}:state`);
        await redis.srem('system:dirty_matches', matchId);
      }
    } else {
      // 3B. If match is still ongoing, buffer the state in Redis ONLY
      await saveLiveScoreState(matchId, newState, false);
      updatedMatch = { ...match, scoreState: JSON.stringify(newState) };
    }

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

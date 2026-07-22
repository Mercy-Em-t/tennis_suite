import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis, isRedisConfigured } from '@/lib/redis';
import { TennisScoreState } from '@/lib/engine/scoring';

const DIRTY_MATCHES_SET = 'system:dirty_matches';

export async function GET(request: Request) {
  // 1. Basic security check (Optional: verify CRON_SECRET if on Vercel)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!isRedisConfigured) {
    return NextResponse.json({ success: true, message: 'Redis not configured, skipping flush.' });
  }

  try {
    // 2. Get all dirty matches
    const matchIds = await redis.smembers(DIRTY_MATCHES_SET);
    
    if (!matchIds || matchIds.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No dirty matches to flush.' });
    }

    // 3. Fetch states from Redis
    const pipeline = redis.pipeline();
    for (const id of matchIds) {
      pipeline.get<TennisScoreState>(`match:${id}:state`);
    }
    const states = await pipeline.exec<TennisScoreState[]>();

    // 4. Prepare bulk updates for Prisma
    const updatePromises = [];
    const successfulIds: string[] = [];

    for (let i = 0; i < matchIds.length; i++) {
      const matchId = matchIds[i];
      const state = states[i];
      
      if (state) {
        updatePromises.push(
          prisma.match.update({
            where: { id: matchId },
            data: { scoreState: JSON.stringify(state) }
          })
        );
        successfulIds.push(matchId);
      }
    }

    // 5. Execute transaction
    if (updatePromises.length > 0) {
      await prisma.$transaction(updatePromises);
    }

    // 6. Clean up the set
    if (successfulIds.length > 0) {
      await redis.srem(DIRTY_MATCHES_SET, ...successfulIds);
    }

    return NextResponse.json({ 
      success: true, 
      count: successfulIds.length,
      flushed: successfulIds
    });
  } catch (error: any) {
    console.error('[cron/flush-scores] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

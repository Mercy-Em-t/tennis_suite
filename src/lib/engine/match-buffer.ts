import { redis, isRedisConfigured } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { TennisScoreState } from '@/lib/engine/scoring';

const DIRTY_MATCHES_SET = 'system:dirty_matches';

/**
 * Retrieves the live score state. Checks Redis first, falls back to DB.
 */
export async function getLiveScoreState(matchId: string): Promise<TennisScoreState | null> {
  if (isRedisConfigured) {
    const cached = await redis.get<TennisScoreState>(`match:${matchId}:state`);
    if (cached) return cached;
  }

  // Fallback to DB
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (match?.scoreState) {
    try {
      return typeof match.scoreState === 'string' ? JSON.parse(match.scoreState) : match.scoreState;
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * Saves the live score state to Redis, queueing it for a batch DB update.
 * If Redis is not configured, it will write directly to DB.
 */
export async function saveLiveScoreState(
  matchId: string, 
  state: TennisScoreState, 
  isCompleted: boolean = false
) {
  // If match is finished OR Redis isn't set up, save straight to DB
  if (isCompleted || !isRedisConfigured) {
    await prisma.match.update({
      where: { id: matchId },
      data: { scoreState: JSON.stringify(state) }
    });
    
    if (isRedisConfigured) {
      // Clean up Redis since it's now permanently in DB
      await redis.del(`match:${matchId}:state`);
      await redis.srem(DIRTY_MATCHES_SET, matchId);
    }
    return;
  }

  // Otherwise, buffer it in Redis (Write-Behind)
  await redis.set(`match:${matchId}:state`, state);
  await redis.sadd(DIRTY_MATCHES_SET, matchId);
}

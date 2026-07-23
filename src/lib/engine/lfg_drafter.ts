import { prisma } from '@/lib/prisma';




/**
 * Pillar 30: "Looking for Group" (LFG) Matchmaking Engine
 * Algorithms to balance teams based on solo player stats.
 */
export async function generateBlindDraw(tournamentId: string) {
  const freeAgents = await prisma.freeAgent.findMany({
    where: { tournamentId, status: 'AVAILABLE' }
  });

  if (freeAgents.length < 2) return { error: 'Not enough players for a blind draw' };

  // Advanced Algorithm: Sort by skill level, then pair top seed with bottom seed
  const sorted = [...freeAgents].sort((a, b) => b.skillLevel - a.skillLevel);

  function isWithinThreshold(playerA: { skillLevel: number; createdAt: Date }, playerB: { skillLevel: number; createdAt: Date }): boolean {
    const diff = Math.abs(playerA.skillLevel - playerB.skillLevel);
    
    // Find who has been waiting longer
    const oldestWait = new Date(Math.min(playerA.createdAt.getTime(), playerB.createdAt.getTime()));
    const waitMinutes = (Date.now() - oldestWait.getTime()) / 60000;
    
    // Base threshold is 10%. Expand by 2% every 5 minutes in queue.
    const expandedThreshold = 0.10 + Math.floor(waitMinutes / 5) * 0.02;
    // Cap at 30% to prevent extreme mismatches
    const finalThresholdPct = Math.min(expandedThreshold, 0.30);
    
    const threshold = playerA.skillLevel * finalThresholdPct;
    return diff <= threshold;
  }

  const pairings = [];
  const unmatched = [];
  let left = 0;
  let right = sorted.length - 1;

  while (left < right) {
    if (isWithinThreshold(sorted[left], sorted[right])) {
      pairings.push({ player1: sorted[left], player2: sorted[right] });
    } else {
      unmatched.push(sorted[left], sorted[right]);
    }
    left++;
    right--;
  }

  // Update their status to DRAFTED
  for (const pair of pairings) {
    await prisma.freeAgent.updateMany({
      where: { id: { in: [pair.player1.id, pair.player2.id] } },
      data: { status: 'DRAFTED' }
    });
  }

  return { success: true, pairings };
}

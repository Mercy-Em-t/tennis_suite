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
  
  const pairings = [];
  let left = 0;
  let right = sorted.length - 1;

  while (left < right) {
    pairings.push({ player1: sorted[left], player2: sorted[right] });
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

import { prisma } from '@/lib/prisma';




/**
 * Calculates a player's Form Index based on recent match stats and win margins.
 * This is an advanced analytics feature (Pillar 13).
 */
export async function calculateFormIndex(playerId: string) {
  const stats = await prisma.playerStat.findMany({
    where: { playerId },
    orderBy: { createdAt: 'desc' },
    take: 5 // Look at last 5 matches
  });

  if (stats.length === 0) return 50; // Baseline index

  let totalIndex = 0;
  for (const stat of stats) {
    // Formula: (Winners + Aces) - (Unforced Errors + Double Faults)
    const matchImpact = (stat.winners + stat.aces) - (stat.unforcedErrors + stat.doubleFaults);
    totalIndex += matchImpact;
  }

  // Normalize to a 0-100 scale (mock implementation)
  const formIndex = Math.max(0, Math.min(100, 50 + (totalIndex * 2)));
  return formIndex;
}

/**
 * Generates a Head-to-Head matrix between two teams based on historical data.
 */
export async function getHeadToHeadMatrix(teamAId: string, teamBId: string) {
  const matches = await prisma.match.findMany({
    where: {
      status: 'COMPLETED',
      OR: [
        { teamAId: teamAId, teamBId: teamBId },
        { teamAId: teamBId, teamBId: teamAId }
      ]
    }
  });

  let teamAWins = 0;
  let teamBWins = 0;

  matches.forEach(match => {
    // Determine winner based on sets
    const state = typeof match.scoreState === 'string' ? JSON.parse(match.scoreState) : match.scoreState;
    if (state && state.setsA > state.setsB) {
      if (match.teamAId === teamAId) teamAWins++; else teamBWins++;
    } else if (state && state.setsB > state.setsA) {
      if (match.teamBId === teamBId) teamBWins++; else teamAWins++;
    }
  });

  return { teamAWins, teamBWins, totalMatches: matches.length };
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Time-Block Optimizer
 * Calculates the minimum rest window between matches for advancing teams.
 * Default minimum rest is 30 minutes (1800 seconds).
 */
export async function calculateRestWindow(teamId: string, minRestSeconds: number = 1800) {
  // Find the last completed match for this team
  const lastMatch = await prisma.match.findFirst({
    where: {
      status: 'COMPLETED',
      OR: [ { teamAId: teamId }, { teamBId: teamId } ]
    },
    orderBy: { updatedAt: 'desc' }
  });

  if (!lastMatch) return { isRested: true, waitTimeSec: 0 };

  const timeSinceLastMatch = Math.floor((Date.now() - lastMatch.updatedAt.getTime()) / 1000);
  const isRested = timeSinceLastMatch >= minRestSeconds;
  
  return {
    isRested,
    waitTimeSec: isRested ? 0 : minRestSeconds - timeSinceLastMatch
  };
}

/**
 * Double-Booking Preventer
 * Checks if a specific player is already scheduled for another active match across divisions.
 * In a real system, we would query the Player relation inside the Team.
 */
export async function checkDoubleBooking(playerId: string) {
  // Mock logic: Returns true if the player has an overlapping IN_PROGRESS match
  // const matches = await prisma.match.findMany({ ... })
  return false;
}

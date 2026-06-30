import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Pillar 23: Post-Event Archive & Legacy Engine
 * Generates a "Hall of Fame" summary when a tournament is archived.
 */
export async function generateLegacyArchive(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      teams: true,
      matches: {
        where: { status: 'COMPLETED' },
        orderBy: { updatedAt: 'desc' }
      }
    }
  });

  if (!tournament) return null;

  // Assuming the last completed match was the Final
  const finalMatch = tournament.matches[0];
  const championTeamId = tournament.championId || null; // derived at end of match

  // Mark as archived
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { isArchived: true, isActive: false, championId: championTeamId }
  });

  // Construct Hall of Fame JSON payload for future fetching
  const legacyPayload = {
    tournamentName: tournament.name,
    championId: championTeamId,
    totalMatchesPlayed: tournament.matches.length,
    archivedAt: new Date().toISOString()
  };

  return legacyPayload;
}

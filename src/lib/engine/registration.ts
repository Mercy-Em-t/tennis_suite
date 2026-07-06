import { prisma } from '@/lib/prisma';




/**
 * Handles "Blind Draw" registration.
 * Takes a list of individual players, shuffles them, pairs them up,
 * and creates Team (Franchise) records for a specific tournament.
 */
export async function generateBlindDrawTeams(tournamentId: string, playerIds: string[]) {
  if (playerIds.length % 2 !== 0) {
    throw new Error("Must have an even number of players for a doubles blind draw.")
  }

  // Shuffle players
  const shuffled = [...playerIds].sort(() => 0.5 - Math.random())

  const createdTeams = []

  // Pair them up and create Teams
  for (let i = 0; i < shuffled.length; i += 2) {
    const p1 = shuffled[i]
    const p2 = shuffled[i + 1]
    
    // In a real system, we'd have a Player -> Team join table. 
    // For now, we create the Team record with an auto-generated Franchise Name
    const team = await prisma.team.create({
      data: {
        tournamentId,
        franchiseName: `Team ${p1.substring(0, 4)}-${p2.substring(0, 4)}`,
      }
    })
    createdTeams.push(team)
  }

  return createdTeams
}

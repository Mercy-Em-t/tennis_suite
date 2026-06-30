import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Generates Round-Robin pools for a tournament.
 * Splits a list of teams into pools of a specified size, and generates
 * all required matches so every team plays each other once within their pool.
 */
export async function generateRoundRobinPools(tournamentId: string, poolSize: number = 4) {
  const teams = await prisma.team.findMany({
    where: { tournamentId }
  })

  if (teams.length < 2) return

  // Shuffle teams for random pool placement
  const shuffled = [...teams].sort(() => 0.5 - Math.random())
  const pools: typeof teams[] = []

  // Chunk into pools
  for (let i = 0; i < shuffled.length; i += poolSize) {
    pools.push(shuffled.slice(i, i + poolSize))
  }

  // Generate Matches for each pool
  for (const pool of pools) {
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        await prisma.match.create({
          data: {
            tournamentId,
            status: 'SCHEDULED',
            teamAId: pool[i].id,
            teamBId: pool[j].id,
          }
        })
      }
    }
  }
  
  return pools
}

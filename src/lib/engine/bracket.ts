import { prisma } from '@/lib/prisma';




/**
 * Automates bracket progression. Takes a completed match and slots the winner into the next node.
 */
export async function advanceWinner(matchId: string, winningTeamId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (!match || !match.nextMatchId) return

  const nextMatch = await prisma.match.findUnique({ where: { id: match.nextMatchId } })
  if (!nextMatch) return

  // Slot into the next match
  if (!nextMatch.teamAId) {
    await prisma.match.update({
      where: { id: nextMatch.id },
      data: { teamAId: winningTeamId }
    })
  } else if (!nextMatch.teamBId) {
    await prisma.match.update({
      where: { id: nextMatch.id },
      data: { teamBId: winningTeamId }
    })
  }
}

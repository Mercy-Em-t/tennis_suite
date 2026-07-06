import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server'




export async function GET() {
  const match = await prisma.match.findFirst({
    orderBy: { updatedAt: 'desc' },
    include: { teamA: true, teamB: true }
  })

  if (!match) return NextResponse.json({ error: 'No active match found' }, { status: 404 })

  return NextResponse.json({ 
    success: true, 
    matchId: match.id,
    scoreState: match.scoreState,
    teamA: match.teamA,
    teamB: match.teamB,
    status: match.status
  }, {
    headers: {
      'Cache-Control': 's-maxage=5, stale-while-revalidate=10' // Edge caching logic for Pillar 38
    }
  })
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';




export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const tournamentId = params.id;

    // Fetch Pools with standings
    const pools = await prisma.pool.findMany({
      where: { tournamentId },
      include: {
        poolTeams: {
          include: {
            team: true
          }
        }
      }
    });

    // Fetch all matches for the tournament (both pool and knockout)
    const matches = await prisma.match.findMany({
      where: { tournamentId },
      include: {
        teamA: true,
        teamB: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Separate Pool Matches from Knockouts
    const poolMatches = matches.filter(m => m.stage === 'POOL' || m.poolId !== null);
    const knockouts = matches.filter(m => m.stage !== 'POOL' && m.poolId === null);

    // Shape the Pools response
    const shapedPools = pools.map(pool => {
      // Find matches for this pool
      const thisPoolMatches = poolMatches.filter(m => m.poolId === pool.id);

      // Sort standings based on the cached stats or simple win/loss
      const standings = pool.poolTeams.map(pt => {
        let stats = { wins: 0, losses: 0, setsFor: 0, setsAgainst: 0 };
        try {
          if (pt.stats && pt.stats !== '{}') {
            stats = JSON.parse(pt.stats);
          }
        } catch (e) {}
        
        return {
          id: pt.id,
          teamId: pt.teamId,
          name: pt.team.franchiseName,
          logo: pt.team.logoUrl,
          stats: stats
        };
      }).sort((a, b) => b.stats.wins - a.stats.wins || (b.stats.setsFor - b.stats.setsAgainst) - (a.stats.setsFor - a.stats.setsAgainst));

      return {
        id: pool.id,
        name: pool.name,
        category: pool.category,
        standings,
        matches: thisPoolMatches.map(m => ({
          id: m.id,
          status: m.status,
          teamA: m.teamA?.franchiseName || m.placeholderA,
          teamB: m.teamB?.franchiseName || m.placeholderB,
          scoreState: m.scoreState,
          winnerId: m.winnerId
        }))
      };
    });

    // Shape Knockouts
    const shapedKnockouts = knockouts.map(m => ({
      id: m.id,
      stage: m.stage,
      status: m.status,
      category: m.category,
      teamA: m.teamA?.franchiseName || m.placeholderA,
      teamB: m.teamB?.franchiseName || m.placeholderB,
      teamAId: m.teamAId,
      teamBId: m.teamBId,
      scoreState: m.scoreState,
      winnerId: m.winnerId,
      nextMatchId: m.nextMatchId
    }));

    // Extract all unique categories
    const allCategories = new Set<string>();
    pools.forEach(p => { if (p.category) allCategories.add(p.category); });
    knockouts.forEach(k => { if (k.category) allCategories.add(k.category); });
    const categories = Array.from(allCategories).sort();

    return NextResponse.json({
      success: true,
      tournamentId,
      categories,
      pools: shapedPools,
      knockouts: shapedKnockouts
    });

  } catch (error) {
    console.error('[bracket-api]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

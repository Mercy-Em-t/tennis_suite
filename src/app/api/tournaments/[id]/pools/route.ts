import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';



export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(['HOST', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        pools: {
          include: {
            poolTeams: {
              include: {
                team: true
              },
              orderBy: { seed: 'asc' }
            }
          },
          orderBy: { name: 'asc' }
        },
        teams: true
      }
    });

    if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });

    // Determine unassigned teams (teams that don't have a PoolTeam mapping for their categories)
    // For V1, we just return all teams, the client can filter out ones already in a pool.
    return NextResponse.json({ success: true, tournament });
  } catch (error: any) {
    logger.error('[pools/GET] Failed', {}, error);
    return NextResponse.json({ error: 'Failed to fetch pools' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(['HOST', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { teams: true }
    });

    if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    if (tournament.poolGenerationCount >= 3) {
      return NextResponse.json({ error: 'Auto-generation limit reached (Max 3).' }, { status: 400 });
    }

    const { category, numPools } = await request.json();
    if (!category || !numPools || numPools < 1) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Filter teams that belong to this category
    const categoryTeams = tournament.teams.filter(t => {
      try {
        const cats = JSON.parse(t.categories || '[]');
        return cats.includes(category);
      } catch (e) {
        return false;
      }
    });

    if (categoryTeams.length === 0) {
      return NextResponse.json({ error: 'No teams in this category' }, { status: 400 });
    }

    // Hybrid Serpentine Seed (1, 2, 3, 4, 4, 3, 2, 1)
    // Sort by points/ranking if available, otherwise fallback to random
    let sortedTeams = [...categoryTeams];
    const hasPoints = categoryTeams.some(t => typeof (t as any).points === 'number');
    
    if (hasPoints) {
      sortedTeams.sort((a: any, b: any) => (b.points || 0) - (a.points || 0));
    } else {
      sortedTeams.sort(() => 0.5 - Math.random());
    }

    const poolsMap: Record<number, any[]> = {};
    for (let i = 0; i < numPools; i++) poolsMap[i] = [];

    let poolIndex = 0;
    let direction = 1;

    for (let i = 0; i < sortedTeams.length; i++) {
      poolsMap[poolIndex].push(sortedTeams[i]);
      
      poolIndex += direction;
      if (poolIndex >= numPools) {
        poolIndex = numPools - 1;
        direction = -1;
      } else if (poolIndex < 0) {
        poolIndex = 0;
        direction = 1;
      }
    }

    // Persist to DB atomically
    await prisma.$transaction(async (tx) => {
      // Clean existing pools for this category first
      await tx.poolTeam.deleteMany({
        where: { pool: { tournamentId: id, category } }
      });
      await tx.pool.deleteMany({
        where: { tournamentId: id, category }
      });

      // Create new pools
      for (let i = 0; i < numPools; i++) {
        const poolName = `Pool ${String.fromCharCode(65 + i)}`; // Pool A, Pool B...
        const createdPool = await tx.pool.create({
          data: {
            name: poolName,
            tournamentId: id,
            category,
            versionId: 'v1.0'
          }
        });

        // Add teams
        const teamsToInsert = poolsMap[i].map((team, index) => ({
          poolId: createdPool.id,
          teamId: team.id,
          seed: index + 1
        }));
        
        if (teamsToInsert.length > 0) {
          await tx.poolTeam.createMany({ data: teamsToInsert });
        }
      }

      // Increment generation count
      await tx.tournament.update({
        where: { id },
        data: { poolGenerationCount: tournament.poolGenerationCount + 1 }
      });
    });

    logger.info('Pools generated', { tournamentId: id, category, count: tournament.poolGenerationCount + 1 });
    return NextResponse.json({ success: true, message: 'Pools generated successfully' });
  } catch (error: any) {
    logger.error('[pools/POST] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}

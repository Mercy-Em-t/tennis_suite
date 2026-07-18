import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireTournamentAccess } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';



export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await requireTournamentAccess(id, ['REFEREE']);
  if (authResult instanceof NextResponse) return authResult;

  try {
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
  const { id } = await params;
  const authResult = await requireTournamentAccess(id, ['REFEREE']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { teams: true }
    });

    if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    if (tournament.poolGenerationCount >= 5) {
      return NextResponse.json({ error: 'Auto-generation limit reached (Max 5).' }, { status: 400 });
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

    // Hybrid Serpentine Seed
    let sortedTeams = [...categoryTeams];
    
    // Sort by skillLevel / globalXp to implement Seeding Protocol
    sortedTeams.sort((a: any, b: any) => {
      // Assuming team has globalXp or skillLevel (we might need to fetch user data if it's not present)
      // Since Team doesn't have points in schema, we will sort by createdAt for now to simulate seeding if no points exist
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

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

    // Determine next version ID
    const existingPools = await prisma.pool.findMany({
      where: { tournamentId: id, category }
    });
    let nextVersionId = 'v1.0';
    if (existingPools.length > 0) {
      const maxV = Math.max(...existingPools.map(p => parseFloat(p.versionId.replace('v', '')) || 0));
      nextVersionId = `v${(maxV + 1).toFixed(1)}`;
    }

    // Identify role to determine default status
    const isReferee = authResult.role === 'REFEREE' || authResult.staffRole === 'REFEREE';
    const initialStatus = isReferee ? 'REFEREE_DRAFT' : 'ACTIVE';

    // Persist to DB atomically
    await prisma.$transaction(async (tx) => {
      // Create new pools
      for (let i = 0; i < numPools; i++) {
        const poolName = `Pool ${String.fromCharCode(65 + i)}`; // Pool A, Pool B...
        const createdPool = await tx.pool.create({
          data: {
            name: poolName,
            tournamentId: id,
            category,
            versionId: nextVersionId,
            status: initialStatus,
            isPublished: false
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

    logger.info('Pools generated', { tournamentId: id, category, count: tournament.poolGenerationCount + 1, status: initialStatus });
    return NextResponse.json({ success: true, message: 'Pools generated successfully' });
  } catch (error: any) {
    logger.error('[pools/POST] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}

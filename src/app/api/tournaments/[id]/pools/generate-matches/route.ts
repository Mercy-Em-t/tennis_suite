import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(['HOST', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const { category, versionId } = await request.json();

    if (!category || !versionId) {
      return NextResponse.json({ error: 'Missing category or versionId' }, { status: 400 });
    }

    const pools = await prisma.pool.findMany({
      where: { tournamentId: id, category, versionId },
      include: {
        poolTeams: {
          orderBy: { seed: 'asc' }
        }
      }
    });

    if (pools.length === 0) {
      return NextResponse.json({ error: 'No pools found' }, { status: 404 });
    }

    if (!pools[0].isPublished) {
      return NextResponse.json({ error: 'Cannot generate matches for an unpublished pool snapshot.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      for (const pool of pools) {
        // Clear existing POOL matches for this pool to allow regeneration if needed
        await tx.match.deleteMany({
          where: { poolId: pool.id, stage: 'POOL' }
        });

        const teams = pool.poolTeams.map(pt => pt.teamId);
        const matchesToCreate = [];

        // Round Robin Matchups
        for (let i = 0; i < teams.length; i++) {
          for (let j = i + 1; j < teams.length; j++) {
            matchesToCreate.push({
              tournamentId: id,
              poolId: pool.id,
              category: pool.category,
              stage: 'POOL',
              status: 'SCHEDULED',
              teamAId: teams[i],
              teamBId: teams[j],
              scoreState: JSON.stringify({ setsA: 0, setsB: 0, gamesA: 0, gamesB: 0, pointsA: "0", pointsB: "0" })
            });
          }
        }

        if (matchesToCreate.length > 0) {
          await tx.match.createMany({
            data: matchesToCreate
          });
        }
      }
    });

    logger.info('Pool matches generated', { tournamentId: id, category, versionId });
    return NextResponse.json({ success: true, message: 'Pool Matches Generated' });
  } catch (error: any) {
    logger.error('[pools/generate-matches/POST] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Match Generation failed' }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';



export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(['HOST', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const body = await request.json();
    const { stage, category } = body;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        pools: {
          where: category === 'All' ? undefined : { category },
          include: { poolTeams: true }
        }
      }
    });

    if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      // Set the tournament's current stage
      await tx.tournament.update({
        where: { id },
        data: { currentStage: stage }
      });

      if (stage === 'POOL') {
        // We no longer blindly delete PENDING matches, to preserve manually queued/ordered items.
        // Instead, we only generate MISSING matches for COMMITTED pools.
        
        for (const pool of tournament.pools) {
          if (pool.status !== 'COMMITTED') continue; // Only process locked pools

          // Fetch existing matches for this pool
          const existingMatches = await tx.match.findMany({
            where: { tournamentId: id, stage: 'POOL', poolId: pool.id }
          });

          // Build a set of existing matchups to prevent duplicates (Team A vs Team B)
          const existingPairs = new Set(existingMatches.map(m => {
            return [m.teamAId, m.teamBId].sort().join('-');
          }));

          const teams = pool.poolTeams.map(pt => pt.teamId);
          for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
              const pairKey = [teams[i], teams[j]].sort().join('-');
              
              if (!existingPairs.has(pairKey)) {
                await tx.match.create({
                  data: {
                    tournamentId: id,
                    stage: 'POOL',
                    poolId: pool.id,
                    status: 'PENDING',
                    teamAId: teams[i],
                    teamBId: teams[j]
                  }
                });
              }
            }
          }
        }
      } else if (stage === 'KNOCKOUTS') {
        // Generate placeholder knockouts. e.g. Pool A 1 vs Pool B 2
        await tx.match.create({
          data: {
            tournamentId: id,
            stage: 'KNOCKOUTS',
            status: 'PENDING',
            placeholderA: 'Pool A Pos 1',
            placeholderB: 'Pool B Pos 2'
          }
        });
        await tx.match.create({
          data: {
            tournamentId: id,
            stage: 'KNOCKOUTS',
            status: 'PENDING',
            placeholderA: 'Pool B Pos 1',
            placeholderB: 'Pool A Pos 2'
          }
        });
      }
    });

    logger.info('Matches generated', { tournamentId: id, stage });
    return NextResponse.json({ success: true });

  } catch (error: any) {
    logger.error('[matches/generate/POST] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}

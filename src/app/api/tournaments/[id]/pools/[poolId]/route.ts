import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireTournamentAccess } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';

export async function DELETE(request: Request, props: { params: Promise<{ id: string, poolId: string }> }) {
  try {
    const params = await props.params;
    const authResult = await requireTournamentAccess(params.id, ['REFEREE']);
    if (authResult instanceof NextResponse) return authResult;

    // Fetch the pool to ensure it exists and check teams
    const pool = await prisma.pool.findUnique({
      where: { id: params.poolId },
      include: { poolTeams: true }
    });

    if (!pool) return NextResponse.json({ error: 'Pool not found' }, { status: 404 });

    if (pool.poolTeams.length > 0) {
      return NextResponse.json({ error: 'Cannot delete a pool that has players inside. Move them out first.' }, { status: 400 });
    }

    // Delete the pool
    await prisma.pool.delete({
      where: { id: params.poolId }
    });

    // Rename the remaining pools sequentially to A, B, C...
    const remainingPools = await prisma.pool.findMany({
      where: { tournamentId: params.id, category: pool.category, versionId: pool.versionId },
      orderBy: { name: 'asc' }
    });

    await prisma.$transaction(
      remainingPools.map((p, index) => 
        prisma.pool.update({
          where: { id: p.id },
          data: { name: `Pool ${String.fromCharCode(65 + index)}` }
        })
      )
    );

    logger.info('Pool deleted and renamed successfully', { tournamentId: params.id, poolId: params.poolId });
    return NextResponse.json({ success: true, message: 'Pool deleted.' });
  } catch (error) {
    console.error('[pools/poolId/DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete pool' }, { status: 500 });
  }
}

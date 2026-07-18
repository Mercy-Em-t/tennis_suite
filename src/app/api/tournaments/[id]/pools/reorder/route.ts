import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(['HOST', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const { poolId, poolTeams } = await request.json();

    if (!poolId || !poolTeams || !Array.isArray(poolTeams)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Verify pool belongs to tournament
    const pool = await prisma.pool.findFirst({
      where: { id: poolId, tournamentId: id }
    });

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    if (pool.status === 'LOCKED' || pool.isPublished) {
       return NextResponse.json({ error: 'Cannot modify a published pool snapshot.' }, { status: 403 });
    }

    // Persist reorder atomically
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < poolTeams.length; i++) {
        await tx.poolTeam.update({
          where: { id: poolTeams[i] },
          data: { seed: i + 1 }
        });
      }
    });

    return NextResponse.json({ success: true, message: 'Reordered successfully' });
  } catch (error: any) {
    logger.error('[pools/reorder] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Reorder failed' }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';



export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(['HOST', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const body = await request.json();
    const { poolTeamId, sourcePoolId, targetPoolId, newSeed } = body;

    if (!poolTeamId || !targetPoolId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. If moving to a new pool, update poolTeam mapping
      if (sourcePoolId !== targetPoolId) {
        await tx.poolTeam.update({
          where: { id: poolTeamId },
          data: { poolId: targetPoolId }
        });
      }

      // 2. Increment versionId on both pools to represent structure change
      const incrementVersion = (current: string) => {
        const v = parseFloat(current.replace('v', ''));
        return `v${(v + 0.1).toFixed(1)}`;
      };

      if (sourcePoolId) {
        const sp = await tx.pool.findFirst({ where: { id: sourcePoolId, tournamentId: id } });
        if (sp) await tx.pool.updateMany({ where: { id: sourcePoolId, tournamentId: id }, data: { versionId: incrementVersion(sp.versionId) } });
      }

      if (sourcePoolId !== targetPoolId) {
        const tp = await tx.pool.findFirst({ where: { id: targetPoolId, tournamentId: id } });
        if (tp) await tx.pool.updateMany({ where: { id: targetPoolId, tournamentId: id }, data: { versionId: incrementVersion(tp.versionId) } });
      }

      // 3. We could also re-order seeds here if required (advanced implementation)
      // For V1, the order will just be maintained by the UI and the seed field can be patched in bulk if needed.
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('[pools/move/PATCH] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Move failed' }, { status: 500 });
  }
}

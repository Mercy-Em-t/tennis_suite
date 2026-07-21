import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireTournamentAccess } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const authResult = await requireTournamentAccess(params.id, ['REFEREE']);
    if (authResult instanceof NextResponse) return authResult;

    const { category, versionId } = await request.json();
    if (!category || !versionId) return NextResponse.json({ error: 'Missing category or versionId' }, { status: 400 });

    const existingPools = await prisma.pool.findMany({
      where: { tournamentId: params.id, category, versionId },
      orderBy: { name: 'asc' }
    });

    const numPools = existingPools.length;
    // Next letter calculation
    const poolName = `Pool ${String.fromCharCode(65 + numPools)}`;

    const isReferee = authResult.role === 'REFEREE' || authResult.staffRole === 'REFEREE';
    const status = isReferee ? 'REFEREE_DRAFT' : 'ACTIVE';

    const newPool = await prisma.pool.create({
      data: {
        name: poolName,
        tournamentId: params.id,
        category,
        versionId,
        status,
        isPublished: false
      }
    });

    logger.info('Pool appended manually', { tournamentId: params.id, poolName });
    return NextResponse.json({ success: true, pool: newPool });
  } catch (error) {
    console.error('[pools/add/POST]', error);
    return NextResponse.json({ error: 'Failed to add pool' }, { status: 500 });
  }
}

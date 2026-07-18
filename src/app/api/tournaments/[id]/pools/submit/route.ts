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
    if (!category || !versionId) {
      return NextResponse.json({ error: 'Missing category or versionId' }, { status: 400 });
    }

    // Update all pools in this category/version from REFEREE_DRAFT to AWAITING_APPROVAL
    const result = await prisma.pool.updateMany({
      where: {
        tournamentId: params.id,
        category,
        versionId,
        status: 'REFEREE_DRAFT'
      },
      data: {
        status: 'AWAITING_APPROVAL'
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'No draft pools found to submit' }, { status: 404 });
    }

    logger.info('Referee submitted pools for approval', { tournamentId: params.id, category, versionId });
    return NextResponse.json({ success: true, message: 'Draw submitted for host approval.' });
  } catch (error: any) {
    logger.error('[pools/submit/POST] Failed', {}, error);
    return NextResponse.json({ error: 'Failed to submit draw' }, { status: 500 });
  }
}

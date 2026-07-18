import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    // Only HOST or ADMIN can reject
    const authResult = await requireAuth(['HOST', 'ADMIN']);
    if (authResult instanceof NextResponse) return authResult;

    const { category, versionId } = await request.json();
    if (!category || !versionId) {
      return NextResponse.json({ error: 'Missing category or versionId' }, { status: 400 });
    }

    // Update all pools in this category/version from AWAITING_APPROVAL back to REFEREE_DRAFT
    const result = await prisma.pool.updateMany({
      where: {
        tournamentId: params.id,
        category,
        versionId,
        status: 'AWAITING_APPROVAL'
      },
      data: {
        status: 'REFEREE_DRAFT'
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'No pools awaiting approval found.' }, { status: 404 });
    }

    logger.info('Host rejected referee pools', { tournamentId: params.id, category, versionId });
    return NextResponse.json({ success: true, message: 'Draw rejected and sent back to referee.' });
  } catch (error: any) {
    logger.error('[pools/reject/POST] Failed', {}, error);
    return NextResponse.json({ error: 'Failed to reject draw' }, { status: 500 });
  }
}

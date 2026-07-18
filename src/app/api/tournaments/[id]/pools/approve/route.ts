import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    // Only HOST or ADMIN can approve
    const authResult = await requireAuth(['HOST', 'ADMIN']);
    if (authResult instanceof NextResponse) return authResult;

    const { category, versionId } = await request.json();
    if (!category || !versionId) {
      return NextResponse.json({ error: 'Missing category or versionId' }, { status: 400 });
    }

    // Update all pools in this category/version from AWAITING_APPROVAL to ACTIVE
    const result = await prisma.pool.updateMany({
      where: {
        tournamentId: params.id,
        category,
        versionId,
        status: 'AWAITING_APPROVAL'
      },
      data: {
        status: 'ACTIVE' // Host has approved it, it's now in their standard active workspace
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'No pools awaiting approval found.' }, { status: 404 });
    }

    logger.info('Host approved referee pools', { tournamentId: params.id, category, versionId });
    return NextResponse.json({ success: true, message: 'Draw approved and activated in workspace.' });
  } catch (error: any) {
    logger.error('[pools/approve/POST] Failed', {}, error);
    return NextResponse.json({ error: 'Failed to approve draw' }, { status: 500 });
  }
}

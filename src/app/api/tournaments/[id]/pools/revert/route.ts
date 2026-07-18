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
      where: { tournamentId: id, category, versionId }
    });

    if (pools.length === 0) {
      return NextResponse.json({ error: 'No pools found to revert' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.pool.updateMany({
        where: { tournamentId: id, category, versionId },
        data: { isPublished: false, status: 'ACTIVE' }
      });
    });

    logger.info('Pool snapshot reverted', { tournamentId: id, category, versionId });
    return NextResponse.json({ success: true, message: 'Reverted successfully' });
  } catch (error: any) {
    logger.error('[pools/revert/POST] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Revert failed' }, { status: 500 });
  }
}

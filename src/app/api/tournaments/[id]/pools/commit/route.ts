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

    const tournament = await prisma.tournament.findUnique({
      where: { id }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.pool.updateMany({
        where: { tournamentId: id, category, versionId },
        data: { status: 'COMMITTED' }
      });
    });

    logger.info('Pool snapshot committed (No emails dispatched)', { tournamentId: id, category, versionId });
    return NextResponse.json({ success: true, message: 'Committed successfully. (Emails must be dispatched separately)' });
  } catch (error: any) {
    logger.error('[pools/commit/POST] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Commit failed' }, { status: 500 });
  }
}

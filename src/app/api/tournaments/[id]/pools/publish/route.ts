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

    const poolsToPublish = await prisma.pool.findMany({
      where: { tournamentId: id, category, versionId }
    });

    if (poolsToPublish.length === 0) {
      return NextResponse.json({ error: 'No pools found to publish' }, { status: 404 });
    }

    // Unpublish other versions for this category?
    // We could leave them, but maybe only one active published version per category is safe.
    await prisma.$transaction(async (tx) => {
      // First, unlock all pools for this category
      await tx.pool.updateMany({
        where: { tournamentId: id, category },
        data: { isPublished: false, status: 'ACTIVE' }
      });

      // Then lock and publish the selected version
      await tx.pool.updateMany({
        where: { tournamentId: id, category, versionId },
        data: { isPublished: true, status: 'PUBLISHED' }
      });
    });

    logger.info('Pool snapshot published', { tournamentId: id, category, versionId });
    return NextResponse.json({ success: true, message: 'Published successfully' });
  } catch (error: any) {
    logger.error('[pools/publish/POST] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Publish failed' }, { status: 500 });
  }
}

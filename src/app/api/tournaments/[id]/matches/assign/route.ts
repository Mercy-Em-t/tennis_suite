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
    const { matchId, courtId, newOrderIndex } = body;

    if (!matchId) return NextResponse.json({ error: 'Match ID required' }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      // Find the match
      const match = await tx.match.findFirst({ where: { id: matchId, tournamentId: id } });
      if (!match) throw new Error('Match not found or unauthorized');

      // Update match
      await tx.match.update({
        where: { id: matchId },
        data: {
          courtId: courtId || null,
          orderIndex: newOrderIndex ?? null
        }
      });
      
      // In a robust production environment, we'd shift the orderIndex of other matches in the queue
      // For V1, the frontend sends explicit order updates or we rely on the list's inherent sort.
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('[matches/assign/PATCH] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Assignment failed' }, { status: 500 });
  }
}

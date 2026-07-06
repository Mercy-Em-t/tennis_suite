import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireTournamentAccess } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';

export async function POST(request: Request, { params }: { params: Promise<{ id: string, matchId: string }> }) {
  try {
    const { id, matchId } = await params;
    const authResult = await requireTournamentAccess(id, ['HOST', 'REFEREE']);
    if (authResult instanceof NextResponse) return authResult;
    
    const { id: userId } = (authResult as any);
    const { action, reason } = await request.json(); // action = 'PAUSE' | 'RESUME'

    if (!['PAUSE', 'RESUME'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({ where: { id: matchId } });
      if (!match) throw new Error("Match not found");

      if (action === 'PAUSE') {
        if (match.status === 'COMPLETED') throw new Error("Cannot pause a completed match.");
        await tx.match.update({
          where: { id: matchId },
          data: {
            status: 'REQUIRES_INTERVENTION',
            pauseReason: reason || 'MEDICAL_TIMEOUT'
          }
        });

        await tx.auditLog.create({
          data: {
            matchId,
            action: 'MATCH_PAUSED',
            details: `Match paused by referee. Reason: ${reason || 'MEDICAL_TIMEOUT'}`,
            userId
          }
        });
      } else if (action === 'RESUME') {
        if (match.status !== 'REQUIRES_INTERVENTION') throw new Error("Match is not paused.");
        
        await tx.match.update({
          where: { id: matchId },
          data: {
            status: 'IN_PROGRESS',
            pauseReason: null
          }
        });

        await tx.auditLog.create({
          data: {
            matchId,
            action: 'MATCH_RESUMED',
            details: `Match resumed by referee.`,
            userId
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('[matches/intervention/POST] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Intervention failed' }, { status: 500 });
  }
}

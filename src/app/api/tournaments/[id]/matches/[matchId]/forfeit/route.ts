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
    const { forfeitingTeamId, reason } = await request.json();

    if (!forfeitingTeamId) {
      return NextResponse.json({ error: 'Missing forfeitingTeamId' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const match = await tx.match.findFirst({ where: { id: matchId, tournamentId: id } });
      if (!match) throw new Error("Match not found or unauthorized");
      if (match.status === 'COMPLETED') throw new Error("Match is already completed.");

      const winnerId = match.teamAId === forfeitingTeamId ? match.teamBId : match.teamAId;
      if (!winnerId) throw new Error("Cannot determine winner.");

      // 1. Update Match to Completed
      await tx.match.update({
        where: { id: matchId },
        data: {
          status: 'COMPLETED',
          winnerId: winnerId,
          completedAt: new Date()
        }
      });

      // 2. Audit Log
      await tx.auditLog.create({
        data: {
          matchId,
          action: 'MATCH_FORFEIT',
          details: `Team ${forfeitingTeamId} forfeited. Reason: ${reason || 'WALKOVER'}. Winner: ${winnerId}`,
          userId
        }
      });

      // 3. Pool progression trigger (if it's a pool match)
      if (match.poolId) {
        const pool = await tx.pool.findFirst({ where: { id: match.poolId, tournamentId: id } });
        const poolMatches = await tx.match.findMany({ where: { poolId: match.poolId } });
        // Set this match as completed in memory for the check
        const updatedPoolMatches = poolMatches.map(m => m.id === matchId ? { ...m, status: 'COMPLETED', winnerId } : m);
        
        const allCompleted = updatedPoolMatches.every(m => m.status === 'COMPLETED');
        if (allCompleted && pool && pool.status !== 'LOCKED') {
          await tx.pool.updateMany({ where: { id: match.poolId, tournamentId: id }, data: { status: 'LOCKED' } });
          // Note: Full progression logic (standings calculation and knockout injection) 
          // usually happens in the standard score engine. 
          // For a true robust system, we would abstract the Pool Lockdown logic into a shared service.
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('[matches/forfeit/POST] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Forfeit failed' }, { status: 500 });
  }
}

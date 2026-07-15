import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';



export async function POST(request: Request, { params }: { params: Promise<{ id: string, teamId: string }> }) {
  const authResult = await requireAuth(['HOST', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id, teamId } = await params;
    const { hostId } = (authResult as any).user;

    await prisma.$transaction(async (tx) => {
      // 1. Mark Team as WITHDRAWN
      const result = await tx.team.updateMany({
        where: { id: teamId, tournamentId: id },
        data: { status: 'WITHDRAWN' }
      });
      if (result.count === 0) throw new Error("Team not found or unauthorized");

      // 2. Find all upcoming matches for this team
      const upcomingMatches = await tx.match.findMany({
        where: {
          tournamentId: id,
          OR: [
            { teamAId: teamId },
            { teamBId: teamId }
          ],
          status: { in: ['PENDING', 'SCHEDULED'] }
        }
      });

      // 3. Mark matches as REQUIRES_INTERVENTION
      for (const match of upcomingMatches) {
        await tx.match.update({
          where: { id: match.id },
          data: {
            status: 'REQUIRES_INTERVENTION',
            interventionReason: 'Team Withdrawal',
            // Remove them from court queues to prevent them from being played accidentally
            courtId: null,
            orderIndex: null
          }
        });

        // Log the audit
        await tx.auditLog.create({
          data: {
            matchId: match.id,
            action: 'MATCH_PAUSED',
            details: `Team ${teamId} withdrew. Match locked for intervention.`,
            userId: hostId || 'SYSTEM'
          }
        });
      }
    });

    logger.info(`Team ${teamId} withdrew from tournament ${id}. Affected matches paused.`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('[teams/withdraw/POST] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Withdrawal failed' }, { status: 500 });
  }
}

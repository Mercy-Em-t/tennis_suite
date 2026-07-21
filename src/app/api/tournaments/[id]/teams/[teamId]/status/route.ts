import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function PATCH(request: Request, props: { params: Promise<{ id: string, teamId: string }> }) {
  try {
    const params = await props.params;
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.roles.some(r => ['HOST', 'ADMIN'].includes(r))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status } = await request.json(); // 'WITHDRAWN' or 'DISQUALIFIED'

    if (!['WITHDRAWN', 'DISQUALIFIED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update team status
      await tx.team.update({
        where: { id: params.teamId },
        data: { status }
      });

      // 2. Cascade: POOL matches -> Walkovers
      const pendingPoolMatches = await tx.match.findMany({
        where: {
          tournamentId: params.id,
          stage: 'POOL',
          status: { in: ['PENDING', 'SCHEDULED'] },
          OR: [
            { teamAId: params.teamId },
            { teamBId: params.teamId }
          ]
        }
      });

      for (const m of pendingPoolMatches) {
        // Award walkover to the other team
        const winnerId = m.teamAId === params.teamId ? m.teamBId : m.teamAId;
        if (winnerId) {
          const scoreState = { walkover: true, setsA: m.teamAId === winnerId ? 2 : 0, setsB: m.teamBId === winnerId ? 2 : 0, gamesA: m.teamAId === winnerId ? 12 : 0, gamesB: m.teamBId === winnerId ? 12 : 0 };
          await tx.match.update({
            where: { id: m.id },
            data: {
              status: 'COMPLETED',
              winnerId,
              scoreState: JSON.stringify(scoreState),
              completedAt: new Date()
            }
          });
        }
      }

      // 3. Cascade: KNOCKOUT matches -> REQUIRES_INTERVENTION
      const pendingKnockoutMatches = await tx.match.findMany({
        where: {
          tournamentId: params.id,
          stage: { not: 'POOL' }, // KNOCKOUTS, SEMI, FINAL
          status: { in: ['PENDING', 'SCHEDULED'] },
          OR: [
            { teamAId: params.teamId },
            { teamBId: params.teamId }
          ]
        }
      });

      for (const m of pendingKnockoutMatches) {
        await tx.match.update({
          where: { id: m.id },
          data: {
            status: 'REQUIRES_INTERVENTION',
            interventionReason: `Player ${status.toLowerCase()}`
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('[teams/status/PATCH] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Failed to update team status' }, { status: 500 });
  }
}

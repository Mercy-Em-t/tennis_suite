import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireTournamentAccess } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';



export async function POST(request: Request, { params }: { params: Promise<{ id: string, matchId: string }> }) {
  try {
    const { id, matchId } = await params;
    const authResult = await requireTournamentAccess(id, ['REFEREE']);
    if (authResult instanceof NextResponse) return authResult;
    
    const { id: userId } = (authResult as any);
    const { replacementTeamId, originalTeamId } = await request.json();

    if (!replacementTeamId || !originalTeamId) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      const match = await tx.match.findFirst({ where: { id: matchId, tournamentId: id } });
      if (!match) throw new Error("Match not found or unauthorized");

      // Replace the team
      const updateData: any = {
        status: 'PENDING',
        interventionReason: null
      };

      if (match.teamAId === originalTeamId) updateData.teamAId = replacementTeamId;
      if (match.teamBId === originalTeamId) updateData.teamBId = replacementTeamId;

      await tx.match.update({
        where: { id: matchId },
        data: updateData
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          matchId,
          action: 'MANUAL_SUBSTITUTION',
          details: `Host overrode withdrawal of team ${originalTeamId}. Substituted in team ${replacementTeamId}.`,
          userId: userId || 'SYSTEM'
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('[matches/override/POST] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Override failed' }, { status: 500 });
  }
}

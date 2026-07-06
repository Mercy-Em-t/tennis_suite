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
    const { incidentType, description, targetTeamId } = await request.json();

    if (!incidentType || !description) {
      return NextResponse.json({ error: 'Missing incident details' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Create Incident Report
      await tx.incidentReport.create({
        data: {
          matchId,
          reportedBy: userId,
          incidentType,
          description: targetTeamId ? `[Team ${targetTeamId}] ${description}` : description,
        }
      });

      // 2. Audit Log
      await tx.auditLog.create({
        data: {
          matchId,
          action: 'INCIDENT_REPORTED',
          details: `Type: ${incidentType}. Description: ${description}`,
          userId
        }
      });
      
      // If incidentType is CODE_VIOLATION and there is a targetTeamId, we might deduct trustScore of the players in that team
      if (incidentType === 'CODE_VIOLATION' && targetTeamId) {
        const team = await tx.team.findUnique({
          where: { id: targetTeamId },
          include: { players: true }
        });
        if (team) {
          for (const player of team.players) {
            await tx.user.update({
              where: { id: player.id },
              data: { trustScore: { decrement: 15 } }
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('[matches/incident/POST] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Incident report failed' }, { status: 500 });
  }
}

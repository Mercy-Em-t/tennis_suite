import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  const authResult = await requireAuth(['REFEREE', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const user = authResult as { id: string, role: string };

    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    // Find all tournaments where this user is an APPROVED Referee
    const staffRecords = await prisma.staff.findMany({
      where: {
        userId: user.id,
        role: 'REFEREE',
        status: 'APPROVED',
        ...(tournamentId ? { tournamentId } : {})
      },
      select: { tournamentId: true }
    });

    const tournamentIds = staffRecords.map(s => s.tournamentId);

    // Fetch the full tournaments, their courts, and matches on those courts
    const tournaments = await prisma.tournament.findMany({
      where: { id: { in: tournamentIds } },
      include: {
        matches: {
          where: { courtId: null, status: { in: ['PENDING', 'SCHEDULED'] } },
          include: { teamA: true, teamB: true },
          orderBy: { createdAt: 'asc' }
        },
        courts: {
          include: {
            matches: {
              where: { status: { notIn: ['COMPLETED', 'PENDING'] } }, // Only actionable matches (SCHEDULED, IN_PROGRESS, PAUSED)
              include: { teamA: true, teamB: true },
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, tournaments });
  } catch (error: any) {
    logger.error('[referee/hub/GET] Failed', {}, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

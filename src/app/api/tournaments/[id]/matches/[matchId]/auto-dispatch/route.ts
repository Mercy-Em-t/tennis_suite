import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireTournamentAccess } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';



export async function POST(request: Request, { params }: { params: Promise<{ id: string, matchId: string }> }) {
  try {
    const { id, matchId } = await params;

    const authResult = await requireTournamentAccess(id, ['REFEREE']);
    if (authResult instanceof NextResponse) return authResult;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get all courts for this tournament
      const courts = await tx.court.findMany({
        where: { tournamentId: id }
      });

      if (courts.length === 0) {
        throw new Error("No courts available in this tournament.");
      }

      // 2. Get all matches currently assigned to courts to calculate queue lengths
      const activeMatches = await tx.match.findMany({
        where: { 
          tournamentId: id,
          courtId: { not: null },
          status: { in: ['SCHEDULED', 'IN_PROGRESS', 'DISPUTED', 'PAUSED'] } // Matches taking up space
        }
      });

      // 3. Calculate queue length per court
      const queueLengths = new Map<string, number>();
      courts.forEach(c => queueLengths.set(c.id, 0));
      
      activeMatches.forEach(m => {
        if (m.courtId) {
          queueLengths.set(m.courtId, (queueLengths.get(m.courtId) || 0) + 1);
        }
      });

      // 4. Find the optimal court (IDLE first, then shortest queue)
      let optimalCourtId = courts[0].id;
      let minQueue = queueLengths.get(optimalCourtId) || 0;

      for (const court of courts) {
        const qLen = queueLengths.get(court.id) || 0;
        if (qLen === 0) {
          optimalCourtId = court.id;
          minQueue = 0;
          break; // Found an IDLE court, stop searching
        }
        if (qLen < minQueue) {
          minQueue = qLen;
          optimalCourtId = court.id;
        }
      }

      // 5. Update the match
      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: {
          courtId: optimalCourtId,
          orderIndex: minQueue // Append to the end of the queue
        },
        include: { court: true }
      });

      return updatedMatch;
    });

    return NextResponse.json({ success: true, match: result });
  } catch (error: any) {
    logger.error('[auto-dispatch/POST] Failed', {}, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

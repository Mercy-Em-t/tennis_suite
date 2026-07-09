import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.roles.includes('DIRECTOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { matchId, newScoreState, winnerId, status, reason } = await request.json();
    if (!matchId || !reason) {
      return NextResponse.json({ error: 'Missing matchId or reasoning' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({ where: { id: matchId } });
      if (!match) throw new Error("Match not found");

      // 1. Force the score update
      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: {
          scoreState: JSON.stringify(newScoreState || {}),
          winnerId: winnerId || match.winnerId,
          status: status || match.status
        }
      });

      // 2. Log the Override
      await tx.auditLog.create({
        data: {
          action: 'SCORE_CORRECTED',
          details: `Match ${matchId} manually overridden. Reason: ${reason}. New Status: ${updatedMatch.status}`,
          userId: payload.sub,
          matchId: match.id,
          tournamentId: match.tournamentId
        }
      });
      
      // 3. Recalculate Downstream matches if this match is now completed
      if (updatedMatch.status === 'COMPLETED' && updatedMatch.winnerId && updatedMatch.nextMatchId) {
        // Find next match and inject this winner
        const nextMatch = await tx.match.findUnique({ where: { id: updatedMatch.nextMatchId }});
        if (nextMatch) {
          // Determine if we fill team A or team B placeholder
          // This requires specific bracket logic, usually tied to match.orderIndex or placeholders
          const dataToUpdate: any = {};
          if (!nextMatch.teamAId) dataToUpdate.teamAId = updatedMatch.winnerId;
          else if (!nextMatch.teamBId) dataToUpdate.teamBId = updatedMatch.winnerId;
          
          if (Object.keys(dataToUpdate).length > 0) {
            await tx.match.update({
              where: { id: nextMatch.id },
              data: dataToUpdate
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Override Score API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

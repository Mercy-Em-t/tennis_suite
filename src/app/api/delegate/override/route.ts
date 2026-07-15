import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { matchId, newWinnerId, reason } = await request.json();

    if (!matchId || !newWinnerId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.roles.some(r => ['DIRECTOR', 'ADMIN', 'HOST'].includes(r))) {
      return NextResponse.json({ error: 'Forbidden. Delegate access required.' }, { status: 403 });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { teamA: true, teamB: true }
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }
    
    if (match.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Only COMPLETED matches can be overridden.' }, { status: 400 });
    }

    // Attempt to parse score and flip sets if applicable
    let updatedScoreStr = match.scoreState;
    if (match.scoreState) {
      try {
        const score = JSON.parse(match.scoreState as string);
        // Simple heuristic: if we are flipping winner, ensure sets reflect that
        if (newWinnerId === match.teamAId && score.setsA < score.setsB) {
          const temp = score.setsA;
          score.setsA = score.setsB;
          score.setsB = temp;
        } else if (newWinnerId === match.teamBId && score.setsB < score.setsA) {
          const temp = score.setsA;
          score.setsA = score.setsB;
          score.setsB = temp;
        }
        updatedScoreStr = JSON.stringify(score);
      } catch (e) {
        // ignore parse error
      }
    }

    // Update match
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        winnerId: newWinnerId,
        scoreState: updatedScoreStr
      },
      include: { teamA: true, teamB: true }
    });

    // Log the action to AuditLog
    const winnerName = newWinnerId === match.teamAId ? match.teamA?.franchiseName : match.teamB?.franchiseName;
    const oldWinnerName = match.winnerId === match.teamAId ? match.teamA?.franchiseName : match.teamB?.franchiseName;

    await prisma.auditLog.create({
      data: {
        action: 'SCORE_CORRECTED',
        details: `Delegate overridden match ${matchId}. Winner changed from ${oldWinnerName || 'None'} to ${winnerName}. Reason: ${reason}`,
        tournamentId: match.tournamentId,
        userId: payload.sub
      }
    });

    return NextResponse.json({
      success: true,
      match: updatedMatch
    });
  } catch (error: any) {
    console.error('[api/delegate/override]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

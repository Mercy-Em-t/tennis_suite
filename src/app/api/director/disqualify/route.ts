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

    const { teamId, reason } = await request.json();
    if (!teamId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Mark team as disqualified
      const team = await tx.team.update({
        where: { id: teamId },
        data: { status: 'DISQUALIFIED' }
      });

      // 2. Find any active or scheduled matches for this team and award walkovers
      const activeMatches = await tx.match.findMany({
        where: {
          OR: [{ teamAId: teamId }, { teamBId: teamId }],
          status: { in: ['SCHEDULED', 'PENDING', 'IN_PROGRESS'] }
        }
      });

      for (const match of activeMatches) {
        const winnerId = match.teamAId === teamId ? match.teamBId : match.teamAId;
        
        await tx.match.update({
          where: { id: match.id },
          data: {
            status: 'COMPLETED',
            winnerId: winnerId,
            scoreState: JSON.stringify({ walkover: true }),
            pauseReason: 'OPPONENT_DISQUALIFIED'
          }
        });
        
        // Note: downstream matches would need to be updated here via TournamentEngine logic
        // but for this API layer, we record the direct match closure.
      }

      // 3. Log the audit event
      await tx.auditLog.create({
        data: {
          action: 'PARTICIPANT_DISQUALIFIED',
          details: `Team ${team.franchiseName} (${team.id}) disqualified. Reason: ${reason}`,
          userId: payload.sub,
          tournamentId: team.tournamentId
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disqualify API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

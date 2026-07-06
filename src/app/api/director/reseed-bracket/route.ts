import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'DIRECTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { tournamentId, matchIdA, matchIdB, reason } = await request.json();
    if (!reason || !tournamentId || !matchIdA || !matchIdB) {
      return NextResponse.json({ error: 'Missing required reasoning, match IDs, or tournament ID' }, { status: 400 });
    }

    // Bracket re-seeding involves forcefully swapping team IDs between matches or slots.
    await prisma.$transaction(async (tx) => {
      const mA = await tx.match.findUnique({ where: { id: matchIdA }});
      const mB = await tx.match.findUnique({ where: { id: matchIdB }});
      
      if (!mA || !mB) throw new Error("Match not found");

      // Integrity Lock: Check if they are completed
      if (mA.status === 'COMPLETED' || mB.status === 'COMPLETED') {
        throw new Error("Cannot re-seed teams in matches that are already completed.");
      }

      // Integrity Lock: Historical Conflict Checking
      // Since we are swapping teamAId between the two matches:
      // New Match A = mB.teamAId vs mA.teamBId
      if (mB.teamAId && mA.teamBId) {
        const conflict1 = await tx.match.findFirst({
          where: {
            tournamentId,
            id: { notIn: [matchIdA, matchIdB] },
            OR: [
              { teamAId: mB.teamAId, teamBId: mA.teamBId },
              { teamAId: mA.teamBId, teamBId: mB.teamAId }
            ]
          }
        });
        if (conflict1) throw new Error("Integrity Lock: Teams in the new Match A slot have already played each other.");
      }

      // New Match B = mA.teamAId vs mB.teamBId
      if (mA.teamAId && mB.teamBId) {
        const conflict2 = await tx.match.findFirst({
          where: {
            tournamentId,
            id: { notIn: [matchIdA, matchIdB] },
            OR: [
              { teamAId: mA.teamAId, teamBId: mB.teamBId },
              { teamAId: mB.teamBId, teamBId: mA.teamAId }
            ]
          }
        });
        if (conflict2) throw new Error("Integrity Lock: Teams in the new Match B slot have already played each other.");
      }

      // Simple Swap: Assuming we are swapping teamAId of both matches. 
      // In a real scenario, the payload would specify exactly which slots are swapping.
      const tempTeamA = mA.teamAId;
      await tx.match.update({ where: { id: matchIdA }, data: { teamAId: mB.teamAId }});
      await tx.match.update({ where: { id: matchIdB }, data: { teamAId: tempTeamA }});

      await tx.auditLog.create({
        data: {
          action: 'BRACKET_RESEEDED',
          details: `Manual bracket adjustment: Swapped teams in ${matchIdA} and ${matchIdB}. Reason: ${reason}`,
          userId: payload.id,
          tournamentId
        }
      });
      
      // We would dispatch a push notification to affected players here via fcm.ts
    });

    return NextResponse.json({ success: true, message: 'Bracket re-seeded successfully.' });
  } catch (error: any) {
    console.error('Reseed Bracket API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

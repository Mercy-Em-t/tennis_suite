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

    const { tournamentId, reason } = await request.json();
    if (!tournamentId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Validation check: Are all matches completed?
      const uncompletedMatches = await tx.match.count({
        where: { tournamentId, status: { not: 'COMPLETED' } }
      });
      
      if (uncompletedMatches > 0) {
        throw new Error(`Cannot archive: ${uncompletedMatches} matches are still incomplete.`);
      }

      // 2. Lock the tournament
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { isArchived: true, isActive: false }
      });

      // 3. Log the closure
      await tx.auditLog.create({
        data: {
          action: 'TOURNAMENT_ARCHIVED',
          details: `Tournament permanently closed and archived. Reason: ${reason}`,
          userId: payload.id,
          tournamentId
        }
      });
    });

    return NextResponse.json({ success: true, message: 'Tournament successfully archived.' });
  } catch (error: any) {
    console.error('Archive API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

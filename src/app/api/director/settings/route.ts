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

    const { tournamentId, scoringRules, reason } = await request.json();
    if (!tournamentId || !scoringRules || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { scoringRules }
      });

      await tx.auditLog.create({
        data: {
          action: 'SETTINGS_OVERRIDE',
          details: `Changed scoring rules to ${scoringRules}. Reason: ${reason}`,
          userId: payload.sub,
          tournamentId
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

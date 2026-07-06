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

    const { matchId, tournamentId, overlayCommand, textPayload, reason } = await request.json();
    if (!overlayCommand || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // In a real system, this would write to a Redis pub/sub queue or a BroadcastEvent table
      // For Prisma modeling, we just log the override action that the external broadcast service listens to.
      
      await tx.auditLog.create({
        data: {
          action: 'BROADCAST_OVERRIDDEN',
          details: `Command [${overlayCommand}] pushed to broadcast. Payload: ${textPayload}. Reason: ${reason}`,
          userId: payload.id,
          matchId: matchId || null,
          tournamentId: tournamentId || null
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Broadcast Override API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

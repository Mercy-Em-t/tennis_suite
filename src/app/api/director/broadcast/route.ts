import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { pushEmergencyNotification } from '@/lib/external/fcm';

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

    const { tournamentId, message, isPushEnabled } = await request.json();
    if (!tournamentId) {
      return NextResponse.json({ error: 'Tenant Context (tournamentId) is required' }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Set the global message for the SWR listener
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { globalMessage: message }
      });

      // If urgent push requested, dispatch to Player App
      if (isPushEnabled) {
        await pushEmergencyNotification(tournamentId, 'TOURNAMENT BROADCAST', message);
      }

      await tx.auditLog.create({
        data: {
          action: 'EMERGENCY_BROADCAST_SENT',
          details: `Broadcast: "${message}". Push: ${isPushEnabled}`,
          userId: payload.sub,
          tournamentId: tournamentId
        }
      });
    });

    return NextResponse.json({ success: true, message: 'Broadcast dispatched.' });
  } catch (error) {
    console.error('Broadcast API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

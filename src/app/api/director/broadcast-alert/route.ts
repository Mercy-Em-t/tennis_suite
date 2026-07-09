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

    const { tournamentId, alertType, details } = await request.json();
    if (!alertType || !details) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Create the high-priority audit log for the production lead
      await tx.auditLog.create({
        data: {
          action: 'BROADCAST_QUALITY_ALERT',
          details: `Type: ${alertType}. Message: ${details}`,
          userId: payload.sub,
          tournamentId: tournamentId || null
        }
      });
      
      // In a real production environment, this would push a WebSocket or webhook payload 
      // directly to the TV production truck's dashboard software.
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Broadcast Alert API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

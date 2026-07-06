import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { dispatchEmergencySMS } from '@/lib/external/twilio';
import { pushEmergencyNotification } from '@/lib/external/fcm';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'DIRECTOR') {
      return NextResponse.json({ error: 'Forbidden: Requires Delegate Authority' }, { status: 403 });
    }

    const body = await request.json();
    const { reason, tournamentId, action = 'SUSPEND' } = body;
    
    if (!tournamentId) {
      return NextResponse.json({ error: 'Tenant Context (tournamentId) is required' }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: 'Reason code is mandatory' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const targetState = action === 'SUSPEND' ? 'SUSPENDED' : 'NORMAL';

      // 1. Update the global State for the cascade effect
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { globalState: targetState }
      });

      // 2. If SUSPENDING, pause all active matches
      if (action === 'SUSPEND') {
        await tx.match.updateMany({
          where: { 
            tournamentId,
            status: 'IN_PROGRESS' 
          },
          data: { 
            status: 'REQUIRES_INTERVENTION',
            pauseReason: reason
          }
        });
      }

      let downtimeDetails = '';
      if (action === 'RESUME') {
        const lastSuspension = await tx.auditLog.findFirst({
          where: { action: 'TOURNAMENT_SUSPENDED', tournamentId: tournamentId },
          orderBy: { createdAt: 'desc' }
        });
        if (lastSuspension) {
          const downtimeSec = Math.floor((Date.now() - lastSuspension.createdAt.getTime()) / 1000);
          downtimeDetails = ` Total downtime: ${downtimeSec} seconds.`;
        }
      } else if (action === 'SUSPEND') {
        // Mock sending to all active court marshals and players
        await dispatchEmergencySMS(['MARSHAL_1', 'MARSHAL_2'], `EMERGENCY: ${reason}. Proceed to courts immediately.`);
        await pushEmergencyNotification(tournamentId, 'TEMPORARY SUSPENSION', `Play halted: ${reason}`);
      }

      // 3. Create the immutable Audit Log
      await tx.auditLog.create({
        data: {
          action: action === 'SUSPEND' ? 'TOURNAMENT_SUSPENDED' : 'TOURNAMENT_RESUMED',
          details: `Kill Switch ${action}. Reason: ${reason}. Affected: Tournament ${tournamentId}.${downtimeDetails}`,
          userId: payload.id,
          tournamentId: tournamentId
        }
      });
    });

    return NextResponse.json({ success: true, message: `Tournament ${action === 'SUSPEND' ? 'Suspended' : 'Resumed'} Successfully` });
  } catch (error) {
    console.error('Kill Switch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

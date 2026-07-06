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

    const { courtId, refereeId, marshallId, reason, tournamentId } = await request.json();
    if (!courtId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const dataToUpdate: any = {};
      if (refereeId !== undefined) dataToUpdate.refereeId = refereeId;
      if (marshallId !== undefined) dataToUpdate.marshallId = marshallId;

      if (Object.keys(dataToUpdate).length > 0) {
        await tx.court.update({
          where: { id: courtId },
          data: dataToUpdate
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'STAFF_REASSIGNED',
          details: `Staff manually updated on Court ${courtId}. Reason: ${reason}`,
          userId: payload.id,
          tournamentId
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Staff Override API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

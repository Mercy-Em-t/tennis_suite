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

    const { tournamentId, payoutData, reason } = await request.json();
    if (!tournamentId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Verify tournament is actually in a completed state before authorizing payouts
      const tournament = await tx.tournament.findUnique({ where: { id: tournamentId } });
      if (!tournament || tournament.currentStage !== 'FINALS') { // Simplified check
         throw new Error("Tournament is not in a final state. Payouts locked.");
      }

      // 2. Loop through partner/sponsor payouts and update status
      if (payoutData && Array.isArray(payoutData)) {
        for (const payout of payoutData) {
           await tx.partnerPayout.update({
             where: { id: payout.id },
             data: { status: 'PAID' }
           });
        }
      }

      await tx.auditLog.create({
        data: {
          action: 'PAYOUTS_UNLOCKED',
          details: `Prize pool and partner payouts triggered. Reason: ${reason}`,
          userId: payload.id,
          tournamentId
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Payouts API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

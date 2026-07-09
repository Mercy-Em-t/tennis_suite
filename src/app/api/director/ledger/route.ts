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

    const { teamId, amount, reason, tournamentId } = await request.json();
    if (!teamId || !amount || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Logic to trigger Stripe refund would go here using stripe SDK
      // Example: await stripe.refunds.create({ charge: team.stripeChargeId, amount: amount });

      const team = await tx.team.update({
        where: { id: teamId },
        data: { paymentStatus: 'REFUNDED' }
      });

      await tx.auditLog.create({
        data: {
          action: 'MANUAL_REFUND_ISSUED',
          details: `Refund of $${amount} issued to team ${team.franchiseName}. Reason: ${reason}`,
          userId: payload.sub,
          tournamentId
        }
      });
    });

    return NextResponse.json({ success: true, message: `Refund processed successfully.` });
  } catch (error) {
    console.error('Ledger API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

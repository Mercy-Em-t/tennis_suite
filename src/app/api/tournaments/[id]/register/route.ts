import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

import { verifyToken } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { franchiseName } = await request.json();
    const { id: tournamentId } = await params;

    if (!tournamentId || !franchiseName) {
      return NextResponse.json({ error: 'Missing checkout context' }, { status: 400 });
    }

    // Wrap in a transaction to ensure atomic Ledger writing + Team creation
    // Using Serializable isolation level to guarantee absolute consistency for financial ledgers
    await prisma.$transaction(async (tx) => {
      // 1. Finalize Team
      await tx.team.create({
        data: {
          franchiseName,
          tournamentId,
          players: { connect: { id: payload.sub } }
        }
      });

      // 2. Automate Ledgers (Simulating $150 entry fee, $7.50 platform cut)
      const ENTRY_FEE = 150;
      const PLATFORM_FEE_PERCENT = 5.0;
      const platformCut = ENTRY_FEE * (PLATFORM_FEE_PERCENT / 100);

      await tx.rainmakerFee.create({
        data: {
          tournamentId,
          brokerName: 'Stripe Gateway (Mock)',
          dealAmount: ENTRY_FEE,
          feePercent: PLATFORM_FEE_PERCENT,
          payoutAmount: platformCut
        }
      });

      // 3. Mock Partner Payout (e.g., local club gets 10%)
      await tx.partnerPayout.create({
        data: {
          tournamentId,
          partnerName: 'Local Country Club',
          service: 'FACILITY_FEE',
          amountOwed: ENTRY_FEE * 0.10,
          status: 'PENDING'
        }
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000, // default is 2000
      timeout: 10000 // default is 5000
    });

    return NextResponse.json({ success: true, message: 'Checkout and ledgering complete' });
  } catch (error) {
    console.error('[tournaments/[id]/register/POST]', error);
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}

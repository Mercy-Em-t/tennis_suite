import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';



export async function GET(request: Request) {
  const authResult = await requireAuth(['HOST', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const payouts = await prisma.partnerPayout.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    const fees = await prisma.rainmakerFee.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    // Merge them into a single timeline for the UI ledger
    const ledger = [
      ...payouts.map(p => ({
        id: `payout_${p.id}`,
        date: p.createdAt,
        partner: `Affiliate ${p.partnerName}`,
        source: 'Partner Split',
        amount: Number(p.amountOwed)
      })),
      ...fees.map(f => ({
        id: `fee_${f.id}`,
        date: f.createdAt,
        partner: f.brokerName,
        source: 'Rainmaker Commission',
        amount: Number(f.payoutAmount)
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return NextResponse.json({ success: true, ledger });
  } catch (error) {
    logger.error('[finance] Failed to fetch financial data', {}, error);
    return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
  }
}

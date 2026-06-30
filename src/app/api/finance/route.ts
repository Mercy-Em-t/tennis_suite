import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
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
    return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
  }
}

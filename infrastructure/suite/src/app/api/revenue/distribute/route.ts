import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Pillar 27: Internal Revenue Splits & Co-op Distribution
 * Automatically calculates Rainmaker Fees and logs Partner Payouts.
 */
export async function POST(request: Request) {
  try {
    const { dealAmount, brokerName } = await request.json();

    // The "Rainmaker" Fee Engine (e.g. 15% commission)
    const feePercent = 0.15;
    const payoutAmount = Math.floor(dealAmount * feePercent);

    const rainmakerFee = await prisma.rainmakerFee.create({
      data: { brokerName, dealAmount, feePercent, payoutAmount }
    });

    // We might also log a Partner Payout for video services etc.
    const partnerPayout = await prisma.partnerPayout.create({
      data: { partnerName: "Elite Video Co", service: "VIDEOGRAPHY", amountOwed: 50000 }
    });

    return NextResponse.json({ 
      success: true, 
      rainmakerFee,
      partnerPayout,
      message: 'Financial splits successfully routed to internal ledger.'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process revenue splits' }, { status: 400 });
  }
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';




/**
 * Pillar 27: Internal Revenue Splits & Co-op Distribution
 * Automatically calculates Rainmaker Fees and logs Partner Payouts.
 */
export async function POST(request: Request) {
  try {
    const { dealAmount, brokerName, tournamentId } = await request.json();

    if (!tournamentId) {
      return NextResponse.json({ error: 'tournamentId is required' }, { status: 400 });
    }

    // The "Rainmaker" Fee Engine (e.g. 15% commission)
    const feePercent = 0.15;
    const payoutAmount = Math.floor(dealAmount * feePercent);

    const rainmakerFee = await prisma.rainmakerFee.create({
      data: { tournamentId, brokerName, dealAmount, feePercent, payoutAmount }
    });

    // We might also log a Partner Payout for video services etc.
    const partnerPayout = await prisma.partnerPayout.create({
      data: { tournamentId, partnerName: "Elite Video Co", service: "VIDEOGRAPHY", amountOwed: 50000 }
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

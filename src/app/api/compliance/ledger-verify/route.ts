import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    if (!tournamentId) {
      return NextResponse.json({ error: 'tournamentId required' }, { status: 400 });
    }

    const ledgers = await prisma.ledgerEntry.findMany({
      where: { tournamentId },
      include: { team: true }
    });

    let totalGross = 0;
    let totalPlatform = 0;
    let totalHost = 0;
    let status = 'PASSED';
    const violations: string[] = [];

    for (const entry of ledgers) {
      totalGross += entry.grossAmount;
      totalPlatform += entry.platformFee;
      totalHost += entry.hostPayout;

      // INVARIANT: Gross must exactly equal the sum of its splits
      if (entry.grossAmount !== (entry.platformFee + entry.hostPayout)) {
        status = 'CRITICAL_AUDIT_FLAG';
        violations.push(
          `Math Mismatch on Ledger ID ${entry.id} (Team: ${entry.team.name}): Gross ${entry.grossAmount} != ${entry.platformFee} + ${entry.hostPayout}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      status,
      totalEntries: ledgers.length,
      aggregate: {
        totalGross,
        totalPlatform,
        totalHost,
      },
      violations
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

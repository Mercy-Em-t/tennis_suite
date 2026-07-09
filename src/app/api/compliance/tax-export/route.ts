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
      include: { team: true, tournament: true }
    });

    // Format as a CSV string
    const headers = ['Tournament Name', 'Team Name', 'Gross Paid (Cents)', 'Platform Fee (Cents)', 'Host Payout (Cents)', 'Date'];
    
    const rows = ledgers.map(l => [
      `"${l.tournament.name}"`,
      `"${l.team.franchiseName}"`,
      l.grossAmount,
      l.platformFee,
      l.hostPayout,
      `"${l.createdAt.toISOString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return NextResponse.json({
      success: true,
      csvContent,
      filename: `tax_export_${tournamentId}.csv`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

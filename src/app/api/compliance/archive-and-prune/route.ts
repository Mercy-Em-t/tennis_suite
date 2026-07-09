import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { tournamentId } = await request.json();

    if (!tournamentId) {
      return NextResponse.json({ error: 'tournamentId required' }, { status: 400 });
    }

    // 1. Snapshot Phase: Fetch everything
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    const matches = await prisma.match.findMany({ where: { tournamentId } });
    const teams = await prisma.team.findMany({ where: { tournamentId } });
    const ledger = await prisma.ledgerEntry.findMany({ where: { tournamentId } });

    const coldStorageSnapshot = {
      exportedAt: new Date().toISOString(),
      metadata: tournament,
      data: {
        matches,
        teams,
        ledger
      }
    };

    // 2. Prune Phase: Delete all relational data atomically
    // The order matters due to foreign keys. Match and Ledger depend on Team.
    await prisma.$transaction([
      prisma.ledgerEntry.deleteMany({ where: { tournamentId } }),
      prisma.match.deleteMany({ where: { tournamentId } }),
      prisma.team.deleteMany({ where: { tournamentId } }),
      prisma.tournament.delete({ where: { id: tournamentId } })
    ]);

    return NextResponse.json({
      success: true,
      message: `Tournament ${tournamentId} successfully archived and pruned from active tables.`,
      snapshot: coldStorageSnapshot
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    if (!tournamentId) {
      return NextResponse.json({ error: 'tournamentId required' }, { status: 400 });
    }

    const matches = await prisma.match.findMany({
      where: { tournamentId },
      include: { teamA: true, teamB: true }
    });

    let status = 'SECURE';
    const leakageViolations: string[] = [];

    for (const match of matches) {
      if (match.teamA && match.teamA.tournamentId !== tournamentId) {
        status = 'LEAKAGE_DETECTED';
        leakageViolations.push(
          `Cross-Tenant Leak: Match ${match.id} (Tournament ${tournamentId}) contains Team ${match.teamA.id} from Tournament ${match.teamA.tournamentId}`
        );
      }
      if (match.teamB && match.teamB.tournamentId !== tournamentId) {
        status = 'LEAKAGE_DETECTED';
        leakageViolations.push(
          `Cross-Tenant Leak: Match ${match.id} (Tournament ${tournamentId}) contains Team ${match.teamB.id} from Tournament ${match.teamB.tournamentId}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      status,
      scannedMatches: matches.length,
      leakageViolations
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

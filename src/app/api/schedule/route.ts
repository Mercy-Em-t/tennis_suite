import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    if (!tournamentId) {
      return NextResponse.json({ success: false, error: 'Tournament context is required' }, { status: 400 });
    }

    const matches = await prisma.match.findMany({
      where: { tournamentId, status: { in: ['IN_PROGRESS', 'SCHEDULED'] } },
      include: { teamA: true, teamB: true }
    });

    // Group matches by mock court assignments
    // In a real system, the Match model would have a courtId or locationId
    const courts = {
      'Center Court': matches.slice(0, 2),
      'Court 1': matches.slice(2, 4)
    };

    return NextResponse.json({ success: true, courts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schedule data' }, { status: 500 });
  }
}

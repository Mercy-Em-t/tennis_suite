import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';




export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      where: { status: { in: ['IN_PROGRESS', 'SCHEDULED'] } },
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

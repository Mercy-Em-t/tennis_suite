import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';




export async function GET() {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: { isActive: true },
      include: {
        matches: {
          include: {
            teamA: true,
            teamB: true,
            court: true,
          }
        },
        teams: true,
        courts: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'No active tournament found' }, { status: 404 });
    }

    // Calculate Completion Ratio
    const totalMatches = tournament.matches.length;
    const completedMatches = tournament.matches.filter(m => m.status === 'COMPLETED').length;
    const completionPercentage = totalMatches === 0 ? 0 : Math.round((completedMatches / totalMatches) * 100);

    return NextResponse.json({
      success: true,
      tournament,
      stats: {
        totalMatches,
        completedMatches,
        completionPercentage
      }
    });
  } catch (error) {
    console.error('[tournaments/active]', error);
    return NextResponse.json({ error: 'Failed to fetch tournament data' }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';



export async function POST(request: Request) {
  const authResult = await requireAuth(['HOST', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const data = await request.json();
    const { 
      name, startDate, endDate, location, 
      formatType, matchDuration, scoringRules, categories,
      numCourts, surfaceType, logoUrl, sponsorUrl 
    } = data;

    // Generate court data for the transaction
    const numCourtsInt = parseInt(numCourts) || 1;
    const courtsData = Array.from({ length: numCourtsInt }).map((_, i) => ({
      name: `Court ${i + 1}`,
      courtType: surfaceType === 'Grass' ? 'TENNIS_GRASS' : surfaceType === 'Clay' ? 'TENNIS_CLAY' : 'TENNIS_HARD'
    }));

    // Atomic transaction for provisioning Tournament & Courts
    const newTournament = await prisma.$transaction(async (tx) => {
      return await tx.tournament.create({
        data: {
          name: name || 'Untitled Tournament',
          formatType: formatType || 'Round-Robin',
          maxTeams: 16, // Default for now, can be adjusted in tournament settings
          isActive: false, 
          hostId: authResult.id,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          location,
          matchDuration: parseInt(matchDuration) || null,
          scoringRules,
          categories,
          surfaceType,
          logoUrl,
          sponsorUrl,
          courts: {
            create: courtsData,
          },
        },
      });
    });

    logger.info('Tournament provisioned', { tournamentId: newTournament.id, createdBy: authResult.id });
    return NextResponse.json({ success: true, tournament: newTournament });
  } catch (error) {
    logger.error('[tournaments/POST] Failed to provision tournament', {}, error);
    return NextResponse.json({ error: 'Failed to provision tournament' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const authResult = await requireAuth(['HOST', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const tournaments = await prisma.tournament.findMany({
      where: { hostId: authResult.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        isActive: true,
        isArchived: true,
        formatType: true,
        maxTeams: true,
        _count: {
          select: { teams: true, matches: true, courts: true },
        },
      },
    });

    return NextResponse.json({ success: true, tournaments });
  } catch (error) {
    logger.error('[tournaments/GET] Failed to fetch tournaments', {}, error);
    return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 });
  }
}

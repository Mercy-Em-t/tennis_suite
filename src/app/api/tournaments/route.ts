import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';
import { generateUniqueSlug } from '@/lib/slug';

export async function POST(request: Request) {
  const authResult = await requireAuth(['HOST', 'ADMIN', 'PLAYER']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const data = await request.json();
    const { 
      name, startDate, endDate, location, sportType,
      formatType, matchDuration, scoringRules, categories,
      numCourts, surfaceType, logoUrl, sponsorUrl,
      contactEmail, contactPhone, registrationFee, registrationStart, registrationEnd, allowMultiCategory
    } = data;

    // Validate required fields
    if (!name?.trim()) return NextResponse.json({ error: 'Tournament name is required' }, { status: 400 });
    if (!startDate) return NextResponse.json({ error: 'Start date is required' }, { status: 400 });
    if (!endDate) return NextResponse.json({ error: 'End date is required' }, { status: 400 });
    if (!location?.trim()) return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    if (!formatType) return NextResponse.json({ error: 'Format type is required' }, { status: 400 });
    if (!categories?.trim()) return NextResponse.json({ error: 'Categories are required' }, { status: 400 });
    if (!numCourts || parseInt(numCourts) <= 0) return NextResponse.json({ error: 'Number of courts must be at least 1' }, { status: 400 });
    if (!surfaceType) return NextResponse.json({ error: 'Surface type is required' }, { status: 400 });
    if (!contactPhone?.trim()) return NextResponse.json({ error: 'Contact phone is required' }, { status: 400 });
    if (!contactEmail?.trim()) return NextResponse.json({ error: 'Contact email is required' }, { status: 400 });

    if (new Date(endDate) < new Date(startDate)) {
      return NextResponse.json({ error: 'End date cannot be before start date' }, { status: 400 });
    }

    // Generate court data for the transaction
    const numCourtsInt = parseInt(numCourts) || 1;
    const courtsData = Array.from({ length: numCourtsInt }).map((_, i) => ({
      name: `Court ${i + 1}`,
      courtType: surfaceType === 'Grass' ? 'TENNIS_GRASS' : surfaceType === 'Clay' ? 'TENNIS_CLAY' : 'TENNIS_HARD'
    }));

    // Generate a unique slug from the name
    const slug = await generateUniqueSlug(name);

    // Atomic transaction for provisioning Tournament & Courts
    const newTournament = await prisma.$transaction(async (tx) => {
      return await tx.tournament.create({
        data: {
          slug,
          name: name || 'Untitled Tournament',
          sportType: sportType || 'TENNIS',
          formatType: formatType || 'Round Robin',
          maxTeams: 16,
          isActive: false,
          hostId: authResult.id,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          registrationStart: registrationStart ? new Date(registrationStart) : null,
          registrationEnd: registrationEnd ? new Date(registrationEnd) : null,
          location,
          matchDuration: parseInt(matchDuration) || null,
          registrationFee: parseInt(registrationFee) || null,
          scoringRules,
          categories,
          allowMultiCategory: Boolean(allowMultiCategory),
          surfaceType,
          contactPhone,
          contactEmail,
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
        slug: true,
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

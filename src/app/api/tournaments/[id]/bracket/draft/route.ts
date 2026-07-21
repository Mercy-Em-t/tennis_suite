import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireTournamentAccess } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const authResult = await requireTournamentAccess(params.id, ['REFEREE']);
    if (authResult instanceof NextResponse) return authResult;

    const { category, versionId } = await request.json();
    if (!category || !versionId) return NextResponse.json({ error: 'Missing category or versionId' }, { status: 400 });

    const pools = await prisma.pool.findMany({
      where: { tournamentId: params.id, category, versionId },
      orderBy: { name: 'asc' }
    });

    const numPools = pools.length;

    // Validate 2 or 4 pools
    if (numPools !== 2 && numPools !== 4) {
      return NextResponse.json({ error: 'Knockout draft generation currently only supports exactly 2 or 4 pools. You can manually create placeholders instead.' }, { status: 400 });
    }

    // Delete existing KNOCKOUT drafts for this category/version if any to prevent duplicates?
    // Actually, we should just append them, or clear existing SCHEDULED knockouts. 
    // To be safe, we'll clear pending knockouts for this category if they are just placeholders.
    await prisma.match.deleteMany({
      where: {
        tournamentId: params.id,
        stage: 'KNOCKOUTS',
        status: 'SCHEDULED',
        category: category,
        teamAId: null, // Only delete if they are pure placeholders
        teamBId: null
      }
    });

    const newMatches = [];

    if (numPools === 2) {
      // 2 Pools: Semifinals -> A1 vs B2, B1 vs A2
      const poolA = pools[0].name; // "Pool A"
      const poolB = pools[1].name; // "Pool B"

      newMatches.push({
        tournamentId: params.id,
        stage: 'KNOCKOUTS',
        category,
        status: 'SCHEDULED',
        placeholderA: `${poolA} Pos 1`,
        placeholderB: `${poolB} Pos 2`,
      });

      newMatches.push({
        tournamentId: params.id,
        stage: 'KNOCKOUTS',
        category,
        status: 'SCHEDULED',
        placeholderA: `${poolB} Pos 1`,
        placeholderB: `${poolA} Pos 2`,
      });

      // Also Draft the Final linking to these (nextMatchId logic would require inserting sequentially, but for now we just create the placeholders for SF).
      // A full implementation would create the final and link them.
    } else if (numPools === 4) {
      // 4 Pools: Quarterfinals -> A1 vs D2, B1 vs C2, C1 vs B2, D1 vs A2
      const poolA = pools[0].name;
      const poolB = pools[1].name;
      const poolC = pools[2].name;
      const poolD = pools[3].name;

      newMatches.push({
        tournamentId: params.id,
        stage: 'KNOCKOUTS',
        category,
        status: 'SCHEDULED',
        placeholderA: `${poolA} Pos 1`,
        placeholderB: `${poolD} Pos 2`,
      });
      newMatches.push({
        tournamentId: params.id,
        stage: 'KNOCKOUTS',
        category,
        status: 'SCHEDULED',
        placeholderA: `${poolB} Pos 1`,
        placeholderB: `${poolC} Pos 2`,
      });
      newMatches.push({
        tournamentId: params.id,
        stage: 'KNOCKOUTS',
        category,
        status: 'SCHEDULED',
        placeholderA: `${poolC} Pos 1`,
        placeholderB: `${poolB} Pos 2`,
      });
      newMatches.push({
        tournamentId: params.id,
        stage: 'KNOCKOUTS',
        category,
        status: 'SCHEDULED',
        placeholderA: `${poolD} Pos 1`,
        placeholderB: `${poolA} Pos 2`,
      });
    }

    const createdMatches = await prisma.$transaction(
      newMatches.map(data => prisma.match.create({ data }))
    );

    logger.info('Knockout Draft Generated', { tournamentId: params.id, numPools });
    return NextResponse.json({ success: true, message: `Successfully generated ${createdMatches.length} placeholder knockout matches.` });
  } catch (error) {
    console.error('[bracket/draft/POST]', error);
    return NextResponse.json({ error: 'Failed to draft knockout bracket' }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';




export async function POST(request: Request) {
  try {
    const { tournamentId } = await request.json();

    if (!tournamentId) {
      return NextResponse.json({ error: 'tournamentId is required' }, { status: 400 });
    }

    // Phase 4.2 Logic: Identify matches stuck in IN_PROGRESS or WARMUP for > 90 mins
    const thresholdTime = new Date(Date.now() - 90 * 60 * 1000);

    const stuckMatches = await prisma.match.findMany({
      where: {
        tournamentId: tournamentId,
        status: { in: ['IN_PROGRESS', 'WARMUP'] },
        updatedAt: { lt: thresholdTime }
      },
      include: {
        court: true
      }
    });

    if (stuckMatches.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No bottlenecks detected.',
        proposals: []
      });
    }

    // Find available idle courts
    const idleCourts = await prisma.court.findMany({
      where: {
        tournamentId: tournamentId,
        matches: {
          none: {
            status: { in: ['IN_PROGRESS', 'WARMUP', 'READY'] }
          }
        }
      }
    });

    const proposals = [];

    // Simple matching: match stuck matches to idle courts 1:1
    for (let i = 0; i < Math.min(stuckMatches.length, idleCourts.length); i++) {
      proposals.push({
        stuckMatchId: stuckMatches[i].id,
        suggestedCourtId: idleCourts[i].id,
        originalCourtName: stuckMatches[i].court?.name || 'Unknown',
        suggestedCourtName: idleCourts[i].name
      });
    }

    // Safety Lock: Agent only proposes, does not mutate.
    return NextResponse.json({
      success: true,
      message: `Identified ${stuckMatches.length} stuck match(es). Proposed ${proposals.length} reschedule(s).`,
      proposals
    });
  } catch (error: unknown) {
    console.error('[ai/agent/reschedule/POST]', error);
    return NextResponse.json({ error: 'Agent encountered an error calculating reschedules.' }, { status: 500 });
  }
}

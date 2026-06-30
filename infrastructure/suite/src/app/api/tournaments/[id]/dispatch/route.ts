import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { matchId, courtId } = await request.json();

    if (!matchId || !courtId) {
      return NextResponse.json({ error: 'Missing matchId or courtId' }, { status: 400 });
    }

    // Validation: Check if Court exists and belongs to this tournament
    const court = await prisma.court.findUnique({
      where: { id: courtId }
    });

    if (!court || court.tournamentId !== params.id) {
      return NextResponse.json({ error: 'Invalid court for this tournament' }, { status: 400 });
    }

    // Refinement Validation: Check if the court is currently occupied
    const activeMatchOnCourt = await prisma.match.findFirst({
      where: {
        courtId: courtId,
        status: 'IN_PROGRESS'
      }
    });

    if (activeMatchOnCourt) {
      return NextResponse.json({ error: 'Court is currently occupied by an active match.' }, { status: 400 });
    }

    // Validation: Check if Match is SCHEDULED
    const targetMatch = await prisma.match.findUnique({
      where: { id: matchId }
    });

    if (!targetMatch || targetMatch.status !== 'SCHEDULED') {
      return NextResponse.json({ error: 'Target match must be in SCHEDULED state.' }, { status: 400 });
    }

    // Execute Dispatch
    const dispatchedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        courtId: courtId,
        status: 'READY'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Match ${matchId} dispatched to Court ${court.name}. Status updated to READY.`,
      match: dispatchedMatch 
    });

  } catch (error) {
    console.error('[tournaments/dispatch/POST]', error);
    return NextResponse.json({ error: 'Failed to dispatch match' }, { status: 500 });
  }
}

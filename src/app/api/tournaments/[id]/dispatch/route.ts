import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';




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
        status: { in: ['IN_PROGRESS', 'WARMUP', 'READY'] }
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
        status: 'READY' // The SSE route polls Match updates and will auto-broadcast this state change
      },
      include: { court: true }
    });

    // Fire Phase 4.3 Automated Alert for Referee PWA
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    fetch(`${origin}/api/notifications/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId: dispatchedMatch.id,
        courtName: dispatchedMatch.court?.name || 'TBD',
        action: 'REPORT_TO_COURT'
      })
    }).catch(e => console.error("Failed to fire push notification webhook", e));

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

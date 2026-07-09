import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';



/**
 * Pillar 37: Incident & Emergency Protocol Engine
 * Logs medical timeouts, disputes, or code violations for liability protection.
 */
export async function POST(request: Request) {
  const authResult = await requireAuth(['REFEREE', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { matchId, reportedBy, incidentType, description } = await request.json();

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: { tournamentId: true }
    });
    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

    const incident = await prisma.incidentReport.create({
      data: { tournamentId: match.tournamentId, matchId, reportedBy, incidentType, description }
    });

    // If MEDICAL, this would also trigger the Referee UI timer protocol (e.g. 3-minute physio window)
    return NextResponse.json({ 
      success: true, 
      incident,
      message: `${incidentType} protocol activated and logged to digital paper trail.`
    });
  } catch (error) {
    logger.error('[incidents] Failed to log incident', {}, error);
    return NextResponse.json({ error: 'Failed to log incident' }, { status: 400 });
  }
}

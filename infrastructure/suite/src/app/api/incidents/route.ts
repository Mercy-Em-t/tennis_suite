import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Pillar 37: Incident & Emergency Protocol Engine
 * Logs medical timeouts, disputes, or code violations for liability protection.
 */
export async function POST(request: Request) {
  try {
    const { matchId, reportedBy, incidentType, description } = await request.json();

    const incident = await prisma.incidentReport.create({
      data: { matchId, reportedBy, incidentType, description }
    });

    // If MEDICAL, this would also trigger the Referee UI timer protocol (e.g. 3-minute physio window)
    return NextResponse.json({ 
      success: true, 
      incident,
      message: `${incidentType} protocol activated and logged to digital paper trail.`
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log incident' }, { status: 400 });
  }
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';




export async function POST(request: Request) {
  try {
    const { matchId, reportedBy, incidentType, description } = await request.json();

    if (!matchId || !incidentType || !description) {
      return NextResponse.json({ error: 'Missing incident details' }, { status: 400 });
    }

    // Wrap in transaction: Create Report + Create Agent Resolution Log
    const result = await prisma.$transaction(async (tx) => {
      // 1. Log the Incident
      const incident = await tx.incidentReport.create({
        data: {
          matchId,
          reportedBy: reportedBy || 'SYSTEM',
          incidentType,
          description
        }
      });

      // 2. Mock Agent Resolution Logic based on Keywords
      let aiAction = 'MATCH_PAUSED';
      let aiDetails = 'Agent requires human Referee intervention.';
      const descLower = description.toLowerCase();

      if (descLower.includes('dispute') || descLower.includes('score')) {
        aiAction = 'SCORE_CORRECTED';
        aiDetails = 'Agent resolved score dispute based on point-by-point telemetry log.';
      } else if (descLower.includes('injury') || descLower.includes('medical')) {
        aiAction = 'MEDICAL_TIMEOUT';
        aiDetails = 'Agent initiated standard 3-minute medical timeout protocol.';
      } else if (descLower.includes('weather') || descLower.includes('rain')) {
        aiAction = 'MATCH_PAUSED';
        aiDetails = 'Agent paused match and notified players of weather delay.';
      }

      // 3. Write Audit Log back to Match
      const audit = await tx.auditLog.create({
        data: {
          matchId,
          action: aiAction,
          details: `[AI RESOLUTION] ${aiDetails} (Ref: Incident ${incident.id})`
        }
      });

      return { incident, audit };
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Incident reported and Agent resolution applied.',
      resolution: result.audit 
    });

  } catch (error) {
    console.error('[agents/resolution/POST]', error);
    return NextResponse.json({ error: 'Failed to process incident' }, { status: 500 });
  }
}

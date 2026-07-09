import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.roles.includes('DIRECTOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { incidentId, resolutionDetails, matchId, actionTaken } = await request.json();
    if (!incidentId || !resolutionDetails) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // For this demo, we assume the incident is resolved by deleting it or marking it resolved 
      // (schema doesn't have a status field for IncidentReport yet, so we could just append to description)
      const incident = await tx.incidentReport.findUnique({ where: { id: incidentId } });
      if (!incident) throw new Error("Incident not found");

      await tx.incidentReport.update({
        where: { id: incidentId },
        data: {
          description: incident.description + `\n[RESOLVED BY DELEGATE]: ${resolutionDetails}`
        }
      });

      // If actionTaken involves a match state change
      if (actionTaken === 'RESUME_MATCH' && matchId) {
        await tx.match.update({
          where: { id: matchId },
          data: { status: 'IN_PROGRESS', pauseReason: null }
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'DISPUTE_RESOLVED',
          details: `Dispute ${incidentId} resolved. Action: ${actionTaken}. Notes: ${resolutionDetails}`,
          userId: payload.sub,
          matchId: matchId || null
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Dispute Resolution API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { matchId, action, details, pauseReason } = await request.json();

    if (action === 'MATCH_PAUSED') {
      await prisma.match.update({
        where: { id: matchId },
        data: { 
          status: 'PAUSED',
          pauseReason: pauseReason || 'MANUAL_OVERRIDE'
        }
      });
    }

    const log = await prisma.auditLog.create({
      data: { matchId, action, details }
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process dispute or audit log' }, { status: 400 });
  }
}

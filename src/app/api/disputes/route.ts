import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';



export async function POST(request: Request) {
  const authResult = await requireAuth(['REFEREE', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

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
    logger.error('[disputes] Failed to process dispute', {}, error);
    return NextResponse.json({ error: 'Failed to process dispute or audit log' }, { status: 400 });
  }
}

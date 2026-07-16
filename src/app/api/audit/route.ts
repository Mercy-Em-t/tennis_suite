import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const auditLog = await prisma.auditLog.create({
      data: {
        userId: body.userId || null,
        action: body.action || 'UNKNOWN',
        details: JSON.stringify({
          message: body.details || '',
          role: body.role || 'UNKNOWN',
          resource: body.resource || 'UNKNOWN',
          ipAddress: body.ipAddress || 'UNKNOWN',
          userAgent: body.userAgent || 'UNKNOWN',
        }),
      },
    });

    return NextResponse.json({ success: true, log: auditLog });
  } catch (error: any) {
    logger.error('[api/audit] Failed to create audit log', {}, error);
    return NextResponse.json({ error: 'Failed to record audit log' }, { status: 500 });
  }
}

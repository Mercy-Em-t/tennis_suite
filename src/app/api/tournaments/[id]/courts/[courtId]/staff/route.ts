import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';



export async function PATCH(request: Request, { params }: { params: Promise<{ id: string, courtId: string }> }) {
  const authResult = await requireAuth(['HOST', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id, courtId } = await params;
    const { refereeId, marshallId } = await request.json();

    const updateData: any = {};
    if (refereeId !== undefined) updateData.refereeId = refereeId || null;
    if (marshallId !== undefined) updateData.marshallId = marshallId || null;

    const updatedCourt = await prisma.court.update({
      where: { id: courtId },
      data: updateData,
      include: { referee: true, marshall: true }
    });

    return NextResponse.json({ success: true, court: updatedCourt });
  } catch (error: any) {
    logger.error('[courts/staff/PATCH] Failed', {}, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

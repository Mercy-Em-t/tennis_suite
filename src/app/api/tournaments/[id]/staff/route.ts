import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';



export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const user = (authResult as any).user;
    const { role } = await request.json(); // REFEREE, MARSHALL, ADMIN

    if (!role) return NextResponse.json({ error: 'Role is required' }, { status: 400 });

    // Users apply for a role
    const staff = await prisma.staff.create({
      data: {
        name: user.name || user.email,
        role: role,
        userId: user.id,
        tournamentId: id,
        status: 'PENDING'
      }
    });

    logger.info(`User ${user.id} applied for ${role} in tournament ${id}`);
    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    logger.error('[staff/apply/POST] Failed', {}, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(['HOST', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const { staffId, status, directEmail, role } = await request.json();

    // Direct Invite Bypass
    if (directEmail && role) {
      const targetUser = await prisma.user.findUnique({ where: { email: directEmail } });
      if (!targetUser) return NextResponse.json({ error: 'User not found in system' }, { status: 404 });
      
      const newStaff = await prisma.staff.create({
        data: {
          name: targetUser.name || targetUser.email,
          role,
          userId: targetUser.id,
          tournamentId: id,
          status: 'APPROVED'
        }
      });
      return NextResponse.json({ success: true, staff: newStaff });
    }

    // Approve/Reject existing application
    if (!staffId || !status) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    const updatedStaff = await prisma.staff.update({
      where: { id: staffId },
      data: { status }
    });

    return NextResponse.json({ success: true, staff: updatedStaff });
  } catch (error: any) {
    logger.error('[staff/PATCH] Failed', {}, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

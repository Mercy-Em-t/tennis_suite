import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function PATCH(request: Request, props: { params: Promise<{ id: string, teamId: string }> }) {
  try {
    const params = await props.params;
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.roles.some(r => ['HOST', 'ADMIN'].includes(r))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status } = await request.json();

    const team = await prisma.team.update({
      where: { id: params.teamId },
      data: { status }
    });

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error('[tournaments/id/teams/teamId/PATCH]', error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}

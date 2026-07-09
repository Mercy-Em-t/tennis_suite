import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const body = await request.json();
    const isCheckedIn = body.isCheckedIn === true;

    // Verify user is in the tournament and find their team
    const team = await prisma.team.findFirst({
      where: {
        tournamentId: params.id,
        players: { some: { id: payload.sub } }
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Not registered in this tournament' }, { status: 403 });
    }

    // Update the checkin status
    const updatedTeam = await prisma.team.update({
      where: { id: team.id },
      data: { isCheckedIn }
    });

    return NextResponse.json({ success: true, isCheckedIn: updatedTeam.isCheckedIn });

  } catch (error) {
    console.error('[player/tournaments/checkin]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

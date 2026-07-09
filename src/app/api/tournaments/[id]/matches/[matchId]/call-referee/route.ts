import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';




export async function POST(request: Request, props: { params: Promise<{ id: string, matchId: string }> }) {
  try {
    const params = await props.params;
    const { id, matchId } = params;

    // RBAC: Check for Player-Ump
    const cookieStore = await require('next/headers').cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await require('@/lib/auth').verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const matchToVerify = await prisma.match.findUnique({
      where: { id: matchId }
    });

    if (!matchToVerify) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

    let authorized = false;
    if (payload.roles.includes('HOST') || payload.roles.includes('REFEREE')) {
      authorized = true; 
    } else if (payload.roles.includes('PLAYER')) {
      if (matchToVerify.umpireId === payload.sub) {
        authorized = true;
      }
    }

    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden. Not the designated umpire.' }, { status: 403 });
    }

    // Set status to REQUIRES_INTERVENTION
    await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'REQUIRES_INTERVENTION',
        interventionReason: 'PLAYER_REQUEST',
        pauseReason: 'Umpire called for Referee assistance.'
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[call-referee]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

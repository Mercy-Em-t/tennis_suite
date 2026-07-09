import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { verifyToken } from '@/lib/auth';



export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin || pin.length !== 6) {
      return NextResponse.json({ error: 'Invalid PIN format' }, { status: 400 });
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    // Find the match with this umpire code
    const match = await prisma.match.findFirst({
      where: { umpireCode: pin }
    });

    if (!match) {
      return NextResponse.json({ error: 'No match found for this PIN. Check with your referee.' }, { status: 404 });
    }

    // Assign the player as the umpire
    await prisma.match.update({
      where: { id: match.id },
      data: { 
        umpireId: payload.sub,
        // Optional: We can choose to clear the PIN after use, or keep it so they can log back in.
        // We will keep it so they can reconnect if they refresh.
      }
    });

    return NextResponse.json({
      success: true,
      matchId: match.id,
      tournamentId: match.tournamentId
    });

  } catch (error) {
    console.error('[player/umpire/claim]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    let userId = null;

    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        userId = payload.sub;
      }
    }

    const { tournamentId, name, categories } = await request.json();

    if (!tournamentId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Atomic transaction to create the Team and assign to categories
    const newTeam = await prisma.$transaction(async (tx) => {
      // 1. Create the team
      const team = await tx.team.create({
        data: {
          franchiseName: name,
          tournamentId,
          status: 'ACTIVE',
          players: userId ? {
            connect: { id: userId }
          } : undefined
        }
      });

      // 3. Optional: Link to categories if implemented in the schema
      // This is a placeholder for wherever categories are tracked for the team

      return team;
    });

    return NextResponse.json({ success: true, team: newTeam });
  } catch (error) {
    console.error('[checkout/finalize]', error);
    return NextResponse.json({ error: 'Failed to finalize checkout' }, { status: 500 });
  }
}

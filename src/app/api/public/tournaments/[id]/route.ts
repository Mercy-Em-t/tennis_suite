import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';




export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        matches: {
          include: {
            teamA: true,
            teamB: true,
            court: true,
          }
        },
        teams: true,
        pools: {
          include: { poolTeams: { include: { team: true } } }
        }
      }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, tournament });
  } catch (error) {
    console.error('[public/tournaments/GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

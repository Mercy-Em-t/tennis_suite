import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    if (!tournamentId) {
      return NextResponse.json({ error: 'Missing tournamentId' }, { status: 400 });
    }

    const freeAgents = await prisma.freeAgent.findMany({
      where: { 
        status: 'AVAILABLE',
        tournamentId: tournamentId
      },
      take: 10
    });

    return NextResponse.json({ success: true, agents: freeAgents });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Free Agents' }, { status: 500 });
  }
}

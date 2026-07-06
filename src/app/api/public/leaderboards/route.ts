import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';




export async function GET() {
  try {
    // Fetch top 100 players ordered by globalXp descending
    const topPlayers = await prisma.user.findMany({
      where: {
        role: 'PLAYER'
      },
      orderBy: {
        globalXp: 'desc'
      },
      take: 100,
      select: {
        id: true,
        name: true,
        globalXp: true,
        badges: true
      }
    });

    return NextResponse.json({ success: true, leaderboard: topPlayers });
  } catch (error) {
    console.error('[public/leaderboards/GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

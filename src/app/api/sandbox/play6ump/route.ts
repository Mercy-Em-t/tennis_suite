import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Create a tournament
    const tournament = await prisma.tournament.create({
      data: {
        name: 'Play6ump Test Tournament',
        formatType: 'Fast4',
        isActive: true,
        maxTeams: 4
      },
    });

    // 2. Create the target Player (User)
    const playerUser = await prisma.user.create({
      data: {
        name: 'Adaptive Player',
        email: `adaptive.player.${Date.now()}@example.com`,
        role: 'PLAYER'
      }
    });

    // 3. Create Teams
    const teamA = await prisma.team.create({
      data: {
        franchiseName: 'Team Adaptive',
        tournamentId: tournament.id,
        players: { connect: { id: playerUser.id } } // Player is on Team A
      }
    });
    
    const teamB = await prisma.team.create({
      data: {
        franchiseName: 'Team Opponent',
        tournamentId: tournament.id,
      }
    });

    // 4. Create an IN_PROGRESS Match with NO umpire currently
    const match = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        teamAId: teamA.id,
        teamBId: teamB.id,
        status: 'IN_PROGRESS',
        scoreState: JSON.stringify({ setsA: 0, setsB: 0, gamesA: 2, gamesB: 2, pointsA: "30", pointsB: "15" }),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Play6ump Sandbox environment created.',
      tournamentId: tournament.id,
      matchId: match.id,
      playerId: playerUser.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

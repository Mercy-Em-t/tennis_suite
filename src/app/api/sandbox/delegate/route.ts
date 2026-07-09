import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Create a tournament
    const tournament = await prisma.tournament.create({
      data: {
        name: 'Delegate Override Test',
        formatType: 'Fast4',
        isActive: true,
        maxTeams: 4
      },
    });

    // 2. Create the target Delegate (User)
    const delegateUser = await prisma.user.create({
      data: {
        name: 'Tournament Delegate',
        email: `delegate.${Date.now()}@example.com`,
        role: 'DIRECTOR'
      }
    });

    // 3. Create Teams
    const teamA = await prisma.team.create({
      data: { franchiseName: 'Team Alpha', tournamentId: tournament.id }
    });
    
    const teamB = await prisma.team.create({
      data: { franchiseName: 'Team Beta', tournamentId: tournament.id }
    });

    // 4. Create a Pool
    const pool = await prisma.pool.create({
      data: {
        name: 'Pool A',
        tournamentId: tournament.id,
        category: 'Open',
      }
    });

    await prisma.poolTeam.create({ data: { poolId: pool.id, teamId: teamA.id } });
    await prisma.poolTeam.create({ data: { poolId: pool.id, teamId: teamB.id } });

    // 5. Create a COMPLETED Match where Team A won incorrectly
    const match = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        poolId: pool.id,
        teamAId: teamA.id,
        teamBId: teamB.id,
        status: 'COMPLETED',
        winnerId: teamA.id,
        scoreState: JSON.stringify({ setsA: 2, setsB: 1, gamesA: 4, gamesB: 2, pointsA: "0", pointsB: "0" }),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Delegate Sandbox environment created.',
      tournamentId: tournament.id,
      matchId: match.id,
      poolId: pool.id,
      delegateId: delegateUser.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

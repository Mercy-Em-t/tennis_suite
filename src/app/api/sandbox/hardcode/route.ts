import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Create a hardcoded tournament & court
    const tournament = await prisma.tournament.create({
      data: {
        name: 'Automaton Sandbox Test',
        formatType: 'Fast4',
        isActive: true,
        maxTeams: 4
      },
    });

    const court = await prisma.court.create({
      data: {
        name: 'Center Court (Automaton)',
        tournamentId: tournament.id,
      }
    });

    // 2. Create the Pool
    const pool = await prisma.pool.create({
      data: {
        name: 'Pool A',
        category: 'Sandbox Open',
        tournamentId: tournament.id,
      }
    });

    // 3. Create Teams
    const teams = await Promise.all([
      prisma.team.create({ data: { franchiseName: 'Team Alpha', tournamentId: tournament.id } }),
      prisma.team.create({ data: { franchiseName: 'Team Bravo', tournamentId: tournament.id } }),
      prisma.team.create({ data: { franchiseName: 'Team Charlie', tournamentId: tournament.id } }),
      prisma.team.create({ data: { franchiseName: 'Team Delta', tournamentId: tournament.id } }),
    ]);

    // 4. Link Teams to Pool
    await Promise.all(teams.map(team => 
      prisma.poolTeam.create({
        data: {
          poolId: pool.id,
          teamId: team.id,
          stats: JSON.stringify({ wins: 0, losses: 0, setsDiff: 0, gamesDiff: 0 })
        }
      })
    ));

    // 5. Create Completed Matches (Simulating past history)
    // Alpha vs Bravo (Alpha won)
    await prisma.match.create({
      data: {
        tournamentId: tournament.id, poolId: pool.id, stage: 'POOL',
        teamAId: teams[0].id, teamBId: teams[1].id, winnerId: teams[0].id, status: 'COMPLETED',
        scoreState: JSON.stringify({ setsA: 2, setsB: 0, gamesA: 8, gamesB: 4, pointsA: "0", pointsB: "0" })
      }
    });
    
    // Charlie vs Delta (Charlie won)
    await prisma.match.create({
      data: {
        tournamentId: tournament.id, poolId: pool.id, stage: 'POOL',
        teamAId: teams[2].id, teamBId: teams[3].id, winnerId: teams[2].id, status: 'COMPLETED',
        scoreState: JSON.stringify({ setsA: 2, setsB: 1, gamesA: 10, gamesB: 8, pointsA: "0", pointsB: "0" })
      }
    });

    // 6. Create the LAST Pending Pool Match (The one we will finalize)
    // Alpha vs Charlie (The decider)
    const pendingMatch = await prisma.match.create({
      data: {
        tournamentId: tournament.id, poolId: pool.id, stage: 'POOL',
        teamAId: teams[0].id, teamBId: teams[2].id, status: 'IN_PROGRESS',
        courtId: court.id,
        scoreState: JSON.stringify({ setsA: 1, setsB: 1, gamesA: 4, gamesB: 4, pointsA: "40", pointsB: "30" }), // Match point Alpha
      }
    });

    // 7. Create Pre-allocated Knockout Matches
    // Semi-Final 1 expects Pool A Pos 1 vs Pool B Pos 2
    const sf1 = await prisma.match.create({
      data: {
        tournamentId: tournament.id, stage: 'SEMI',
        placeholderA: 'Pool A Pos 1', placeholderB: 'Pool B Pos 2',
        status: 'SCHEDULED',
        scoreState: JSON.stringify({ setsA: 0, setsB: 0, gamesA: 0, gamesB: 0, pointsA: "0", pointsB: "0" })
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Automaton Sandbox environment created.',
      tournamentId: tournament.id,
      poolId: pool.id,
      pendingMatchId: pendingMatch.id,
      knockoutMatchId: sf1.id,
      courtId: court.id
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

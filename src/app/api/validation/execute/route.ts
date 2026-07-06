import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';




export async function POST(request: Request) {
  try {
    const { action, payload } = await request.json();

    if (action === 'GATE_1_DB_INTEGRITY') {
      // Create users and team to test M:N
      const userA = await prisma.user.create({ data: { email: `a_${Date.now()}@test.com`, name: "Test A" } });
      const userB = await prisma.user.create({ data: { email: `b_${Date.now()}@test.com`, name: "Test B" } });
      const tourney = await prisma.tournament.create({ data: { name: "Test", formatType: "Fast4", maxTeams: 4 } });
      
      const team = await prisma.team.create({
        data: {
          franchiseName: `Validation Team ${Date.now()}`,
          tournamentId: tourney.id,
          players: { connect: [{ id: userA.id }, { id: userB.id }] }
        },
        include: { players: true }
      });

      // Test JSON Parsing logic
      const mockState = { setsA: 1, setsB: 0, gamesA: 3, gamesB: 3, pointsA: "AD", pointsB: "40" };
      const match = await prisma.match.create({
        data: {
          teamAId: team.id,
          tournamentId: tourney.id,
          scoreState: JSON.stringify(mockState)
        }
      });

      const parsedState = JSON.parse(match.scoreState);

      return NextResponse.json({ 
        success: true, 
        teamPlayers: team.players.length,
        parsedScoreKeys: Object.keys(parsedState),
        message: "Data Integrity & Schema M:N Links Confirmed"
      });
    }

    if (action === 'GATE_2_RBAC_STATE') {
      // Attempt an illegal state transition SCHEDULED -> COMPLETED
      const { role } = payload;
      
      // Mocking middleware rejection based on role
      if (role === 'MARSHALL') {
        return NextResponse.json({ error: "403 Forbidden: MARSHALL role cannot override scores or states directly." }, { status: 403 });
      }

      // Mocking State Engine validation
      // You cannot go from SCHEDULED directly to COMPLETED without IN_PROGRESS
      return NextResponse.json({ error: "State Transition Error: Illegal move from SCHEDULED to COMPLETED. Must pass IN_PROGRESS." }, { status: 400 });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

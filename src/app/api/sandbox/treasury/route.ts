import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create a new tournament for Treasury testing
    const tournament = await prisma.tournament.create({
      data: {
        name: 'Rainmaker Open 2026',
        formatType: 'Standard',
        isActive: true,
        maxTeams: 16,
        prizeMoney: '10000',
      },
    });

    // Create 3 teams that have ALREADY PAID
    const paidTeams = await Promise.all([
      prisma.team.create({ data: { franchiseName: 'Paid Team 1', tournamentId: tournament.id, paymentStatus: 'REGISTERED' } }),
      prisma.team.create({ data: { franchiseName: 'Paid Team 2', tournamentId: tournament.id, paymentStatus: 'REGISTERED' } }),
      prisma.team.create({ data: { franchiseName: 'Paid Team 3', tournamentId: tournament.id, paymentStatus: 'REGISTERED' } }),
    ]);

    // Create 1 team that is PENDING_PAYMENT (Our test target)
    const pendingTeam = await prisma.team.create({
      data: {
        franchiseName: 'Pending Test Team',
        tournamentId: tournament.id,
        paymentStatus: 'PENDING_PAYMENT',
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Treasury Sandbox environment created.',
      tournamentId: tournament.id,
      pendingTeamId: pendingTeam.id,
      paidTeamsCount: paidTeams.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

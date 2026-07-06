import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { verifyToken } from '@/lib/auth';



export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    // Ensure user is actually in this tournament
    const team = await prisma.team.findFirst({
      where: {
        tournamentId: params.id,
        players: { some: { id: payload.id } }
      },
      include: {
        tournament: true,
        matchesAsTeamA: { include: { teamB: true, court: true } },
        matchesAsTeamB: { include: { teamA: true, court: true } },
        poolTeams: {
          include: {
            pool: { include: { poolTeams: { include: { team: true } } } }
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Not registered in this tournament' }, { status: 403 });
    }

    // Build the specific schedule
    const matchesA = team.matchesAsTeamA.map(m => ({ ...m, opponent: m.teamB?.franchiseName || 'TBD', isTeamA: true }));
    const matchesB = team.matchesAsTeamB.map(m => ({ ...m, opponent: m.teamA?.franchiseName || 'TBD', isTeamA: false }));
    const schedule = [...matchesA, ...matchesB].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      tournament: {
        id: team.tournament.id,
        name: team.tournament.name,
        status: team.tournament.isActive ? 'ACTIVE' : 'COMPLETED',
        formatType: team.tournament.formatType,
        location: team.tournament.location,
        logoUrl: team.tournament.logoUrl,
        sponsorUrl: team.tournament.sponsorUrl,
        contactEmail: team.tournament.contactEmail,
        contactPhone: team.tournament.contactPhone,
        prizeMoney: team.tournament.prizeMoney,
        stationInfo: team.tournament.stationInfo,
        scoringRules: team.tournament.scoringRules,
      },
      team: {
        id: team.id,
        franchiseName: team.franchiseName,
        isCheckedIn: team.isCheckedIn
      },
      pool: team.poolTeams[0]?.pool || null,
      schedule
    });

  } catch (error) {
    console.error('[player/tournaments/GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

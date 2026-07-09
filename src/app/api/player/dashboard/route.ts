import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { verifyToken } from '@/lib/auth';



export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    // Fetch User and their Teams with Matches
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        teams: {
          include: {
            tournament: true,
            matchesAsTeamA: true,
            matchesAsTeamB: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch Upcoming Tournaments (registration not CLOSED)
    const upcomingTournaments = await prisma.tournament.findMany({
      where: {
        registrationPhase: { not: 'CLOSED' }
      },
      select: {
        id: true,
        name: true,
        formatType: true,
        startDate: true,
        registrationPhase: true,
        location: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    const myTournaments = user.teams.map(t => {
      const allMatches = [...t.matchesAsTeamA, ...t.matchesAsTeamB];
      const matchesPlayed = allMatches.filter(m => m.status === 'COMPLETED').length;
      
      const pendingMatches = allMatches.filter(m => ['PENDING', 'SCHEDULED', 'READY'].includes(m.status));
      // Sort by creation date or a hypothetical scheduledTime (using createdAt for now as proxy)
      pendingMatches.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      let nextMatchText = 'Awaiting Draw';
      if (pendingMatches.length > 0) {
        const next = pendingMatches[0];
        if (next.status === 'READY') nextMatchText = 'REPORT TO COURT';
        else if (next.status === 'SCHEDULED') nextMatchText = 'Scheduled (Up Next)';
        else nextMatchText = 'Pending Scheduling';
      } else if (t.tournament.isActive && allMatches.length > 0) {
        nextMatchText = 'Awaiting Next Round';
      } else if (!t.tournament.isActive) {
        nextMatchText = 'Tournament Concluded';
      }

      return {
        teamId: t.id,
        franchiseName: t.franchiseName,
        tournamentId: t.tournament.id,
        tournamentName: t.tournament.name,
        status: t.tournament.isActive ? 'ACTIVE' : 'COMPLETED',
        matchesPlayed,
        nextMatchText
      };
    });

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        globalXp: user.globalXp,
        badges: JSON.parse(user.badges || '[]')
      },
      myTournaments,
      upcomingTournaments
    });

  } catch (error) {
    console.error('[player/dashboard]', error);
    return NextResponse.json({ error: 'Failed to fetch player data' }, { status: 500 });
  }
}

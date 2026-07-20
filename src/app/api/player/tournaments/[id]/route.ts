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
    if (!payload || !payload.sub) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    if (params.id.startsWith('mock-sandbox-')) {
      const mockType = params.id.replace('mock-sandbox-', '');
      const scheduleMap: Record<string, any[]> = {
        'pools': [
          { id: '1', status: 'SCHEDULED', court: { name: 'Court 1' }, startTime: new Date().toISOString(), opponent: 'TBD Team' },
          { id: '2', status: 'SCHEDULED', court: null, startTime: null, opponent: 'Rival 2' }
        ],
        'knockouts': [
          { id: '3', status: 'COMPLETED', court: { name: 'Court 3' }, scoreA: 2, scoreB: 1, isTeamA: true, opponent: 'Rival 1', durationSec: 3600, createdAt: new Date(Date.now() - 86400000).toISOString() },
          { id: '4', status: 'SCHEDULED', court: { name: 'Center Court' }, startTime: new Date().toISOString(), opponent: 'TBD (Semi Final)' }
        ],
        'complete': [
          { id: '5', status: 'COMPLETED', court: { name: 'Court 1' }, scoreA: 2, scoreB: 0, isTeamA: true, opponent: 'Rival 1', durationSec: 3200, createdAt: new Date(Date.now() - 172800000).toISOString() },
          { id: '6', status: 'COMPLETED', court: { name: 'Center Court' }, scoreA: 2, scoreB: 1, isTeamA: true, opponent: 'Final Boss', durationSec: 4100, createdAt: new Date(Date.now() - 86400000).toISOString() }
        ]
      };
      
      const names: Record<string, string> = {
        'pools': 'Sandbox Rivals (Pools Stage)',
        'knockouts': 'Sandbox Rivals (Knockouts Stage)',
        'complete': 'Sandbox Rivals (Completed)'
      };

      return NextResponse.json({
        success: true,
        tournament: {
          id: params.id,
          name: names[mockType] || 'Sandbox Tournament',
          status: mockType === 'complete' ? 'COMPLETED' : 'ACTIVE',
          formatType: 'Pools & Knockouts',
          location: 'Sandbox Arena',
          logoUrl: '',
          sponsorUrl: '',
          contactEmail: 'sandbox@tennissuite.com',
          contactPhone: '',
          prizeMoney: '$1000',
          stationInfo: 'Head to the main desk to check in.',
          scoringRules: 'Best of 3 Sets',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          registrationPhase: 'OPEN',
          isActive: mockType !== 'pools',
          categories: "Men's Singles, Women's Singles",
          allowMultiCategory: true,
        },
        team: {
          id: 'sandbox-team',
          franchiseName: 'Sandbox Team',
          isCheckedIn: mockType !== 'pools',
          categories: JSON.stringify(["Men's Singles"]),
        },
        pool: mockType === 'pools' ? { name: 'Pool A', poolTeams: [] } : null,
        schedule: scheduleMap[mockType] || []
      });
    }

    // Ensure user is actually in this tournament
    const team = await prisma.team.findFirst({
      where: {
        tournamentId: params.id,
        players: { some: { id: payload.sub } }
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
        startDate: team.tournament.startDate,
        registrationPhase: team.tournament.registrationPhase,
        isActive: team.tournament.isActive,
        categories: team.tournament.categories,
        allowMultiCategory: team.tournament.allowMultiCategory,
      },
      team: {
        id: team.id,
        franchiseName: team.franchiseName,
        isCheckedIn: team.isCheckedIn,
        categories: team.categories,
      },
      pool: team.poolTeams[0]?.pool || null,
      schedule
    });

  } catch (error) {
    console.error('[player/tournaments/GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

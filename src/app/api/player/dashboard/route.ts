import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // 1. Get Token from Cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    // 2. Fetch User and their Teams
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        teams: {
          include: {
            tournament: true,
            matchesAsTeamA: { include: { teamB: true, court: true } },
            matchesAsTeamB: { include: { teamA: true, court: true } }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Process matches for the active tournament
    // Assuming the first team is the active one for MVP
    const activeTeam = user.teams.find(t => t.tournament.isActive) || user.teams[0];
    
    let schedule: any[] = [];
    if (activeTeam) {
      const matchesA = activeTeam.matchesAsTeamA.map(m => ({ ...m, opponent: m.teamB?.franchiseName || 'TBD' }));
      const matchesB = activeTeam.matchesAsTeamB.map(m => ({ ...m, opponent: m.teamA?.franchiseName || 'TBD' }));
      schedule = [...matchesA, ...matchesB].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        globalXp: user.globalXp,
        badges: JSON.parse(user.badges || '[]')
      },
      team: activeTeam ? {
        id: activeTeam.id,
        franchiseName: activeTeam.franchiseName,
        tournamentName: activeTeam.tournament.name
      } : null,
      schedule
    });

  } catch (error) {
    console.error('[player/dashboard]', error);
    return NextResponse.json({ error: 'Failed to fetch player data' }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
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

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const history = user.teams.map(t => {
      const allMatches = [...t.matchesAsTeamA, ...t.matchesAsTeamB];
      const matchesPlayed = allMatches.filter(m => m.status === 'COMPLETED').length;
      
      const pendingMatches = allMatches.filter(m => ['PENDING', 'SCHEDULED', 'READY'].includes(m.status));
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

      // Determine categorization
      let category = 'PAST';
      if (t.tournament.isActive) {
        category = 'CURRENT';
      } else if (t.tournament.registrationPhase !== 'CLOSED' && !t.tournament.isActive) {
        // Not active yet, but registered
        category = 'UPCOMING';
      }

      return {
        teamId: t.id,
        franchiseName: t.franchiseName,
        tournamentId: t.tournament.id,
        tournamentName: t.tournament.name,
        status: t.tournament.isActive ? 'ACTIVE' : 'COMPLETED',
        formatType: t.tournament.formatType,
        location: t.tournament.location,
        matchesPlayed,
        nextMatchText,
        category,
        createdAt: t.createdAt
      };
    });

    // Sort by newest first
    history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, history });

  } catch (error) {
    console.error('[player/history]', error);
    return NextResponse.json({ error: 'Failed to fetch player history' }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    // 1. Fetch all completed matches for the tournament
    const matches = await prisma.match.findMany({
      where: {
        tournamentId: params.id,
        status: 'COMPLETED'
      },
      include: {
        teamA: true,
        teamB: true
      }
    });

    // 2. Fetch all teams to ensure teams with 0 matches are also on the leaderboard
    const allTeams = await prisma.team.findMany({
      where: { tournamentId: params.id }
    });

    const standingsMap = new Map<string, {
      teamId: string;
      franchiseName: string;
      matchesPlayed: number;
      wins: number;
      losses: number;
      setDiff: number;
      gameDiff: number;
    }>();

    // Initialize map
    for (const team of allTeams) {
      standingsMap.set(team.id, {
        teamId: team.id,
        franchiseName: team.franchiseName,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        setDiff: 0,
        gameDiff: 0
      });
    }

    // 3. Process each completed match
    for (const match of matches) {
      if (!match.teamAId || !match.teamBId) continue;
      
      const teamAStats = standingsMap.get(match.teamAId)!;
      const teamBStats = standingsMap.get(match.teamBId)!;

      const score = typeof match.scoreState === 'string' ? JSON.parse(match.scoreState) : match.scoreState;
      const setsA = score?.setsA || 0;
      const setsB = score?.setsB || 0;
      const gamesA = score?.gamesA || 0;
      const gamesB = score?.gamesB || 0;

      // Determine Winner
      if (setsA > setsB) {
        teamAStats.wins += 1;
        teamBStats.losses += 1;
      } else if (setsB > setsA) {
        teamBStats.wins += 1;
        teamAStats.losses += 1;
      }

      // Update Differentials
      teamAStats.setDiff += (setsA - setsB);
      teamBStats.setDiff += (setsB - setsA);

      teamAStats.gameDiff += (gamesA - gamesB);
      teamBStats.gameDiff += (gamesB - gamesA);

      teamAStats.matchesPlayed += 1;
      teamBStats.matchesPlayed += 1;
    }

    // 4. Convert to Array and Sort
    const leaderboard = Array.from(standingsMap.values()).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.setDiff !== a.setDiff) return b.setDiff - a.setDiff;
      
      // Head-to-Head Tiebreaker
      const h2hMatches = matches.filter(m => 
        (m.teamAId === a.teamId && m.teamBId === b.teamId) ||
        (m.teamAId === b.teamId && m.teamBId === a.teamId)
      );
      
      if (h2hMatches.length > 0) {
        let aWinsH2H = 0;
        let bWinsH2H = 0;
        for (const match of h2hMatches) {
          const score = typeof match.scoreState === 'string' ? JSON.parse(match.scoreState) : match.scoreState;
          const setsA = score?.setsA || 0;
          const setsB = score?.setsB || 0;
          if (match.teamAId === a.teamId) {
             if (setsA > setsB) aWinsH2H++; else if (setsB > setsA) bWinsH2H++;
          } else {
             if (setsA > setsB) bWinsH2H++; else if (setsB > setsA) aWinsH2H++;
          }
        }
        if (bWinsH2H !== aWinsH2H) return bWinsH2H - aWinsH2H;
      }

      // Game Differential Fallback
      return b.gameDiff - a.gameDiff;
    });

    return NextResponse.json({ success: true, leaderboard });

  } catch (error) {
    console.error('[tournaments/calculate-standings]', error);
    return NextResponse.json({ error: 'Failed to calculate standings' }, { status: 500 });
  }
}

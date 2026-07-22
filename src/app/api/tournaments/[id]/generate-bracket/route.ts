import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireTournamentAccess } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';
import { sendRawEmail } from '@/lib/mail/dispatch';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    
    // Allow global Host or approved Tournament Referee to generate bracket
    const authResult = await requireTournamentAccess(params.id, ['REFEREE']);
    if (authResult instanceof NextResponse) return authResult;

    // 0. Pre-flight Validation: Ensure ALL matches are COMPLETED
    const uncompletedMatches = await prisma.match.count({
      where: {
        tournamentId: params.id,
        status: { not: 'COMPLETED' }
      }
    });

    if (uncompletedMatches > 0) {
      return NextResponse.json({ error: 'All pool matches must be COMPLETED before generating the bracket.' }, { status: 400 });
    }

    // 1. Fetch completed matches to determine standings
    const matches = await prisma.match.findMany({
      where: {
        tournamentId: params.id,
        status: 'COMPLETED'
      }
    });

    const allTeams = await prisma.team.findMany({
      where: { tournamentId: params.id },
      include: { players: true }
    });

    if (allTeams.length < 2) {
      return NextResponse.json({ error: 'Not enough teams to generate a bracket.' }, { status: 400 });
    }

    // Initialize Map
    const standingsMap = new Map<string, { teamId: string, wins: number, setDiff: number, gameDiff: number }>();
    for (const team of allTeams) {
      standingsMap.set(team.id, { teamId: team.id, wins: 0, setDiff: 0, gameDiff: 0 });
    }

    // Tally metrics
    for (const match of matches) {
      if (!match.teamAId || !match.teamBId) continue;
      const teamAStats = standingsMap.get(match.teamAId)!;
      const teamBStats = standingsMap.get(match.teamBId)!;
      
      const score = JSON.parse(match.scoreState);
      const setsA = score.setsA || 0;
      const setsB = score.setsB || 0;
      const gamesA = score.gamesA || 0;
      const gamesB = score.gamesB || 0;

      if (setsA > setsB) teamAStats.wins++;
      else if (setsB > setsA) teamBStats.wins++;

      teamAStats.setDiff += (setsA - setsB);
      teamBStats.setDiff += (setsB - setsA);
      teamAStats.gameDiff += (gamesA - gamesB);
      teamBStats.gameDiff += (gamesB - gamesA);
    }

    // Sort to get Leaderboard
    const leaderboard = Array.from(standingsMap.values()).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.setDiff !== a.setDiff) return b.setDiff - a.setDiff;
      return b.gameDiff - a.gameDiff;
    });

    // 2. Bracket Sizing Logic
    // For MVP: if >= 8 teams -> Top 8 (Quarter-Finals). If >= 4 -> Top 4 (Semi-Finals). Else Top 2 (Final).
    let topN = 2;
    if (leaderboard.length >= 8) topN = 8;
    else if (leaderboard.length >= 4) topN = 4;

    const advancingTeams = leaderboard.slice(0, topN).map(t => t.teamId);

    // 3. Generate Bracket Matches
    const newMatches = [];
    if (topN === 8) {
      // Quarter Finals: 1v8, 4v5, 2v7, 3v6
      newMatches.push({ teamAId: advancingTeams[0], teamBId: advancingTeams[7], tournamentId: params.id, status: 'SCHEDULED' });
      newMatches.push({ teamAId: advancingTeams[3], teamBId: advancingTeams[4], tournamentId: params.id, status: 'SCHEDULED' });
      newMatches.push({ teamAId: advancingTeams[1], teamBId: advancingTeams[6], tournamentId: params.id, status: 'SCHEDULED' });
      newMatches.push({ teamAId: advancingTeams[2], teamBId: advancingTeams[5], tournamentId: params.id, status: 'SCHEDULED' });
    } else if (topN === 4) {
      // Semi Finals: 1v4, 2v3
      newMatches.push({ teamAId: advancingTeams[0], teamBId: advancingTeams[3], tournamentId: params.id, status: 'SCHEDULED' });
      newMatches.push({ teamAId: advancingTeams[1], teamBId: advancingTeams[2], tournamentId: params.id, status: 'SCHEDULED' });
    } else {
      // Final: 1v2
      newMatches.push({ teamAId: advancingTeams[0], teamBId: advancingTeams[1], tournamentId: params.id, status: 'SCHEDULED' });
    }

    // Save in transaction
    const createdMatches = await prisma.$transaction(
      newMatches.map(data => prisma.match.create({ data }))
    );

    // Notify all players about the draw
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sports.tmsavannah.com';
    const loginLink = `${origin}/login`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #d97706;">🏆 Tournament Draw Published!</h2>
        <p>The bracket for your tournament has been generated and published.</p>
        <p>Log in to your player dashboard to view your upcoming match schedule and opponents.</p>
        <p><a href="${loginLink}" style="background: #d97706; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View The Draw</a></p>
      </div>
    `;

    for (const team of allTeams) {
      for (const player of team.players) {
        sendRawEmail({
          to: player.email,
          subject: `🏆 Tournament Draw Published`,
          html
        }).catch(e => logger.error(`Failed to send draw notification to ${player.email}`, {}, e));
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Generated ${createdMatches.length} bracket matches for Top ${topN} teams.`,
      matches: createdMatches 
    });

  } catch (error) {
    console.error('[tournaments/generate-bracket/POST]', error);
    return NextResponse.json({ error: 'Failed to generate bracket' }, { status: 500 });
  }
}

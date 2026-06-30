import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { playerId, tournamentId, query } = await request.json();

    if (!playerId || !query) {
      return NextResponse.json({ error: 'Missing playerId or query' }, { status: 400 });
    }

    // 1. Fetch Context: Player's Team and Matches
    const user = await prisma.user.findUnique({
      where: { id: playerId },
      include: {
        teams: {
          include: {
            matchesAsTeamA: { where: { status: 'SCHEDULED' }, include: { court: true, teamB: true } },
            matchesAsTeamB: { where: { status: 'SCHEDULED' }, include: { court: true, teamA: true } }
          }
        }
      }
    });

    if (!user || user.teams.length === 0) {
      return NextResponse.json({ 
        success: true, 
        agentResponse: { responseMessage: "I couldn't find your active team registration. Please check your dashboard." } 
      });
    }

    const team = user.teams[0];
    const upcomingMatches = [...team.matchesAsTeamA, ...team.matchesAsTeamB];

    // 2. Deterministic Intent Routing
    let responseMessage = "I am an automated support agent. How can I help you today?";
    const qLower = query.toLowerCase();

    if (qLower.includes('schedule') || qLower.includes('next') || qLower.includes('when')) {
      if (upcomingMatches.length > 0) {
        const nextMatch = upcomingMatches[0];
        const opponent = nextMatch.teamA?.id === team.id ? nextMatch.teamB?.franchiseName : nextMatch.teamA?.franchiseName;
        const court = nextMatch.court ? nextMatch.court.name : 'TBD';
        responseMessage = `Your next match is against ${opponent || 'TBD'} on ${court}. Status is currently SCHEDULED.`;
      } else {
        responseMessage = "You have no upcoming matches scheduled at this time. Awaiting bracket generation.";
      }
    } else if (qLower.includes('rules') || qLower.includes('format')) {
      responseMessage = "This tournament uses the Fast4 format. Sets are played to 4 games, with a tiebreaker at 3-3. No-ad scoring is in effect.";
    }

    const aiResponseSchema = {
      intent: "INFERRED_FROM_DB",
      confidenceScore: 0.99,
      responseMessage,
      actionRequired: false
    };

    return NextResponse.json({ success: true, agentResponse: aiResponseSchema });
  } catch (error) {
    console.error('[agents/support/POST]', error);
    return NextResponse.json({ error: 'Failed to process agent query' }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';




export async function POST(request: Request) {
  try {
    const { teamId, query } = await request.json();

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required for personalized agent query' }, { status: 400 });
    }

    // Agent Intent Parsing (Stubbed for robust DB routing first)
    // If the query asks for "schedule", "time", "court", or "next match", we route to Match lookup.
    const lowerQuery = query?.toLowerCase() || "";
    const isScheduleQuery = lowerQuery.includes('time') || lowerQuery.includes('match') || lowerQuery.includes('when') || lowerQuery.includes('court') || lowerQuery.includes('schedule');

    if (isScheduleQuery) {
      // Find the player's next SCHEDULED match
      const nextMatch = await prisma.match.findFirst({
        where: {
          OR: [
            { teamAId: teamId },
            { teamBId: teamId }
          ],
          status: 'SCHEDULED'
        },
        include: {
          court: true,
          tournament: true,
          teamA: true,
          teamB: true
        },
        orderBy: {
          createdAt: 'asc' // Assume the earliest scheduled match is next
        }
      });

      if (nextMatch) {
        // Build the agent response from the database object
        const isTeamA = nextMatch.teamAId === teamId;
        const opponent = isTeamA ? nextMatch.teamB?.franchiseName : nextMatch.teamA?.franchiseName;
        const courtName = nextMatch.court?.name || 'TBD';
        const tournamentName = nextMatch.tournament?.name || 'the tournament';
        
        return NextResponse.json({
          success: true,
          message: `Your next match is against ${opponent || 'TBA'} at Court ${courtName} in ${tournamentName}. Please report 10 minutes prior.`
        });
      } else {
        return NextResponse.json({
          success: true,
          message: 'You have no scheduled matches at this time. Please wait for the next pool schedule to be released.'
        });
      }
    }

    // Default fallback
    return NextResponse.json({
      success: true,
      message: 'I am the Player Support Bot. Ask me about your match times!'
    });

  } catch (error: unknown) {
    console.error('[ai/agent/query/POST]', error);
    return NextResponse.json({ error: 'Agent encountered an error processing your query.' }, { status: 500 });
  }
}

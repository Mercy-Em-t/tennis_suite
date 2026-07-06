import { MessageObject } from './types';
import { prisma } from '@/lib/prisma';

export class ServerApplicationModule {
  public async processMessage(message: MessageObject) {
    // Route to appropriate logic based on the recipient
    if (message.header.recipient_id === 'SUPPORT_AGENT') {
      return this.handleSupportAgent(message.payload);
    }

    return {
      status: 'failure',
      error_code: 'ERR_PAYLOAD_MALFORMED',
      message: 'Unknown recipient or intent.',
      suggested_action: 'Check message recipient ID.'
    };
  }

  private async handleSupportAgent(payload: any) {
    const { playerId, tournamentId, query } = payload;
    
    if (!playerId || !query) {
      return {
        status: 'failure',
        error_code: 'ERR_PAYLOAD_MALFORMED',
        message: 'Missing playerId or query in payload',
        suggested_action: 'Ensure all required fields are present.'
      };
    }

    // Business Logic execution
    try {
      const user = await prisma.user.findUnique({
        where: { id: playerId },
        include: {
          teams: {
            include: {
              matchesAsTeamA: { where: { status: 'SCHEDULED' }, include: { court: true, teamB: true, teamA: true } },
              matchesAsTeamB: { where: { status: 'SCHEDULED' }, include: { court: true, teamA: true, teamB: true } }
            }
          }
        }
      });

      if (!user || user.teams.length === 0) {
        return {
          payload: {
            success: true,
            agentResponse: { responseMessage: "I couldn't find your active team registration. Please check your dashboard." }
          }
        };
      }

      const team = user.teams[0];
      const upcomingMatches = [...team.matchesAsTeamA, ...team.matchesAsTeamB];

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

      // Encapsulate response into payload
      return {
        payload: {
          success: true, 
          agentResponse: {
            intent: "INFERRED_FROM_DB",
            confidenceScore: 0.99,
            responseMessage,
            actionRequired: false
          }
        }
      };
    } catch (error) {
      console.error('[ServerApplicationModule]', error);
      return {
        status: 'failure',
        error_code: 'ERR_PAYLOAD_MALFORMED',
        message: 'Internal server error processing query.',
        suggested_action: 'Retry request later.'
      };
    }
  }
}

export const serverApplicationLayer = new ServerApplicationModule();

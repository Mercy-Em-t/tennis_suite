import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Pillar 29: Automated Social Media Syndication
 * Generates ready-to-post payloads for Twitter/X and Instagram APIs based on Match Events.
 */
export async function generateSocialPayload(matchId: string, eventType: 'MATCH_START' | 'MATCH_END' | 'UPSET') {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { teamA: true, teamB: true }
  });

  if (!match) return null;

  const teamAName = match.teamA?.franchiseName || 'Team A';
  const teamBName = match.teamB?.franchiseName || 'Team B';

  let tweetText = "";
  let graphicTemplate = "standard_score_overlay";

  switch(eventType) {
    case 'MATCH_START':
      tweetText = `🚨 LIVE NOW: ${teamAName} takes on ${teamBName} on Center Court! Tune in to the Broadcast. 🎾🎥 #TennisSuite`;
      graphicTemplate = "match_preview";
      break;
    case 'MATCH_END':
      let state = { setsA: 0, setsB: 0 };
      try { state = typeof match.scoreState === 'string' ? JSON.parse(match.scoreState) : match.scoreState; } catch(e){}
      const winner = state.setsA > state.setsB ? teamAName : teamBName;
      tweetText = `🏆 FINAL SCORE: ${winner} takes the victory ${Math.max(state.setsA, state.setsB)} sets to ${Math.min(state.setsA, state.setsB)}. What a match! #TennisSuite`;
      graphicTemplate = "final_score_card";
      break;
    case 'UPSET':
      tweetText = `🤯 UPSET ALERT! ${teamAName} vs ${teamBName} is heating up! You don't want to miss this finish. #TennisSuite`;
      graphicTemplate = "breaking_news_alert";
      break;
  }

  // In production, this would fire an axios.post() to the Twitter/Meta APIs
  return {
    platform: ['TWITTER', 'INSTAGRAM_STORY'],
    payloadText: tweetText,
    graphicTemplateId: graphicTemplate
  };
}

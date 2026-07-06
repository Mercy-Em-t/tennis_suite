import { prisma } from '@/lib/prisma';




/**
 * Pillar 25: Generative AI Cinematic Content Pipeline
 * Transforms raw Match metrics into structured prompts for an AI Video Generator or Human Editor.
 */
export async function generateCinematicPrompt(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { teamA: true, teamB: true, auditLogs: true }
  });

  if (!match) return null;

  // Derive narrative metadata
  let state = { setsA: 0, setsB: 0, gamesA: 0, gamesB: 0 };
  try { state = typeof match.scoreState === 'string' ? JSON.parse(match.scoreState) : match.scoreState; } catch(_e){}
  const totalPoints = state.gamesA + state.gamesB;
  const isBlowout = Math.abs(state.setsA - state.setsB) >= 2 || Math.abs(state.gamesA - state.gamesB) >= 6;
  const hadDispute = match.auditLogs.some(log => log.action === "SCORE_CORRECTED");

  let narrativeStyle = "Tense & Competitive";
  if (isBlowout) narrativeStyle = "Dominant Masterclass";
  if (hadDispute) narrativeStyle = "Gritty & Controversial";

  // Auto-generate the Script Prompt
  const prompt = `
[AI EDITOR PROMPT]
Target Vibe: ${narrativeStyle}
Teams: ${match.teamA?.franchiseName || 'Team A'} vs ${match.teamB?.franchiseName || 'Team B'}
Match Score: Sets: ${state.setsA}-${state.setsB}, Games: ${state.gamesA}-${state.gamesB}

Instructions:
1. Start with a slow-motion B-roll shot of the court.
2. Cut to the winning team's celebration (Timestamp anchor around Match Completion).
3. If 'Dominant Masterclass', use high-tempo bass-heavy audio. If 'Gritty', use cinematic percussion.
`;

  return { prompt, narrativeStyle, metadata: { totalPoints, isBlowout } };
}

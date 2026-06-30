/**
 * Pillar 31A: Algorithmic Outlier Detection (Anti-Sandbagging)
 * Flags players winning with mathematically suspicious margins for their bracket.
 */

export function detectSandbagging(recentScores: { scoreUs: number, scoreThem: number }[], registeredSkillTier: string) {
  if (recentScores.length < 3) return { isFlagged: false };

  let blowoutCount = 0;
  
  for (const match of recentScores) {
    const margin = match.scoreUs - match.scoreThem;
    // A margin of 6 or more in a set indicates a potential mismatch
    if (margin >= 6) blowoutCount++;
  }

  // If a "Novice" player blows out 3 opponents in a row, flag them
  const isSuspicious = (registeredSkillTier === 'NOVICE' && blowoutCount >= 3);

  return {
    isFlagged: isSuspicious,
    blowoutCount,
    recommendedAction: isSuspicious ? "PROMOTE_TO_INTERMEDIATE" : "NONE"
  };
}

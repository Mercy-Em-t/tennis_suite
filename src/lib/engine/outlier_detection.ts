/**
 * Pillar 31A: Algorithmic Outlier Detection (Anti-Smurfing/Botting)
 * Flags matches where score input frequency deviates from historical norms by more than 3 standard deviations (FR-4).
 */

export function detectFrequencyOutlier(
  inputTimestamps: number[],          // array of unix ms timestamps for each score entry
  historicalMeanMs: number,           // mean gap between inputs in similar matches
  historicalStdDevMs: number          // std dev of that gap
): { isFlagged: boolean; zScore: number } {
  if (inputTimestamps.length < 2) return { isFlagged: false, zScore: 0 };

  // Calculate mean gap between consecutive entries
  const gaps = inputTimestamps.slice(1).map((t, i) => t - inputTimestamps[i]);
  const meanGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;

  // Z-score: how many std devs away from historical mean
  const zScore = Math.abs(historicalMeanMs - meanGap) / historicalStdDevMs;

  return {
    isFlagged: zScore > 3,   // SRS FR-4: flag if > 3 std deviations
    zScore
  };
}

export function detectSandbagging(
  recentScores: { scoreUs: number; scoreThem: number }[],
  tier: string
): { isFlagged: boolean; blowoutCount: number; recommendedAction?: string } {
  if (recentScores.length < 3 || tier === 'ADVANCED') {
    return { isFlagged: false, blowoutCount: 0 };
  }

  let blowouts = 0;
  for (const score of recentScores) {
    if (score.scoreUs - score.scoreThem >= 5) { // Arbitrary blowout margin
      blowouts++;
    }
  }

  if (blowouts >= 3 && tier === 'NOVICE') {
    return { isFlagged: true, blowoutCount: blowouts, recommendedAction: 'PROMOTE_TO_INTERMEDIATE' };
  }

  return { isFlagged: false, blowoutCount: blowouts };
}

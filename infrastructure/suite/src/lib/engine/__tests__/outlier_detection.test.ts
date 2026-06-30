import { describe, it, expect } from 'vitest';
import { detectSandbagging } from '../outlier_detection';

describe('Anti-Sandbagging Engine (Pillar 31A)', () => {
  it('should flag a NOVICE player with 3 or more blowout wins', () => {
    const recentScores = [
      { scoreUs: 6, scoreThem: 0 },
      { scoreUs: 6, scoreThem: 0 },
      { scoreUs: 6, scoreThem: 0 }
    ];
    
    const result = detectSandbagging(recentScores, 'NOVICE');
    
    expect(result.isFlagged).toBe(true);
    expect(result.blowoutCount).toBe(3);
    expect(result.recommendedAction).toBe('PROMOTE_TO_INTERMEDIATE');
  });

  it('should not flag a NOVICE player if margins are narrow', () => {
    const recentScores = [
      { scoreUs: 6, scoreThem: 4 },
      { scoreUs: 7, scoreThem: 5 },
      { scoreUs: 6, scoreThem: 3 } // Only one blowout (margin >= 6? No, 6-3=3)
    ];
    
    const result = detectSandbagging(recentScores, 'NOVICE');
    
    expect(result.isFlagged).toBe(false);
    expect(result.blowoutCount).toBe(0);
  });

  it('should not flag an ADVANCED player even if they blow out opponents', () => {
    // Advanced players are expected to be good, don't auto-promote them unless there's a higher tier
    const recentScores = [
      { scoreUs: 6, scoreThem: 0 },
      { scoreUs: 6, scoreThem: 0 },
      { scoreUs: 6, scoreThem: 0 }
    ];
    
    const result = detectSandbagging(recentScores, 'ADVANCED');
    
    expect(result.isFlagged).toBe(false);
  });

  it('should safely ignore players with less than 3 matches recorded', () => {
    const recentScores = [
      { scoreUs: 6, scoreThem: 0 },
      { scoreUs: 6, scoreThem: 0 }
    ];
    
    const result = detectSandbagging(recentScores, 'NOVICE');
    expect(result.isFlagged).toBe(false);
  });
});

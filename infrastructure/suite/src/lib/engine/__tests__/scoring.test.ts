import { describe, it, expect } from 'vitest';
import { evaluateScore } from '../scoring';

describe('Scoring Engine (Pillar 17 & 40)', () => {
  it('should not complete the match if target score is not reached', () => {
    const result = evaluateScore(3, 2, 4, 2);
    expect(result.isCompleted).toBe(false);
  });

  it('should declare Team A the winner if they hit target with minimum lead', () => {
    const result = evaluateScore(4, 2, 4, 2);
    expect(result.isCompleted).toBe(true);
    expect(result.winnerId).toBe('A');
  });

  it('should require a 2-point lead by default (Deuce scenario)', () => {
    // Both hit 4, but no 2-point lead
    const result1 = evaluateScore(4, 3, 4, 2);
    expect(result1.isCompleted).toBe(false);

    // Team A gains advantage, then wins
    const result2 = evaluateScore(5, 3, 4, 2);
    expect(result2.isCompleted).toBe(true);
    expect(result2.winnerId).toBe('A');
  });

  it('should inject custom JSON rules (Sudden Death / No-Ad)', () => {
    // Score is 3-3, next point wins if noAdvantageScoring is true
    const customRules = { noAdvantageScoring: true };
    const result = evaluateScore(4, 3, 4, 2, customRules);
    
    expect(result.isCompleted).toBe(true); // Min lead overridden to 1
    expect(result.winnerId).toBe('A');
  });
});

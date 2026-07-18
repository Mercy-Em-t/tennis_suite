import { describe, it, expect } from 'vitest';
import { advanceScore, createInitialScoreState, DEFAULT_MATCH_FORMAT, TennisPoint } from '../scoring';

describe('Tennis Scoring FSM - Property-Based Testing', () => {
  
  const VALID_POINTS: TennisPoint[] = ['0', '15', '30', '40', 'AD'];

  it('maintains valid state across random matches (Standard Format)', { timeout: 60000 }, () => {
    // Flood the state machine with 100 random matches
    for (let i = 0; i < 100; i++) {
      let state = createInitialScoreState(Math.random() > 0.5 ? 'A' : 'B');
      let isCompleted = false;
      let pointsPlayed = 0;

      while (!isCompleted && pointsPlayed < 1000) { // arbitrary cap to prevent infinite loops
        const winner = Math.random() > 0.5 ? 'A' : 'B';
        const result = advanceScore(state, winner, DEFAULT_MATCH_FORMAT);
        state = result.newState;
        isCompleted = result.matchCompleted;
        pointsPlayed++;

        // Assert valid points
        expect(VALID_POINTS).toContain(state.pointsA);
        expect(VALID_POINTS).toContain(state.pointsB);
        
        // Assert no 'AD' for both simultaneously
        expect(!(state.pointsA === 'AD' && state.pointsB === 'AD')).toBe(true);
        
        // Assert valid games and sets bounds
        expect(state.gamesA).toBeGreaterThanOrEqual(0);
        expect(state.gamesB).toBeGreaterThanOrEqual(0);
        expect(state.setsA).toBeGreaterThanOrEqual(0);
        expect(state.setsA).toBeLessThanOrEqual(DEFAULT_MATCH_FORMAT.setsToWin);
        expect(state.setsB).toBeGreaterThanOrEqual(0);
        expect(state.setsB).toBeLessThanOrEqual(DEFAULT_MATCH_FORMAT.setsToWin);
        
        // Assert serving player is always defined
        expect(['A', 'B']).toContain(state.servingPlayer);
        
        // If tiebreaker, verify points are defined
        if (state.isTiebreaker) {
          expect(state.tiebreakerPointsA).toBeGreaterThanOrEqual(0);
          expect(state.tiebreakerPointsB).toBeGreaterThanOrEqual(0);
        }
      }

      // Assert match actually completes without looping infinitely
      expect(isCompleted).toBe(true);
      expect(pointsPlayed).toBeLessThan(1000);
    }
  });

  it('maintains valid state across random matches (Super Tiebreaker Format)', { timeout: 60000 }, () => {
    const superTiebreakFormat = {
      ...DEFAULT_MATCH_FORMAT,
      superTiebreakLastSet: true,
      superTiebreakPointsToWin: 10
    };

    // Flood the state machine with 1000 random matches
    for (let i = 0; i < 1000; i++) {
      let state = createInitialScoreState(Math.random() > 0.5 ? 'A' : 'B');
      let isCompleted = false;
      let pointsPlayed = 0;

      while (!isCompleted && pointsPlayed < 1000) { 
        const winner = Math.random() > 0.5 ? 'A' : 'B';
        const result = advanceScore(state, winner, superTiebreakFormat);
        state = result.newState;
        isCompleted = result.matchCompleted;
        pointsPlayed++;

        // Assert valid points
        expect(VALID_POINTS).toContain(state.pointsA);
        expect(VALID_POINTS).toContain(state.pointsB);
        
        // Assert no 'AD' for both simultaneously
        expect(!(state.pointsA === 'AD' && state.pointsB === 'AD')).toBe(true);
      }

      expect(isCompleted).toBe(true);
      expect(pointsPlayed).toBeLessThan(1000);
    }
  });
});

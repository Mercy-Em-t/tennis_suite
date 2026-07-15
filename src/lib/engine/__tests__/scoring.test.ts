import { describe, it, expect } from 'vitest';
import { advanceScore, createInitialScoreState, DEFAULT_MATCH_FORMAT } from '../scoring';

describe('Tennis Scoring FSM Verification', () => {
  it('prevents illegal path jumps to Advantage', () => {
    let state = createInitialScoreState('A');
    
    // Test 15-30 scenario
    state = advanceScore(state, 'A').newState; // A:15
    state = advanceScore(state, 'B').newState; // A:15, B:15
    state = advanceScore(state, 'B').newState; // A:15, B:30
    
    expect(state.pointsA).toBe('15');
    expect(state.pointsB).toBe('30');
    expect(state.pointsA).not.toBe('AD');
    expect(state.pointsB).not.toBe('AD');
    
    // The only way to get to AD is from 40-40
    state = advanceScore(state, 'A').newState; // A:30, B:30
    state = advanceScore(state, 'A').newState; // A:40, B:30
    state = advanceScore(state, 'B').newState; // A:40, B:40
    
    // Now someone can get AD
    let adState = advanceScore(state, 'A').newState;
    expect(adState.pointsA).toBe('AD');
    expect(adState.pointsB).toBe('40');
  });

  it('handles context flips to standard tiebreaks and match super tiebreaks', () => {
    let state = createInitialScoreState('A');
    
    // Simulate to 6-6
    state.gamesA = 6;
    state.gamesB = 5;
    state.pointsB = '40';
    state.servingPlayer = 'B';
    
    // B wins the game, making it 6-6
    state = advanceScore(state, 'B').newState;
    expect(state.gamesA).toBe(6);
    expect(state.gamesB).toBe(6);
    expect(state.isTiebreaker).toBe(true);
    expect(state.tiebreakFirstServer).toBe('A'); // A should serve since B served the 6-5 game
    
    // Simulate Super Tiebreak context flip
    let superState = createInitialScoreState('A');
    superState.setsA = 1;
    superState.setsB = 1;
    superState.gamesA = 5;
    superState.gamesB = 6;
    superState.pointsA = '40';
    superState.servingPlayer = 'A';
    
    // A wins to make it 6-6 in the final set
    let format = { ...DEFAULT_MATCH_FORMAT, superTiebreakLastSet: true };
    superState = advanceScore(superState, 'A', format).newState;
    
    expect(superState.isTiebreaker).toBe(true);
    expect(superState.tiebreakFirstServer).toBe('B');
  });

  it('accurately tracks service rotations', () => {
    let state = createInitialScoreState('A');
    expect(state.servingPlayer).toBe('A');
    
    // Win a game
    state.pointsA = '40';
    state = advanceScore(state, 'A').newState;
    
    // Server should flip to B
    expect(state.servingPlayer).toBe('B');
    
    // Trigger a tiebreak
    state.gamesA = 6;
    state.gamesB = 6;
    state.isTiebreaker = true;
    state.tiebreakerPointsA = 0;
    state.tiebreakerPointsB = 0;
    state.tiebreakFirstServer = 'B';
    state.servingPlayer = 'B'; // B serves first point

    // Point 1 (total = 1): server should flip to A
    state = advanceScore(state, 'B').newState;
    expect(state.servingPlayer).toBe('A');

    // Point 2 (total = 2): server stays A
    state = advanceScore(state, 'B').newState;
    expect(state.servingPlayer).toBe('A');
    
    // Point 3 (total = 3): server should flip to B
    state = advanceScore(state, 'A').newState;
    expect(state.servingPlayer).toBe('B');

    // Finish tiebreak (B wins 7-1)
    state.tiebreakerPointsA = 1;
    state.tiebreakerPointsB = 6;
    state = advanceScore(state, 'B').newState;
    
    // Tiebreak is over, next set begins.
    // The tiebreak first server was 'B', so the next set first server should be 'A'
    expect(state.isTiebreaker).toBe(false);
    expect(state.servingPlayer).toBe('A');
  });
});

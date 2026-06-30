export type TennisPoint = '0' | '15' | '30' | '40' | 'AD';

export interface TennisScoreState {
  pointsA: TennisPoint;
  pointsB: TennisPoint;
  gamesA: number;
  gamesB: number;
  setsA: number;
  setsB: number;
  isTiebreaker: boolean;
  tiebreakerPointsA: number;
  tiebreakerPointsB: number;
}

export function createInitialScoreState(): TennisScoreState {
  return {
    pointsA: '0',
    pointsB: '0',
    gamesA: 0,
    gamesB: 0,
    setsA: 0,
    setsB: 0,
    isTiebreaker: false,
    tiebreakerPointsA: 0,
    tiebreakerPointsB: 0
  };
}

export function advanceScore(
  state: TennisScoreState, 
  winnerId: 'A' | 'B', 
  noAdScoring: boolean = false
): { newState: TennisScoreState, matchCompleted: boolean, matchWinnerId?: 'A' | 'B' } {
  const newState = { ...state };
  let matchCompleted = false;
  let matchWinnerId: 'A' | 'B' | undefined;

  if (newState.isTiebreaker) {
    if (winnerId === 'A') newState.tiebreakerPointsA += 1;
    else newState.tiebreakerPointsB += 1;

    const tA = newState.tiebreakerPointsA;
    const tB = newState.tiebreakerPointsB;

    if ((tA >= 7 && tA - tB >= 2) || (tB >= 7 && tB - tA >= 2)) {
       // Tiebreaker over, award game and set
       if (tA > tB) newState.setsA += 1;
       else newState.setsB += 1;
       
       newState.gamesA = 0;
       newState.gamesB = 0;
       newState.isTiebreaker = false;
       newState.tiebreakerPointsA = 0;
       newState.tiebreakerPointsB = 0;
       
       // Check Match Win (best of 3 sets)
       if (newState.setsA >= 2) { matchCompleted = true; matchWinnerId = 'A'; }
       if (newState.setsB >= 2) { matchCompleted = true; matchWinnerId = 'B'; }
    }
    return { newState, matchCompleted, matchWinnerId };
  }

  // Normal game point logic
  const currentPoints = winnerId === 'A' ? newState.pointsA : newState.pointsB;
  const opponentPoints = winnerId === 'A' ? newState.pointsB : newState.pointsA;

  let wonGame = false;

  if (currentPoints === '0') {
    if (winnerId === 'A') newState.pointsA = '15'; else newState.pointsB = '15';
  } else if (currentPoints === '15') {
    if (winnerId === 'A') newState.pointsA = '30'; else newState.pointsB = '30';
  } else if (currentPoints === '30') {
    if (winnerId === 'A') newState.pointsA = '40'; else newState.pointsB = '40';
  } else if (currentPoints === '40') {
    if (opponentPoints !== '40' && opponentPoints !== 'AD') {
      wonGame = true;
    } else if (noAdScoring) {
      wonGame = true;
    } else if (opponentPoints === 'AD') {
      // Opponent had AD, back to Deuce
      newState.pointsA = '40';
      newState.pointsB = '40';
    } else { // both are 40
      if (winnerId === 'A') newState.pointsA = 'AD'; else newState.pointsB = 'AD';
    }
  } else if (currentPoints === 'AD') {
    wonGame = true;
  }

  if (wonGame) {
    if (winnerId === 'A') newState.gamesA += 1; else newState.gamesB += 1;
    newState.pointsA = '0';
    newState.pointsB = '0';

    // Check Set Win (First to 6, win by 2)
    if ((newState.gamesA >= 6 && newState.gamesA - newState.gamesB >= 2) || 
        (newState.gamesB >= 6 && newState.gamesB - newState.gamesA >= 2)) {
      if (newState.gamesA > newState.gamesB) newState.setsA += 1; else newState.setsB += 1;
      newState.gamesA = 0;
      newState.gamesB = 0;
      
      // Check Match Win
      if (newState.setsA >= 2) { matchCompleted = true; matchWinnerId = 'A'; }
      if (newState.setsB >= 2) { matchCompleted = true; matchWinnerId = 'B'; }
    } else if (newState.gamesA === 6 && newState.gamesB === 6) {
      // Trigger Tiebreaker
      newState.isTiebreaker = true;
      newState.tiebreakerPointsA = 0;
      newState.tiebreakerPointsB = 0;
    }
  }

  return { newState, matchCompleted, matchWinnerId };
}

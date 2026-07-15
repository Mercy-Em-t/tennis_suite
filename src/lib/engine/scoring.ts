export type TennisPoint = '0' | '15' | '30' | '40' | 'AD';

export interface MatchFormat {
  setsToWin: number;
  gamesPerSet: number;
  tiebreakAt: number;
  tiebreakPointsToWin: number;
  superTiebreakLastSet?: boolean;
  superTiebreakPointsToWin?: number;
  noAdScoring?: boolean;
}

export const DEFAULT_MATCH_FORMAT: MatchFormat = {
  setsToWin: 2,
  gamesPerSet: 6,
  tiebreakAt: 6,
  tiebreakPointsToWin: 7,
  noAdScoring: false
};

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
  servingPlayer?: 'A' | 'B';
  tiebreakFirstServer?: 'A' | 'B';
}

export function createInitialScoreState(initialServer?: 'A' | 'B'): TennisScoreState {
  return {
    pointsA: '0',
    pointsB: '0',
    gamesA: 0,
    gamesB: 0,
    setsA: 0,
    setsB: 0,
    isTiebreaker: false,
    tiebreakerPointsA: 0,
    tiebreakerPointsB: 0,
    servingPlayer: initialServer,
    tiebreakFirstServer: undefined
  };
}

export function advanceScore(
  state: TennisScoreState, 
  winnerId: 'A' | 'B', 
  format: MatchFormat = DEFAULT_MATCH_FORMAT
): { newState: TennisScoreState, matchCompleted: boolean, matchWinnerId?: 'A' | 'B' } {
  const newState = { ...state };
  let matchCompleted = false;
  let matchWinnerId: 'A' | 'B' | undefined;

  const isFinalSet = (newState.setsA + newState.setsB) === (format.setsToWin * 2 - 2);
  const isSuperTiebreak = format.superTiebreakLastSet && isFinalSet && 
                          newState.gamesA === 0 && newState.gamesB === 0 && 
                          newState.isTiebreaker;

  if (newState.isTiebreaker) {
    if (winnerId === 'A') newState.tiebreakerPointsA += 1;
    else newState.tiebreakerPointsB += 1;

    const tA = newState.tiebreakerPointsA;
    const tB = newState.tiebreakerPointsB;
    const totalTiebreakPoints = tA + tB;

    // Flip serving player every 2 points in a tiebreaker
    if (newState.servingPlayer && totalTiebreakPoints % 2 !== 0) {
      newState.servingPlayer = newState.servingPlayer === 'A' ? 'B' : 'A';
    }

    const pointsToWin = isSuperTiebreak ? (format.superTiebreakPointsToWin || 10) : format.tiebreakPointsToWin;

    if ((tA >= pointsToWin && tA - tB >= 2) || (tB >= pointsToWin && tB - tA >= 2)) {
       // Tiebreaker over, award game and set
       if (tA > tB) newState.setsA += 1;
       else newState.setsB += 1;
       
       newState.gamesA = 0;
       newState.gamesB = 0;
       newState.isTiebreaker = false;
       newState.tiebreakerPointsA = 0;
       newState.tiebreakerPointsB = 0;
       
       // Start next set server as the one who received first in the tiebreaker.
       if (newState.tiebreakFirstServer) {
          newState.servingPlayer = newState.tiebreakFirstServer === 'A' ? 'B' : 'A';
          newState.tiebreakFirstServer = undefined;
       } else if (newState.servingPlayer) {
          // Fallback if not tracked
          newState.servingPlayer = newState.servingPlayer === 'A' ? 'B' : 'A';
       }
       
       if (newState.setsA >= format.setsToWin) { matchCompleted = true; matchWinnerId = 'A'; }
       if (newState.setsB >= format.setsToWin) { matchCompleted = true; matchWinnerId = 'B'; }
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
    } else if (format.noAdScoring) {
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

    // Flip serving player
    if (newState.servingPlayer) {
      newState.servingPlayer = newState.servingPlayer === 'A' ? 'B' : 'A';
    }

    // Check Set Win (First to gamesPerSet, win by 2)
    if ((newState.gamesA >= format.gamesPerSet && newState.gamesA - newState.gamesB >= 2) || 
        (newState.gamesB >= format.gamesPerSet && newState.gamesB - newState.gamesA >= 2)) {
      if (newState.gamesA > newState.gamesB) newState.setsA += 1; else newState.setsB += 1;
      newState.gamesA = 0;
      newState.gamesB = 0;
      
      // Check Match Win
      if (newState.setsA >= format.setsToWin) { matchCompleted = true; matchWinnerId = 'A'; }
      if (newState.setsB >= format.setsToWin) { matchCompleted = true; matchWinnerId = 'B'; }

      // Check if next set is a super tiebreak
      const isNextSetFinal = (newState.setsA + newState.setsB) === (format.setsToWin * 2 - 2);
      if (!matchCompleted && format.superTiebreakLastSet && isNextSetFinal) {
        newState.isTiebreaker = true;
        newState.tiebreakerPointsA = 0;
        newState.tiebreakerPointsB = 0;
        newState.tiebreakFirstServer = newState.servingPlayer;
      }
    } else if (newState.gamesA === format.tiebreakAt && newState.gamesB === format.tiebreakAt) {
      // Trigger Tiebreaker
      newState.isTiebreaker = true;
      newState.tiebreakerPointsA = 0;
      newState.tiebreakerPointsB = 0;
      newState.tiebreakFirstServer = newState.servingPlayer;
    }
  }

  return { newState, matchCompleted, matchWinnerId };
}

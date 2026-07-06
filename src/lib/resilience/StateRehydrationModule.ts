/**
 * StateRehydrationModule: Event-Sourcing Logic
 * Replays a sequence of granular match events to rebuild the final match state.
 */

// Define standard match object based on Phase 3 Encapsulation rules
export interface StandardMatchObject {
  meta: {
    match_id: string;
    referee_id: string;
    timestamp: string;
  };
  state: {
    score: any;
    set: number;
    status: 'SCHEDULED' | 'WARMUP' | 'IN_PROGRESS' | 'COMPLETED';
  };
  event: {
    type: 'POINT_SCORED' | 'FAULT' | 'MEDICAL_TIMEOUT' | 'MATCH_START' | 'CORRECTION';
    details: any;
  };
}

export class StateRehydrationModule {
  
  /**
   * Rehydrates a match state from a sequence of events.
   * This guarantees that even if a server crashes, the exact state can be 
   * rebuilt deterministically from the immutable logs.
   */
  public rehydrate(events: StandardMatchObject[]): StandardMatchObject['state'] {
    // Sort chronologically by timestamp
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.meta.timestamp).getTime() - new Date(b.meta.timestamp).getTime()
    );

    // Initial default state
    let currentState: StandardMatchObject['state'] = {
      score: { teamA: 0, teamB: 0 },
      set: 1,
      status: 'SCHEDULED'
    };

    // Replay each event
    for (const evt of sortedEvents) {
      currentState = this.applyEvent(currentState, evt);
    }

    return currentState;
  }

  private applyEvent(state: StandardMatchObject['state'], evt: StandardMatchObject): StandardMatchObject['state'] {
    // Clone state to prevent mutation
    const nextState = JSON.parse(JSON.stringify(state));

    switch (evt.event.type) {
      case 'MATCH_START':
        nextState.status = 'IN_PROGRESS';
        break;
      case 'POINT_SCORED':
        // For simplicity in this mock, we just increment based on team detail
        const team = evt.event.details.team; // 'teamA' or 'teamB'
        if (team) {
          nextState.score[team] += 15; // Mock tennis scoring
        }
        break;
      case 'CORRECTION':
        // Overrides the score completely based on a referee correction
        if (evt.event.details.newScore) {
          nextState.score = evt.event.details.newScore;
        }
        break;
    }

    // Keep the status from the event if it's explicitly changing it
    if (evt.state.status && evt.event.type !== 'POINT_SCORED' && evt.event.type !== 'CORRECTION') {
      nextState.status = evt.state.status;
    }

    return nextState;
  }

  /**
   * Conflict Resolution: `on_conflict`
   * Handles cases where two devices report conflicting scores.
   * Resolves by prioritizing the Referee's ID or strict chronological order.
   */
  public on_conflict(incomingEvent: StandardMatchObject, existingLatestEvent: StandardMatchObject): 'ACCEPT' | 'REJECT' {
    // 1. Session Locking: Only the assigned referee can mutate
    if (incomingEvent.meta.referee_id !== existingLatestEvent.meta.referee_id) {
      // If a System Monitor is overriding, we might allow it, but otherwise reject.
      if (incomingEvent.meta.referee_id !== 'SYSTEM_MONITOR') {
        return 'REJECT';
      }
    }

    // 2. Strict Chronology: Reject older events to prevent out-of-order race conditions
    const incomingTime = new Date(incomingEvent.meta.timestamp).getTime();
    const existingTime = new Date(existingLatestEvent.meta.timestamp).getTime();

    if (incomingTime <= existingTime) {
      return 'REJECT';
    }

    return 'ACCEPT';
  }
}

export const stateRehydrationLayer = new StateRehydrationModule();

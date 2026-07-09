import { useState } from 'react';

export type LifecycleStage = 'BLUEPRINT' | 'INITIALIZATION' | 'PRE_TOURNAMENT' | 'LIVE' | 'POST_TOURNAMENT' | 'ARCHIVED';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
}

export interface TournamentSandboxState {
  stage: LifecycleStage;
  logs: AuditLogEntry[];
  payloadSizeKb: number;
  metadata: {
    id: string | null;
    name: string;
    status: string;
  };
  derivedAnalytics: {
    totalMatches: number;
    averageMatchTime: string;
    totalPrizePool: number;
    topSeedWinRate: string;
  } | null;
}

const initialState: TournamentSandboxState = {
  stage: 'BLUEPRINT',
  logs: [],
  payloadSizeKb: 0,
  metadata: {
    id: null,
    name: 'Standard 32-Player Draw (Template)',
    status: 'INACTIVE',
  },
  derivedAnalytics: null
};

export function useTournamentState() {
  const [state, setState] = useState<TournamentSandboxState>(initialState);

  const addLog = (action: string, actor: string) => {
    setState(prev => ({
      ...prev,
      logs: [{
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleTimeString(),
        action,
        actor
      }, ...prev.logs]
    }));
  };

  const initializeTournament = (name: string) => {
    setState(prev => ({
      ...prev,
      stage: 'INITIALIZATION',
      payloadSizeKb: 4, // Just metadata and empty arrays
      metadata: {
        id: 'TRN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        name: name,
        status: 'INITIALIZING'
      },
      logs: [{
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleTimeString(),
        action: `Blueprint Invoked. Tournament object instantiated in database.`,
        actor: 'SYSTEM_HOST'
      }]
    }));
  };

  const advanceStage = () => {
    setState(prev => {
      let nextStage: LifecycleStage = prev.stage;
      let newSize = prev.payloadSizeKb;
      let newStatus = prev.metadata.status;
      let analytics = prev.derivedAnalytics;
      const logAction = [];

      switch (prev.stage) {
        case 'INITIALIZATION':
          nextStage = 'PRE_TOURNAMENT';
          newStatus = 'REGISTRATION_OPEN';
          newSize = 14; // Players registering, draws generating
          logAction.push('Registration opened. Draws generated optimistically.');
          break;
        case 'PRE_TOURNAMENT':
          nextStage = 'LIVE';
          newStatus = 'IN_PROGRESS';
          newSize = 215; // Heavy state: All courts, all active matches, all point-by-point data chunked
          logAction.push('Tournament Set to LIVE. Massive state object chunks pushed to Edge Nodes.');
          break;
        case 'LIVE':
          nextStage = 'POST_TOURNAMENT';
          newStatus = 'COMPLETED';
          newSize = 45; // Matches done. Processing payouts.
          logAction.push('All matches concluded. Financial reconciliations processing.');
          break;
        case 'POST_TOURNAMENT':
          nextStage = 'ARCHIVED';
          newStatus = 'ARCHIVED_READ_ONLY';
          newSize = 12; // Stripped of volatile state. Reduced to derived insights.
          analytics = {
            totalMatches: 31,
            averageMatchTime: '1h 14m',
            totalPrizePool: 25000,
            topSeedWinRate: '87%'
          };
          logAction.push('Data compressed. Object locked to READ-ONLY. Derived knowledge views generated.');
          break;
      }

      const nextLogs = [...prev.logs];
      logAction.forEach(act => {
        nextLogs.unshift({
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toLocaleTimeString(),
          action: act,
          actor: 'STATE_MACHINE'
        });
      });

      return {
        ...prev,
        stage: nextStage,
        payloadSizeKb: newSize,
        metadata: {
          ...prev.metadata,
          status: newStatus
        },
        logs: nextLogs,
        derivedAnalytics: analytics
      };
    });
  };

  const attemptIllegalMutation = () => {
    addLog('ILLEGAL MUTATION ATTEMPTED: Attempted to edit Match Score on Archived Object.', 'UMPIRE_01');
    addLog('ACCESS DENIED: Tournament object is permanently locked.', 'SYSTEM_AUTH');
  };

  const reset = () => {
    setState(initialState);
  };

  return {
    state,
    initializeTournament,
    advanceStage,
    attemptIllegalMutation,
    reset
  };
}

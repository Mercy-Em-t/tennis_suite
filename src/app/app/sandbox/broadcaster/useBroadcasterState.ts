import { useState, useEffect } from 'react';

export interface ScoreState {
  team1: { sets: number; games: number; points: string | number };
  team2: { sets: number; games: number; points: string | number };
}

export interface MatchData {
  id: string;
  team1Name: string;
  team2Name: string;
  team1Seed?: string;
  team2Seed?: string;
  score: ScoreState;
  category: string;
  round: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface BroadcasterGraphicsState {
  activeMatchId: string | null;
  activeCamera: 'CAM_1' | 'CAM_2' | 'WIDE_ANGLE';
  presentationMode: 'AUTO_CYCLE' | 'FORCE_MATCH' | 'FORCE_BRACKET';
  showScoreBug: boolean;
  showPlayer1LowerThird: boolean;
  showPlayer2LowerThird: boolean;
  showTournamentLogo: boolean;
  showSponsorOverlay: boolean;
  showAdsSidebar: boolean;
  fullScreenAlert: string | null;
}

const mockMatches: Record<string, MatchData> = {
  m1: {
    id: 'm1',
    team1Name: 'Team Alpha',
    team1Seed: '[1]',
    team2Name: 'Team Bravo',
    team2Seed: '[4]',
    status: 'IN_PROGRESS',
    score: {
      team1: { sets: 1, games: 4, points: 15 },
      team2: { sets: 0, games: 3, points: 40 },
    },
    category: 'Mens Open',
    round: 'Quarter Finals',
  },
  m2: {
    id: 'm2',
    team1Name: 'Team Charlie',
    team2Name: 'Team Delta',
    status: 'PENDING',
    score: {
      team1: { sets: 0, games: 0, points: 0 },
      team2: { sets: 0, games: 0, points: 0 },
    },
    category: 'Womens Open',
    round: 'Semi Finals',
  },
  m3: {
    id: 'm3',
    team1Name: 'Team Echo',
    team2Name: 'Team Foxtrot',
    status: 'PENDING',
    score: {
      team1: { sets: 0, games: 0, points: 0 },
      team2: { sets: 0, games: 0, points: 0 },
    },
    category: 'Mixed Doubles',
    round: 'Pool A',
  }
};

const defaultState: BroadcasterGraphicsState = {
  activeMatchId: 'm1',
  activeCamera: 'WIDE_ANGLE',
  presentationMode: 'AUTO_CYCLE',
  showScoreBug: true,
  showPlayer1LowerThird: false,
  showPlayer2LowerThird: false,
  showTournamentLogo: true,
  showSponsorOverlay: false,
  showAdsSidebar: true,
  fullScreenAlert: null,
};

export function useBroadcasterState() {
  const [graphics, setGraphics] = useState<BroadcasterGraphicsState>(defaultState);
  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'SYNCING' | 'LIVE'>('SYNCING');

  useEffect(() => {
    const syncState = () => {
      const stored = localStorage.getItem('broadcaster_v2');
      if (stored) {
        setGraphics(JSON.parse(stored));
      } else {
        localStorage.setItem('broadcaster_v2', JSON.stringify(defaultState));
        setGraphics(defaultState);
      }
    };

    syncState();
    setLoaded(true);
    setTimeout(() => setSyncStatus('LIVE'), 500);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'broadcaster_v2' && e.newValue) {
        setSyncStatus('SYNCING');
        setGraphics(JSON.parse(e.newValue));
        setTimeout(() => setSyncStatus('LIVE'), 200);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateGraphics = (updates: Partial<BroadcasterGraphicsState>) => {
    setGraphics(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('broadcaster_v2', JSON.stringify(next));
      window.dispatchEvent(new Event('local-storage-sync-b2'));
      return next;
    });
  };

  useEffect(() => {
    const handleLocalSync = () => {
      const stored = localStorage.getItem('broadcaster_v2');
      if (stored) {
        setGraphics(JSON.parse(stored));
      }
    };
    window.addEventListener('local-storage-sync-b2', handleLocalSync);
    return () => window.removeEventListener('local-storage-sync-b2', handleLocalSync);
  }, []);

  const activeMatch = graphics.activeMatchId ? mockMatches[graphics.activeMatchId] : null;

  return {
    graphics,
    updateGraphics,
    activeMatch,
    mockMatches,
    loaded,
    syncStatus
  };
}

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
  isSandbox: boolean;
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
  
  // New operational properties
  sponsorList: string;
  adSlotImageUrl: string;
  tickerText: string;
}

export interface UpcomingMatch {
  id: string;
  team1Name: string;
  team2Name: string;
  time: string;
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
  isSandbox: true,
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
  sponsorList: 'RED BULL, ROLEX, NIKE, WILSON',
  adSlotImageUrl: '',
  tickerText: 'BREAKING: Team Alpha secures spot in finals... Upcoming matches delayed by 15 mins...'
};

export function useBroadcasterState() {
  const [graphics, setGraphics] = useState<BroadcasterGraphicsState>(defaultState);
  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'SYNCING' | 'LIVE'>('SYNCING');

  useEffect(() => {
    const syncState = () => {
      const stored = localStorage.getItem('broadcaster_prod_v1');
      if (stored) {
        setGraphics(JSON.parse(stored));
      } else {
        localStorage.setItem('broadcaster_prod_v1', JSON.stringify(defaultState));
        setGraphics(defaultState);
      }
      setLoaded(true);
      setSyncStatus('LIVE');
    };

    syncState();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'broadcaster_prod_v1' && e.newValue) {
        setGraphics(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    
    // Fallback sync loop for same-window updates
    const interval = setInterval(() => {
      const stored = localStorage.getItem('broadcaster_prod_v1');
      if (stored) {
        setGraphics(prev => {
          if (JSON.stringify(prev) !== stored) {
            return JSON.parse(stored);
          }
          return prev;
        });
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const updateGraphics = (partial: Partial<BroadcasterGraphicsState>) => {
    setGraphics(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem('broadcaster_prod_v1', JSON.stringify(next));
      return next;
    });
  };

  const activeMatch = graphics.activeMatchId && graphics.isSandbox ? mockMatches[graphics.activeMatchId] : null;

  const mockUpcomingMatches: UpcomingMatch[] = [
    { id: 'u1', team1Name: 'Team X-Ray', team2Name: 'Team Yankee', time: '14:30' },
    { id: 'u2', team1Name: 'Alpha Squad', team2Name: 'Omega Force', time: '15:15' },
    { id: 'u3', team1Name: 'The Aces', team2Name: 'Net Ninjas', time: '16:00' }
  ];

  return {
    graphics,
    updateGraphics,
    activeMatch,
    mockMatches,
    mockUpcomingMatches,
    loaded,
    syncStatus,
  };
}

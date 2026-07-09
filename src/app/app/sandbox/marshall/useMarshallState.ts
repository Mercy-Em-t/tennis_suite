import { useState, useEffect } from 'react';

export interface ScoreState {
  team1: { sets: number; games: number; points: string | number };
  team2: { sets: number; games: number; points: string | number };
}

export interface MatchData {
  id: string;
  team1Name: string;
  team2Name: string;
  status: 'SCHEDULED' | 'WARMUP' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED';
  score: ScoreState;
  category: string;
  round: string;
}

export interface CourtData {
  id: string;
  name: string;
  status: 'EMPTY' | 'WARMUP' | 'IN_PROGRESS' | 'MAINTENANCE';
  activeMatchId: string | null;
}

export interface ChatMessage {
  id: string;
  sender: 'Delegate' | 'Referee' | 'You';
  message: string;
  timestamp: string;
  type: 'INFO' | 'EMERGENCY' | 'CHAT' | 'RESOURCE_REQUEST';
}

const defaultCourts: CourtData[] = [
  { id: 'c1', name: 'Center Court', status: 'IN_PROGRESS', activeMatchId: 'm1' },
  { id: 'c2', name: 'Court 2', status: 'EMPTY', activeMatchId: null },
  { id: 'c3', name: 'Court 3', status: 'MAINTENANCE', activeMatchId: null },
];

const defaultMatches: Record<string, MatchData> = {
  m1: {
    id: 'm1',
    team1Name: 'Team Alpha',
    team2Name: 'Team Bravo',
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
    status: 'SCHEDULED',
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
    status: 'SCHEDULED',
    score: {
      team1: { sets: 0, games: 0, points: 0 },
      team2: { sets: 0, games: 0, points: 0 },
    },
    category: 'Mixed Doubles',
    round: 'Pool A',
  },
};

const defaultLogs: ChatMessage[] = [
  { id: 'l1', sender: 'Referee', message: 'Remember to check nets on Court 2 before next match.', timestamp: '10:05 AM', type: 'INFO' },
];

export function useMarshallState() {
  const [courts, setCourts] = useState<CourtData[]>([]);
  const [matches, setMatches] = useState<Record<string, MatchData>>({});
  const [logs, setLogs] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedCourts = localStorage.getItem('marshall_courts_v2');
    const storedMatches = localStorage.getItem('marshall_matches_v2');
    const storedLogs = localStorage.getItem('marshall_logs_v2');

    if (storedCourts && storedMatches && storedLogs) {
      setCourts(JSON.parse(storedCourts));
      setMatches(JSON.parse(storedMatches));
      setLogs(JSON.parse(storedLogs));
    } else {
      setCourts(defaultCourts);
      setMatches(defaultMatches);
      setLogs(defaultLogs);
      localStorage.setItem('marshall_courts_v2', JSON.stringify(defaultCourts));
      localStorage.setItem('marshall_matches_v2', JSON.stringify(defaultMatches));
      localStorage.setItem('marshall_logs_v2', JSON.stringify(defaultLogs));
    }
    setLoaded(true);
  }, []);

  const updateCourt = (courtId: string, updates: Partial<CourtData>) => {
    setCourts(prev => {
      const next = prev.map(c => c.id === courtId ? { ...c, ...updates } : c);
      localStorage.setItem('marshall_courts_v2', JSON.stringify(next));
      return next;
    });
  };

  const updateMatchScore = (matchId: string, newScore: ScoreState) => {
    setMatches(prev => {
      const next = {
        ...prev,
        [matchId]: { ...prev[matchId], score: newScore }
      };
      localStorage.setItem('marshall_matches_v2', JSON.stringify(next));
      return next;
    });
  };

  const updateMatchStatus = (matchId: string, status: MatchData['status']) => {
    setMatches(prev => {
      const next = {
        ...prev,
        [matchId]: { ...prev[matchId], status }
      };
      localStorage.setItem('marshall_matches_v2', JSON.stringify(next));
      return next;
    });
  };

  const addLog = (message: string, type: ChatMessage['type'] = 'CHAT', sender: ChatMessage['sender'] = 'You') => {
    const newLog: ChatMessage = {
      id: `l${Date.now()}`,
      sender,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type
    };
    setLogs(prev => {
      const next = [...prev, newLog];
      localStorage.setItem('marshall_logs_v2', JSON.stringify(next));
      return next;
    });
  };

  return { 
    courts, 
    matches, 
    logs, 
    updateCourt, 
    updateMatchScore, 
    updateMatchStatus, 
    addLog, 
    loaded 
  };
}

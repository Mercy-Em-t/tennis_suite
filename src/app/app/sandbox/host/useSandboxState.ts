import { useState, useEffect } from 'react';

export interface SandboxPlayer {
  name: string;
  email: string;
}

export interface SandboxTeam {
  id: string;
  franchiseName: string;
  categories: string; // Serialized JSON string array
  isLateRegistration?: boolean;
  players: SandboxPlayer[];
}

export interface SandboxPool {
  id: string;
  name: string;
  category: string;
  versionId: string;
  poolTeams: Array<{
    id: string;
    seed: number;
    team: SandboxTeam;
    isLateAssign?: boolean;
  }>;
}

export interface SandboxMatch {
  id: string;
  courtId: string | null;
  courtName: string | null;
  stage: 'POOL' | 'KNOCKOUTS';
  category: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  teamA: SandboxTeam;
  teamB: SandboxTeam;
  scoreState: string; // JSON score object: { setsA: number, setsB: number, gamesA: number, gamesB: number }
  durationSec: number;
}

export interface SandboxStaff {
  id: string;
  name: string;
  role: 'REFEREE' | 'MARSHALL';
  status: 'APPROVED' | 'PENDING';
}

export interface TournamentSandboxData {
  id: string;
  name: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  date: string;
  location?: string;
  // Pre-Tournament Flags
  isLaunched: boolean;
  registrationPhase: 'EARLY' | 'LATE' | 'CLOSED';
  poolsPublished: boolean;
  schedulePublished: boolean;
  isArchived: boolean;
  globalState: 'NORMAL' | 'SUSPENDED';
  // stats
  teamsRegistered: number;
  // Detailed relational state
  teams: SandboxTeam[];
  pools: SandboxPool[];
  matches: SandboxMatch[];
  staff: SandboxStaff[];
}

const mockTeams1001: SandboxTeam[] = [
  { id: 'tm-1', franchiseName: 'Baseline Bombers', categories: '["Open"]', players: [{ name: 'Roger Federer', email: 'roger@bombers.com' }, { name: 'Stan Wawrinka', email: 'stan@bombers.com' }] },
  { id: 'tm-2', franchiseName: 'Net Rippers', categories: '["Open"]', players: [{ name: 'Rafael Nadal', email: 'rafa@rippers.com' }, { name: 'Carlos Alcaraz', email: 'carlos@rippers.com' }] },
  { id: 'tm-3', franchiseName: 'Serve Stormers', categories: '["Open"]', players: [{ name: 'Novak Djokovic', email: 'novak@stormers.com' }, { name: 'Jannik Sinner', email: 'jannik@stormers.com' }] },
  { id: 'tm-4', franchiseName: 'Spin Sorcerers', categories: '["Open"]', players: [{ name: 'Daniil Medvedev', email: 'daniil@spin.com' }, { name: 'Andrey Rublev', email: 'andrey@spin.com' }] },
  { id: 'tm-5', franchiseName: 'Lob Legends', categories: '["Open"]', players: [{ name: 'Andy Murray', email: 'andy@lob.com' }, { name: 'Stefanos Tsitsipas', email: 'stefanos@lob.com' }] },
  { id: 'tm-6', franchiseName: 'Ace Alliance', categories: '["Open"]', players: [{ name: 'Nick Kyrgios', email: 'nick@ace.com' }, { name: 'Alex de Minaur', email: 'alex@ace.com' }] },
  { id: 'tm-7', franchiseName: 'Volley Vipers', categories: '["Open"]', players: [{ name: 'Taylor Fritz', email: 'taylor@vipers.com' }, { name: 'Ben Shelton', email: 'ben@vipers.com' }] },
  { id: 'tm-8', franchiseName: 'Smash Masters', categories: '["Open"]', players: [{ name: 'Alexander Zverev', email: 'sasha@smash.com' }, { name: 'Hubert Hurkacz', email: 'hubi@smash.com' }] }
];

export const defaultTournaments: TournamentSandboxData[] = [
  {
    id: 'T-1001',
    name: 'Summer Open 2026',
    status: 'ACTIVE',
    date: 'Jul 15, 2026',
    location: 'Court Central Arena',
    isLaunched: true,
    registrationPhase: 'CLOSED',
    poolsPublished: true,
    schedulePublished: true,
    isArchived: false,
    globalState: 'NORMAL',
    teamsRegistered: 8,
    teams: mockTeams1001,
    pools: [
      {
        id: 'pl-a',
        name: 'Pool A',
        category: 'Open',
        versionId: 'v1.0',
        poolTeams: [
          { id: 'pt-1', seed: 1, team: mockTeams1001[0] },
          { id: 'pt-2', seed: 2, team: mockTeams1001[2] },
          { id: 'pt-3', seed: 3, team: mockTeams1001[4] },
          { id: 'pt-4', seed: 4, team: mockTeams1001[6] }
        ]
      },
      {
        id: 'pl-b',
        name: 'Pool B',
        category: 'Open',
        versionId: 'v1.0',
        poolTeams: [
          { id: 'pt-5', seed: 1, team: mockTeams1001[1] },
          { id: 'pt-6', seed: 2, team: mockTeams1001[3] },
          { id: 'pt-7', seed: 3, team: mockTeams1001[5] },
          { id: 'pt-8', seed: 4, team: mockTeams1001[7] }
        ]
      }
    ],
    matches: [
      {
        id: 'mt-1',
        courtId: 'ct-1',
        courtName: 'Court 1',
        stage: 'POOL',
        category: 'Open',
        status: 'IN_PROGRESS',
        teamA: mockTeams1001[0],
        teamB: mockTeams1001[2],
        scoreState: '{"setsA":1,"setsB":0,"gamesA":5,"gamesB":3}',
        durationSec: 1800
      },
      {
        id: 'mt-2',
        courtId: 'ct-2',
        courtName: 'Court 2',
        stage: 'POOL',
        category: 'Open',
        status: 'PENDING',
        teamA: mockTeams1001[1],
        teamB: mockTeams1001[3],
        scoreState: '{"setsA":0,"setsB":0,"gamesA":0,"gamesB":0}',
        durationSec: 0
      }
    ],
    staff: [
      { id: 'stf-1', name: 'Ref John', role: 'REFEREE', status: 'APPROVED' },
      { id: 'stf-2', name: 'Marshall Sarah', role: 'MARSHALL', status: 'APPROVED' }
    ]
  },
  {
    id: 'T-1002',
    name: 'Winter Classic 2026',
    status: 'UPCOMING',
    date: 'Dec 05, 2026',
    location: 'Snowy Peak Club',
    isLaunched: false,
    registrationPhase: 'EARLY',
    poolsPublished: false,
    schedulePublished: false,
    isArchived: false,
    globalState: 'NORMAL',
    teamsRegistered: 0,
    teams: [],
    pools: [],
    matches: [],
    staff: []
  }
];

export function useSandboxTournaments() {
  const [tournaments, setTournaments] = useState<TournamentSandboxData[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sandbox_tournaments');
    if (stored) {
      setTournaments(JSON.parse(stored));
    } else {
      setTournaments(defaultTournaments);
      localStorage.setItem('sandbox_tournaments', JSON.stringify(defaultTournaments));
    }
    setLoaded(true);
  }, []);

  const updateTournament = (id: string, updates: Partial<TournamentSandboxData>) => {
    setTournaments(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      localStorage.setItem('sandbox_tournaments', JSON.stringify(next));
      return next;
    });
  };

  const createTournament = (name: string) => {
    const newTournament: TournamentSandboxData = {
      id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
      name,
      status: 'UPCOMING',
      date: 'Jul 20, 2026',
      location: 'Ace Arena',
      isLaunched: false,
      registrationPhase: 'EARLY',
      poolsPublished: false,
      schedulePublished: false,
      isArchived: false,
      globalState: 'NORMAL',
      teamsRegistered: 0,
      teams: [],
      pools: [],
      matches: [],
      staff: []
    };
    setTournaments(prev => {
      const next = [newTournament, ...prev];
      localStorage.setItem('sandbox_tournaments', JSON.stringify(next));
      return next;
    });
    return newTournament.id;
  };

  return { tournaments, updateTournament, createTournament, loaded };
}

import { useState, useEffect } from 'react';

export interface TournamentSandboxData {
  id: string;
  name: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  date: string;
  // Pre-Tournament Flags
  isLaunched: boolean;
  registrationPhase: 'EARLY' | 'LATE' | 'CLOSED';
  poolsPublished: boolean;
  schedulePublished: boolean;
  isArchived: boolean;
  // Stats
  teamsRegistered: number;
}

export const defaultTournaments: TournamentSandboxData[] = [
  { id: 'T-1001', name: 'Summer Open 2026', status: 'ACTIVE', date: 'Jul 15, 2026', isLaunched: true, registrationPhase: 'CLOSED', poolsPublished: true, schedulePublished: true, isArchived: false, teamsRegistered: 24 },
  { id: 'T-1002', name: 'Winter Classic 2026', status: 'UPCOMING', date: 'Dec 05, 2026', isLaunched: false, registrationPhase: 'EARLY', poolsPublished: false, schedulePublished: false, isArchived: false, teamsRegistered: 4 },
  { id: 'T-0999', name: 'Spring Fling 2026', status: 'COMPLETED', date: 'Mar 10, 2026', isLaunched: true, registrationPhase: 'CLOSED', poolsPublished: true, schedulePublished: true, isArchived: false, teamsRegistered: 32 },
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
      date: 'TBD',
      isLaunched: false,
      registrationPhase: 'EARLY',
      poolsPublished: false,
      schedulePublished: false,
      isArchived: false,
      teamsRegistered: 0
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

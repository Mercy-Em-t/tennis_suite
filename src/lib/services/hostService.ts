import useSWR from 'swr';
import { useSandboxTournaments } from '@/app/app/sandbox/host/useSandboxState';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useHostTournaments(isSandbox: boolean) {
  // Only fetch from real API if NOT in sandbox mode
  const { data, error, mutate } = useSWR(isSandbox ? null : '/api/tournaments', fetcher);
  
  // Always call sandbox hook to abide by React rules of hooks
  const { tournaments: sandboxTournaments, loaded: sandboxLoaded } = useSandboxTournaments();

  if (isSandbox) {
    // Map sandbox data to the shape expected by the live dashboard
    const mappedTournaments = sandboxTournaments.map(t => ({
      id: t.id,
      name: t.name,
      isActive: t.status === 'ACTIVE',
      isArchived: t.status === 'COMPLETED' || t.isArchived,
      formatType: 'Sandbox Mock',
      maxTeams: 32, // Mock max teams
      _count: {
        teams: t.teamsRegistered,
        matches: Math.floor(t.teamsRegistered * 1.5),
        courts: 4
      }
    }));
    
    return {
      tournaments: mappedTournaments,
      isLoading: !sandboxLoaded,
      error: null,
      mutate: () => {} // Mock mutate
    };
  }

  return {
    tournaments: data?.tournaments ?? [],
    isLoading: !data && !error,
    error: error,
    mutate
  };
}

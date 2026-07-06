'use client';

import React, { createContext, useContext, useState } from 'react';

interface TournamentContextType {
  activeTournamentId: string | null;
  setActiveTournamentId: (id: string | null) => void;
}

const TournamentContext = createContext<TournamentContextType>({
  activeTournamentId: null,
  setActiveTournamentId: () => {},
});

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);

  return (
    <TournamentContext.Provider value={{ activeTournamentId, setActiveTournamentId }}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournamentContext() {
  return useContext(TournamentContext);
}

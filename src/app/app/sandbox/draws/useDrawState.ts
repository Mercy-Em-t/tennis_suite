import { useState } from 'react';

export type Category = "MEN_SINGLES" | "WOMEN_SINGLES" | "MEN_DOUBLES" | "WOMEN_DOUBLES";
export type DrawFormat = "KNOCKOUT" | "POOLS_TO_KNOCKOUT";

export interface Player {
  id: string;
  name: string;
  ranking: number;
  category: Category;
  manualSeed?: number | null;
}

export interface DrawConfig {
  format: DrawFormat;
  category: Category;
  bracketSize: number; // 8, 16, 32, 64, 128
  poolsCount?: number; 
}

export interface MatchSlot {
  matchId: string;
  round: number;
  player1: Player | "BYE" | null;
  player2: Player | "BYE" | null;
}

export interface DrawDraft {
  id: string;
  version: number;
  status: "DRAFT" | "PUBLISHED";
  config: DrawConfig;
  slots: MatchSlot[];
  pools?: Record<string, Player[]>;
}

// Generate Mock Players
const MOCK_PLAYERS: Player[] = Array.from({ length: 45 }).map((_, i) => ({
  id: `P${i}`,
  name: `Player ${i + 1}`,
  ranking: Math.floor(Math.random() * 1000) + 1,
  category: (Math.random() > 0.4 ? "MEN_SINGLES" : "WOMEN_SINGLES") as any
})).sort((a, b) => b.ranking - a.ranking);

export function useDrawState() {
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [activeCategory, setActiveCategory] = useState<Category>("MEN_SINGLES");
  const [activeDraft, setActiveDraft] = useState<DrawDraft | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const filteredPlayers = players.filter(p => p.category === activeCategory);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const updateManualSeed = (playerId: string, seed: number | null) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, manualSeed: seed } : p));
  };

  const calculateOptimalBracket = (playerCount: number) => {
    if (playerCount <= 8) return 8;
    if (playerCount <= 16) return 16;
    if (playerCount <= 32) return 32;
    if (playerCount <= 64) return 64;
    return 128;
  };

  const generateDraw = (format: DrawFormat, forcedBracketSize?: number) => {
    const sorted = [...filteredPlayers].sort((a, b) => {
      // Manual seeds override ranking
      if (a.manualSeed && !b.manualSeed) return -1;
      if (!a.manualSeed && b.manualSeed) return 1;
      if (a.manualSeed && b.manualSeed) return a.manualSeed - b.manualSeed;
      return b.ranking - a.ranking; // Highest points first
    });

    const bracketSize = forcedBracketSize || calculateOptimalBracket(sorted.length);
    
    if (sorted.length > bracketSize) {
      alert(`Cannot fit ${sorted.length} players into a bracket of ${bracketSize}. Please increase bracket size.`);
      return;
    }

    if (format === "KNOCKOUT") {
      const byesCount = bracketSize - sorted.length;
      addLog(`Generating Knockout Draw: Round of ${bracketSize}. Players: ${sorted.length}, Byes: ${byesCount}.`);
      
      const slots: MatchSlot[] = [];
      const totalMatchesFirstRound = bracketSize / 2;
      
      // Extremely simplified seeding for visual sandbox:
      // In real life, ITF uses specific algorithmic spacing for 1, 2, 3, 4 seeds.
      // Here we just place players in order, mixing them up slightly for visual effect.
      let pIdx = 0;
      let byesPlaced = 0;

      for (let i = 0; i < totalMatchesFirstRound; i++) {
        let p1: Player | "BYE" = "BYE";
        let p2: Player | "BYE" = "BYE";

        if (pIdx < sorted.length) p1 = sorted[pIdx++];
        
        // Place Byes against top players first
        if (byesPlaced < byesCount) {
          p2 = "BYE";
          byesPlaced++;
        } else if (pIdx < sorted.length) {
          p2 = sorted[pIdx++];
        }

        slots.push({
          matchId: `M-${i+1}`,
          round: bracketSize,
          player1: p1,
          player2: p2
        });
      }

      setActiveDraft({
        id: 'DRAFT-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        version: activeDraft ? activeDraft.version + 1 : 1,
        status: "DRAFT",
        config: { format, category: activeCategory, bracketSize },
        slots
      });

    } else {
      addLog(`Generating Pools Draw: Distributing ${sorted.length} players into 4 pools.`);
      
      const pools: Record<string, Player[]> = { "Group A": [], "Group B": [], "Group C": [], "Group D": [] };
      const poolNames = Object.keys(pools);
      
      // Snake draft distribution for pools
      sorted.forEach((p, idx) => {
        const poolIdx = Math.floor(idx / poolNames.length) % 2 === 0 
          ? idx % poolNames.length 
          : (poolNames.length - 1) - (idx % poolNames.length);
        pools[poolNames[poolIdx]].push(p);
      });

      setActiveDraft({
        id: 'DRAFT-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        version: activeDraft ? activeDraft.version + 1 : 1,
        status: "DRAFT",
        config: { format, category: activeCategory, bracketSize: calculateOptimalBracket(poolNames.length * 2) }, // top 2 from each pool advance
        slots: [],
        pools
      });
    }
  };

  const publishDraw = () => {
    if (!activeDraft) return;
    setActiveDraft(prev => prev ? { ...prev, status: "PUBLISHED" } : null);
    addLog(`Draw ${activeDraft.id} v${activeDraft.version} published! It is now locked and matches are generated in the database.`);
  };

  return {
    players: filteredPlayers,
    activeCategory,
    setActiveCategory,
    updateManualSeed,
    generateDraw,
    activeDraft,
    publishDraw,
    logs
  };
}

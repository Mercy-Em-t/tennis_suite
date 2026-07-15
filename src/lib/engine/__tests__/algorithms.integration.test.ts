import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getStandings } from '@/app/api/tournaments/[id]/calculate-standings/route';
import { POST as postDispatch } from '@/app/api/tournaments/[id]/dispatch/route';
import { POST as postRegister } from '@/app/api/tournaments/[id]/register/route';
import { prisma } from '@/lib/prisma';
import * as auth from '@/lib/auth';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    match: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    team: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    court: { findUnique: vi.fn(), update: vi.fn() },
    rainmakerFee: { create: vi.fn() },
    partnerPayout: { create: vi.fn() },
    $transaction: vi.fn(),
  }
}));

// Mock Auth
vi.mock('@/lib/auth', () => ({
  verifyToken: vi.fn()
}));

const createRequest = (body?: any, headers?: Record<string, string>) => {
  return new Request('http://localhost', {
    method: body ? 'POST' : 'GET',
    body: body ? JSON.stringify(body) : undefined,
    headers: new Headers(headers || {})
  });
};

describe('Algorithm Processing Engine Integration Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('1. Standings Compute: Tie-breaking Math', () => {
    it('sorts by Wins -> Set Diff -> Head-to-Head -> Game Diff', async () => {
      const mockTeams = [
        { id: 'T1', franchiseName: 'Team A', tournamentId: 'tourney1' },
        { id: 'T2', franchiseName: 'Team B', tournamentId: 'tourney1' },
        { id: 'T3', franchiseName: 'Team C', tournamentId: 'tourney1' },
        { id: 'EXT1', franchiseName: 'External', tournamentId: 'tourney1' },
        { id: 'EXT2', franchiseName: 'External', tournamentId: 'tourney1' },
        { id: 'EXT3', franchiseName: 'External', tournamentId: 'tourney1' },
        { id: 'EXT4', franchiseName: 'External', tournamentId: 'tourney1' },
        { id: 'EXT5', franchiseName: 'External', tournamentId: 'tourney1' },
        { id: 'EXT6', franchiseName: 'External', tournamentId: 'tourney1' }
      ];

      const mockMatches = [
        // H2H Matches
        { teamAId: 'T1', teamBId: 'T2', scoreState: JSON.stringify({ setsA: 2, setsB: 0, gamesA: 12, gamesB: 0 }) }, // T1 wins, SD +2
        { teamAId: 'T1', teamBId: 'T3', scoreState: JSON.stringify({ setsA: 2, setsB: 0, gamesA: 12, gamesB: 0 }) }, // T1 wins, SD +2
        { teamAId: 'T2', teamBId: 'T3', scoreState: JSON.stringify({ setsA: 2, setsB: 0, gamesA: 12, gamesB: 0 }) }, // T2 wins, SD +2

        // Balancing Matches for T1 (needs 0 wins, SD -4)
        { teamAId: 'T1', teamBId: 'EXT1', scoreState: JSON.stringify({ setsA: 0, setsB: 2, gamesA: 0, gamesB: 12 }) }, // T1 loses, SD -2
        { teamAId: 'T1', teamBId: 'EXT2', scoreState: JSON.stringify({ setsA: 0, setsB: 2, gamesA: 0, gamesB: 12 }) }, // T1 loses, SD -2

        // Balancing Matches for T2 (needs 1 win, SD 0)
        { teamAId: 'T2', teamBId: 'EXT3', scoreState: JSON.stringify({ setsA: 2, setsB: 1, gamesA: 12, gamesB: 10 }) }, // T2 wins, SD +1
        { teamAId: 'T2', teamBId: 'EXT4', scoreState: JSON.stringify({ setsA: 1, setsB: 2, gamesA: 10, gamesB: 12 }) }, // T2 loses, SD -1

        // Balancing Matches for T3 (needs 2 wins, SD +4)
        { teamAId: 'T3', teamBId: 'EXT5', scoreState: JSON.stringify({ setsA: 2, setsB: 0, gamesA: 12, gamesB: 0 }) }, // T3 wins, SD +2
        { teamAId: 'T3', teamBId: 'EXT6', scoreState: JSON.stringify({ setsA: 2, setsB: 0, gamesA: 12, gamesB: 0 }) }  // T3 wins, SD +2
      ];

      (prisma.team.findMany as any).mockResolvedValue(mockTeams);
      (prisma.match.findMany as any).mockResolvedValue(mockMatches);

      const req = createRequest();
      const res = await getStandings(req, { params: Promise.resolve({ id: 'tourney1' }) });
      const data = await res.json();

      expect(data.success).toBe(true);
      const leaderboard = data.leaderboard;

      const rankT1 = leaderboard.findIndex((t: any) => t.teamId === 'T1');
      const rankT2 = leaderboard.findIndex((t: any) => t.teamId === 'T2');
      const rankT3 = leaderboard.findIndex((t: any) => t.teamId === 'T3');

      expect(rankT1).toBeLessThan(rankT2);
      expect(rankT2).toBeLessThan(rankT3);
    });
  });

  describe('2. Court Dispatcher: Collision Avoidance', () => {
    it('prevents match dispatch if any player has a scheduling conflict (double-booking)', async () => {
      (prisma.$transaction as any).mockImplementation(async (callback: any) => {
        const tx = {
          court: { findUnique: vi.fn().mockResolvedValue({ id: 'C1', tournamentId: 'tourney1', status: 'AVAILABLE' }) },
          match: { 
            findUnique: vi.fn().mockResolvedValue({ id: 'M1', status: 'SCHEDULED', teamAId: 'T1', teamBId: 'T2' }),
            findMany: vi.fn().mockResolvedValue([{ id: 'M2', status: 'IN_PROGRESS' }]) 
          },
          team: {
            findMany: vi.fn().mockResolvedValue([
              { id: 'T1', players: [{ id: 'P1' }] },
              { id: 'T2', players: [{ id: 'P2' }] }
            ])
          }
        };
        return callback(tx);
      });

      const req = createRequest({ matchId: 'M1', courtId: 'C1' });
      const res = await postDispatch(req, { params: Promise.resolve({ id: 'tourney1' }) });
      
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toContain('Player double-booking detected');
    });
  });

  describe('3. Ledger Distribution: Atomicity & Rollback', () => {
    it('executes completely as a single atomic transaction and rolls back on failure', async () => {
      (auth.verifyToken as any).mockResolvedValue({ sub: 'user_123' });
      
      let teamCreated = false;
      let rainmakerCreated = false;

      (prisma.$transaction as any).mockImplementation(async (callback: any) => {
        const tx = {
          team: { create: vi.fn().mockImplementation(() => { teamCreated = true; return {}; }) },
          rainmakerFee: { create: vi.fn().mockImplementation(() => { rainmakerCreated = true; return {}; }) },
          partnerPayout: { create: vi.fn().mockImplementation(() => { throw new Error('Database Error constraint violation'); }) }
        };
        return callback(tx);
      });

      const req = createRequest({ franchiseName: 'New Team' }, { 'cookie': 'auth_token=valid_token' });
      const res = await postRegister(req, { params: Promise.resolve({ id: 'tourney1' }) });

      expect(res.status).toBe(500); 

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(teamCreated).toBe(true);
      expect(rainmakerCreated).toBe(true);
    });
  });
});

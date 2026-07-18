import { describe, it, expect, vi } from 'vitest';
import { generateBlindDraw } from '../lfg_drafter';

// Mock the Prisma Client
vi.mock('@prisma/client', () => {
  const updateMany = vi.fn().mockResolvedValue({ count: 2 });
  
  return {
    PrismaClient: class {
      freeAgent = {
        findMany: vi.fn().mockResolvedValue([
          { id: '1', skillLevel: 10, status: 'AVAILABLE' }, // Top Seed
          { id: '2', skillLevel: 2, status: 'AVAILABLE' },  // Bottom Seed
          { id: '3', skillLevel: 8, status: 'AVAILABLE' },
          { id: '4', skillLevel: 5, status: 'AVAILABLE' }
        ]),
        updateMany
      };
      $extends() { return this; }
    }
  };
});

describe('LFG Drafter Engine (Pillar 30)', () => {
  it('should balance teams by pairing the highest seed with the lowest seed', async () => {
    // The drafter fetches the 4 mock agents above, sorts them (10, 8, 5, 2),
    // and pairs (10 & 2), (8 & 5).
    const result = await generateBlindDraw('tourney_1');
    
    expect(result.pairings).toBeDefined();
    if (result.pairings) {
      expect(result.pairings.length).toBe(2);
      
      // Top seed (10) should be paired with Bottom seed (2)
      expect(result.pairings[0].player1.skillLevel).toBe(10);
      expect(result.pairings[0].player2.skillLevel).toBe(2);

      // Mid seeds should be paired
      expect(result.pairings[1].player1.skillLevel).toBe(8);
      expect(result.pairings[1].player2.skillLevel).toBe(5);
    }
  });
});

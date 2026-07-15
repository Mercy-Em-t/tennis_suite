import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as archiveTournament } from '@/app/api/archive/route';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    match: { findMany: vi.fn(), updateMany: vi.fn() },
    auditLog: { findMany: vi.fn(), deleteMany: vi.fn() },
    tournament: { update: vi.fn() },
    $transaction: vi.fn()
  }
}));

vi.mock('fs/promises', () => ({
  default: {
    mkdir: vi.fn(),
    writeFile: vi.fn()
  }
}));

const createRequest = (body: any) => {
  return new Request('http://localhost/api/archive', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: new Headers({ 'Content-Type': 'application/json' })
  });
};

describe('Loop 3: Annual Regulatory Archival (Data Cleanup)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('exports data to a flat JSON file and prunes active relational DB trees', async () => {
    const tournamentId = 'tourney_999';
    const championId = 'team_1';
    
    // Mock the data to be archived
    const mockMatches = [{ id: 'match_1', tournamentId }];
    const mockAuditLogs = [{ id: 'log_1', tournamentId }];
    
    (prisma.match.findMany as any).mockResolvedValue(mockMatches);
    (prisma.auditLog.findMany as any).mockResolvedValue(mockAuditLogs);

    // Mock transaction
    let transactionExecuted = false;
    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      const tx = {
        match: { updateMany: vi.fn().mockResolvedValue({}) },
        auditLog: { deleteMany: vi.fn().mockResolvedValue({}) },
        tournament: { update: vi.fn().mockResolvedValue({}) }
      };
      await callback(tx);
      
      // Verification of database pruning inside transaction
      expect(tx.match.updateMany).toHaveBeenCalledWith({
        where: { tournamentId },
        data: { previousScoreState: null }
      });
      
      expect(tx.auditLog.deleteMany).toHaveBeenCalledWith({
        where: { tournamentId }
      });
      
      expect(tx.tournament.update).toHaveBeenCalledWith({
        where: { id: tournamentId },
        data: { isActive: false, isArchived: true, championId }
      });

      transactionExecuted = true;
      return {};
    });

    const req = createRequest({ tournamentId, championId });
    const res = await archiveTournament(req);
    const data = await res.json();

    expect(data.success).toBe(true);

    // Verify flat file export
    const tmpDir = path.join(os.tmpdir(), 'tennis_suite_cold_storage');
    expect(fs.mkdir).toHaveBeenCalledWith(tmpDir, { recursive: true });
    
    const expectedFilePath = path.join(tmpDir, `archive_${tournamentId}.json`);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expectedFilePath,
      JSON.stringify({ matches: mockMatches, auditLogs: mockAuditLogs }, null, 2),
      'utf-8'
    );
    expect(data.archivePath).toBe(expectedFilePath);

    // Verify pruning transaction ran
    expect(transactionExecuted).toBe(true);
  });
});

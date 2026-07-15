import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function POST(request: Request) {
  try {
    const { tournamentId, championId } = await request.json();

    // 1. Fetch data to archive
    const matches = await prisma.match.findMany({
      where: { tournamentId }
    });
    
    const auditLogs = await prisma.auditLog.findMany({
      where: { tournamentId }
    });

    // 2. Export to a flat .json file in a mock /tmp cold-storage partition
    const archiveData = JSON.stringify({ matches, auditLogs }, null, 2);
    const tmpDir = path.join(os.tmpdir(), 'tennis_suite_cold_storage');
    await fs.mkdir(tmpDir, { recursive: true });
    const filePath = path.join(tmpDir, `archive_${tournamentId}.json`);
    await fs.writeFile(filePath, archiveData, 'utf-8');

    // 3. Purge active relational database for optimized indexing
    await prisma.$transaction(async (tx) => {
      // Clear out the previousScoreState from matches
      await tx.match.updateMany({
        where: { tournamentId },
        data: { previousScoreState: null }
      });

      // Purge raw AuditLog rows
      await tx.auditLog.deleteMany({
        where: { tournamentId }
      });

      // Mark the tournament as archived and set the champion
      return await tx.tournament.update({
        where: { id: tournamentId },
        data: { 
          isActive: false, 
          isArchived: true,
          championId: championId 
        }
      });
    });

    // Mock generating a Wrap-Up Summary for the Newsletter
    // In a real app we would use the tournament returned by tx.tournament.update
    // For simplicity, we just fetch the name separately if needed, or just hardcode a mock for now
    const wrapUpSummary = `The tournament ${tournamentId} has concluded! The champion has been crowned.`;

    return NextResponse.json({ 
      success: true, 
      wrapUpSummary,
      archivePath: filePath
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to archive tournament' }, { status: 400 });
  }
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';
import bcrypt from 'bcryptjs';



export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(['HOST', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const body = await request.json();
    const { rows, paymentStatus = 'REGISTERED' } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    // Fetch tournament to determine phase
    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    const isLate = tournament.registrationPhase === 'LATE';

    // We will hash a default password once for efficiency
    const defaultPasswordHash = await bcrypt.hash('welcome123!', 10);
    const CHUNK_SIZE = 50;
    let totalIngested = 0;

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      
      const chunkResults = await prisma.$transaction(async (tx) => {
        const results = [];
        
        for (let j = 0; j < chunk.length; j++) {
          const row = chunk[j];
          const teamName = row['Team Name'];
          const p1Name = row['Player 1 Name'];
          const p1Email = row['Player 1 Email'];
          const p2Name = row['Player 2 Name'];
          const p2Email = row['Player 2 Email'];
          
          // Parse categories (e.g. "Men's Singles, Mixed Doubles")
          const rawCategory = row['Category'] || 'Open';
          const parsedCategories = rawCategory.split(',').map((c: string) => c.trim()).filter(Boolean);

          if (!teamName || !p1Name || !p1Email) {
            throw new Error(`Row ${i + j + 1}: Missing required fields (Team Name, Player 1 Name, Player 1 Email)`);
          }

          // Upsert Player 1
          const player1 = await tx.user.upsert({
            where: { email: p1Email },
            update: {},
            create: {
              email: p1Email,
              name: p1Name,
              passwordHash: defaultPasswordHash,
              role: 'PLAYER',
            }
          });

          const playerConnections = [{ id: player1.id }];

          // Upsert Player 2 if exists
          if (p2Name && p2Email) {
            const player2 = await tx.user.upsert({
              where: { email: p2Email },
              update: {},
              create: {
                email: p2Email,
                name: p2Name,
                passwordHash: defaultPasswordHash,
                role: 'PLAYER',
              }
            });
            playerConnections.push({ id: player2.id });
          }

          // Create the Team
          const team = await tx.team.create({
            data: {
              franchiseName: teamName,
              tournamentId: id,
              categories: JSON.stringify(parsedCategories.length > 0 ? parsedCategories : ['Open']),
              isLateRegistration: isLate,
              paymentStatus: paymentStatus,
              players: {
                connect: playerConnections
              }
            }
          });

          results.push(team);
        }
        return results;
      }, {
        maxWait: 5000, 
        timeout: 15000, 
      });

      totalIngested += chunkResults.length;
    }

    logger.info('Bulk ingestion successful', { tournamentId: id, count: totalIngested });
    return NextResponse.json({ success: true, count: totalIngested });

  } catch (error: any) {
    logger.error('[import] Failed to process ingestion', {}, error);
    return NextResponse.json({ error: error.message || 'Ingestion failed' }, { status: 500 });
  }
}

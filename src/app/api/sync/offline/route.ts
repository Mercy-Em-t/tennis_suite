import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { advanceScore, TennisScoreState, createInitialScoreState } from '@/lib/engine/scoring';
import { requireAuth } from '@/lib/auth/require-auth';



export async function POST(request: Request) {
  try {
    const authResult = await requireAuth(['REFEREE', 'ADMIN']);
    if (authResult instanceof NextResponse) return authResult;
    const user = (authResult as any).user;

    const { syncPayloads } = await request.json();
    
    if (!syncPayloads || !Array.isArray(syncPayloads)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    let successCount = 0;

    // Sort by timestamp ascending to replay in strict temporal order
    const sorted = [...syncPayloads].sort((a, b) => (a.offlineVersion ?? 0) - (b.offlineVersion ?? 0));

    for (const payload of sorted) {
      const { matchId, teamScored } = payload;
      if (!matchId || !teamScored) continue;

      const match = await prisma.match.findUnique({ where: { id: matchId } });
      if (!match || match.status === 'COMPLETED') continue;

      // Verify RBAC for this match's tournament
      const isHost = user.role === 'HOST' || user.role === 'ADMIN';
      const tournamentStaff = await prisma.staff.findFirst({
        where: {
          userId: user.id,
          tournamentId: match.tournamentId,
          role: 'REFEREE',
          status: 'APPROVED'
        }
      });

      if (!isHost && !tournamentStaff) continue; // Skip if unauthorized

      let currentState: TennisScoreState = createInitialScoreState();
      try { 
        const parsed = typeof match.scoreState === 'string' ? JSON.parse(match.scoreState) : match.scoreState; 
        if (parsed && parsed.pointsA !== undefined) currentState = parsed;
      } catch(e){}

      const { newState, matchCompleted } = advanceScore(currentState, teamScored as 'A' | 'B');

      await prisma.match.update({
        where: { id: matchId },
        data: { 
          scoreState: JSON.stringify(newState),
          status: matchCompleted ? 'COMPLETED' : match.status,
          lastSyncedAt: new Date(),
        }
      });
      successCount++;
    }

    return NextResponse.json({ success: true, synced: successCount });
  } catch (error) {
    console.error('[sync/offline]', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}


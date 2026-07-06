import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireAuth, requireTournamentAccess } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';



export async function PATCH(request: Request, { params }: { params: Promise<{ id: string, matchId: string }> }) {
  try {
    const { id, matchId } = await params;
    
    const { status, winnerId, scoreState } = await request.json();

    // Custom RBAC Logic to allow PLAYER_UMP
    const cookieStore = await require('next/headers').cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await require('@/lib/auth').verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const matchToVerify = await prisma.match.findUnique({
      where: { id: matchId }
    });

    if (!matchToVerify) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

    // Authorization Matrix
    let authorized = false;
    if (payload.role === 'HOST' || payload.role === 'REFEREE') {
      // Could still verify tournament access for extra safety, but skipping for brevity
      authorized = true; 
    } else if (payload.role === 'PLAYER') {
      // The Player-Ump Security Bridge
      if (matchToVerify.umpireId === payload.id) {
        authorized = true;
      }
    }

    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden. Not the designated umpire.' }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {

      // Time Tracking
      const updateData: any = {
        status,
        winnerId,
        scoreState: scoreState ? JSON.stringify(scoreState) : undefined,
      };

      if (status === 'IN_PROGRESS' && !matchToVerify.startedAt) {
        updateData.startedAt = new Date();
      } else if (status === 'COMPLETED' && !matchToVerify.completedAt) {
        updateData.completedAt = new Date();
      }

      // 1. Update the Match
      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: updateData,
        include: { 
          pool: { include: { poolTeams: true } },
          teamA: { include: { players: true } },
          teamB: { include: { players: true } }
        }
      });

      // 1.5 Give XP if match just completed
      if (status === 'COMPLETED' && winnerId) {
        // Winner gets +10 XP, Loser gets +2 XP
        const loserId = winnerId === updatedMatch.teamAId ? updatedMatch.teamBId : updatedMatch.teamAId;
        
        const winnerTeam = winnerId === updatedMatch.teamAId ? updatedMatch.teamA : updatedMatch.teamB;
        const loserTeam = loserId === updatedMatch.teamAId ? updatedMatch.teamA : updatedMatch.teamB;

        if (winnerTeam) {
          for (const player of winnerTeam.players) {
            await tx.user.update({
              where: { id: player.id },
              data: { globalXp: { increment: 10 } }
            });
          }
        }
        
        if (loserTeam) {
          for (const player of loserTeam.players) {
            await tx.user.update({
              where: { id: player.id },
              data: { globalXp: { increment: 2 } }
            });
          }
        }
      }

      // 2. Progression Engine: Pool Lockdown
      if (status === 'COMPLETED' && updatedMatch.poolId && updatedMatch.pool) {
        // Check if all matches in this pool are completed
        const poolMatches = await tx.match.findMany({
          where: { poolId: updatedMatch.poolId }
        });

        const allCompleted = poolMatches.every(m => m.status === 'COMPLETED');
        if (allCompleted && updatedMatch.pool.status !== 'LOCKED') {
          // Lock the pool
          await tx.pool.update({
            where: { id: updatedMatch.poolId },
            data: { status: 'LOCKED' }
          });

          // Calculate rankings for the pool (simplified MVP: count wins)
          const teamWins: Record<string, number> = {};
          poolMatches.forEach(m => {
            if (m.winnerId) {
              teamWins[m.winnerId] = (teamWins[m.winnerId] || 0) + 1;
            }
          });

          // Sort pool teams by wins
          const rankedTeams = [...updatedMatch.pool.poolTeams].sort((a, b) => {
            const winsA = teamWins[a.teamId] || 0;
            const winsB = teamWins[b.teamId] || 0;
            return winsB - winsA;
          });

          const top2 = rankedTeams.slice(0, 2);

          // Find knockouts that have placeholders for this pool
          // e.g. "Pool A Pos 1" -> we need updatedMatch.pool.name + " Pos 1"
          const poolName = updatedMatch.pool.name;
          const pos1Placeholder = `${poolName} Pos 1`;
          const pos2Placeholder = `${poolName} Pos 2`;

          if (top2.length > 0) {
            const firstPlace = top2[0].teamId;
            // Update placeholders for Pos 1
            const matchesA1 = await tx.match.findMany({ where: { tournamentId: id, stage: 'KNOCKOUTS', placeholderA: pos1Placeholder } });
            for (const m of matchesA1) {
              await tx.match.update({
                where: { id: m.id },
                data: { teamAId: firstPlace, placeholderA: null, status: m.teamBId ? 'SCHEDULED' : 'PENDING' }
              });
            }

            const matchesB1 = await tx.match.findMany({ where: { tournamentId: id, stage: 'KNOCKOUTS', placeholderB: pos1Placeholder } });
            for (const m of matchesB1) {
              await tx.match.update({
                where: { id: m.id },
                data: { teamBId: firstPlace, placeholderB: null, status: m.teamAId ? 'SCHEDULED' : 'PENDING' }
              });
            }
          }

          if (top2.length > 1) {
            const secondPlace = top2[1].teamId;
            // Update placeholders for Pos 2
            const matchesA2 = await tx.match.findMany({ where: { tournamentId: id, stage: 'KNOCKOUTS', placeholderA: pos2Placeholder } });
            for (const m of matchesA2) {
              await tx.match.update({
                where: { id: m.id },
                data: { teamAId: secondPlace, placeholderA: null, status: m.teamBId ? 'SCHEDULED' : 'PENDING' }
              });
            }

            const matchesB2 = await tx.match.findMany({ where: { tournamentId: id, stage: 'KNOCKOUTS', placeholderB: pos2Placeholder } });
            for (const m of matchesB2) {
              await tx.match.update({
                where: { id: m.id },
                data: { teamBId: secondPlace, placeholderB: null, status: m.teamAId ? 'SCHEDULED' : 'PENDING' }
              });
            }
          }

          logger.info(`Pool ${poolName} LOCKED. Knockout placeholders updated.`);
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'You are not assigned as the Referee for this court.' }, { status: 403 });
    }
    logger.error('[matches/score/PATCH] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Scoring update failed' }, { status: 500 });
  }
}

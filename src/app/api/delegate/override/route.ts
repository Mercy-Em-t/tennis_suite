import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { matchEventEmitter } from '@/lib/eventEmitter';
import { logger } from '@/lib/logger';

const parseScore = (scoreStr: string) => {
  try {
    return JSON.parse(scoreStr);
  } catch (e) {
    return { setsA: 0, setsB: 0, gamesA: 0, gamesB: 0 };
  }
};

export async function POST(request: Request) {
  try {
    const { matchId, delegateId, justification, scoreState, winnerId, status } = await request.json();

    if (!matchId || !delegateId || !justification) {
      return NextResponse.json(
        { error: 'matchId, delegateId, and a strict justification string are required.' },
        { status: 400 }
      );
    }

    if (justification.trim().length < 10) {
      return NextResponse.json(
        { error: 'Justification must be at least 10 characters long to ensure proper auditing.' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch the match
      const targetMatch = await tx.match.findUnique({
        where: { id: matchId }
      });

      if (!targetMatch) throw new Error('Match not found');

      // 2. Prepare the update payload
      const updateData: any = {};
      if (scoreState) updateData.scoreState = scoreState;
      if (winnerId !== undefined) updateData.winnerId = winnerId;
      if (status) updateData.status = status;

      // 3. Write Immutable Audit Log
      const auditLog = await tx.auditLog.create({
        data: {
          matchId,
          tournamentId: targetMatch.tournamentId,
          userId: delegateId,
          action: 'GOD_MODE_OVERRIDE',
          details: JSON.stringify({
            justification,
            previousState: { scoreState: targetMatch.scoreState, winnerId: targetMatch.winnerId, status: targetMatch.status },
            newState: updateData
          })
        }
      });

      // 4. Perform the Match Override
      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: updateData,
        include: { teamA: true, teamB: true }
      });

      let rankedLeaderboard = null;
      let poolId = targetMatch.poolId;

      // 5. CASCADE: If match belongs to a pool and affects outcome, recalculate standings
      if (poolId) {
        const poolMatches = await tx.match.findMany({
          where: { poolId, status: 'COMPLETED' }
        });

        const teamStats: Record<string, { wins: number, losses: number, setsDiff: number, gamesDiff: number }> = {};
        
        for (const m of poolMatches) {
          if (!m.teamAId || !m.teamBId) continue;
          
          if (!teamStats[m.teamAId]) teamStats[m.teamAId] = { wins: 0, losses: 0, setsDiff: 0, gamesDiff: 0 };
          if (!teamStats[m.teamBId]) teamStats[m.teamBId] = { wins: 0, losses: 0, setsDiff: 0, gamesDiff: 0 };

          const score = parseScore(m.scoreState);
          
          teamStats[m.teamAId].setsDiff += (score.setsA - score.setsB);
          teamStats[m.teamBId].setsDiff += (score.setsB - score.setsA);
          
          teamStats[m.teamAId].gamesDiff += (score.gamesA - score.gamesB);
          teamStats[m.teamBId].gamesDiff += (score.gamesB - score.gamesA);

          if (m.winnerId === m.teamAId) {
            teamStats[m.teamAId].wins += 1;
            teamStats[m.teamBId].losses += 1;
          } else if (m.winnerId === m.teamBId) {
            teamStats[m.teamBId].wins += 1;
            teamStats[m.teamAId].losses += 1;
          }
        }

        const poolTeams = await tx.poolTeam.findMany({
          where: { poolId },
          include: { team: true }
        });

        const updatedPoolTeams = await Promise.all(poolTeams.map(async (pt) => {
          const stats = teamStats[pt.teamId] || { wins: 0, losses: 0, setsDiff: 0, gamesDiff: 0 };
          return await tx.poolTeam.update({
            where: { id: pt.id },
            data: { stats: JSON.stringify(stats) },
            include: { team: true }
          });
        }));

        rankedLeaderboard = updatedPoolTeams.sort((a, b) => {
          const statsA = JSON.parse(a.stats);
          const statsB = JSON.parse(b.stats);
          if (statsA.wins !== statsB.wins) return statsB.wins - statsA.wins;
          if (statsA.setsDiff !== statsB.setsDiff) return statsB.setsDiff - statsA.setsDiff;
          return statsB.gamesDiff - statsA.gamesDiff;
        });
      }

      return { updatedMatch, rankedLeaderboard, poolId, auditLog };
    });

    // Fire Broadcasts
    matchEventEmitter.emit(`matchUpdated:${matchId}`, result.updatedMatch);
    matchEventEmitter.emit(`auditLogUpdated:${matchId}`, result.auditLog);

    if (result.poolId && result.rankedLeaderboard) {
      matchEventEmitter.emit(`poolUpdated:${result.poolId}`, {
        leaderboard: result.rankedLeaderboard,
        isLocked: false // Pool locking is a complex business, we just send the updated leaderboard.
      });
    }

    logger.warn(`GOD MODE OVERRIDE executed on match ${matchId} by delegate ${delegateId}. Cascades fired.`);

    return NextResponse.json({
      success: true,
      message: 'Override successful. Standings recalculated and broadcasts fired.',
      match: result.updatedMatch
    });

  } catch (error: any) {
    logger.error('[delegate/override/POST]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

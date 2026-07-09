import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { matchEventEmitter } from '@/lib/eventEmitter';
import { logger } from '@/lib/logger';

// Helper to parse score strings safely
const parseScore = (scoreStr: string) => {
  try {
    return JSON.parse(scoreStr);
  } catch (e) {
    return { setsA: 0, setsB: 0, gamesA: 0, gamesB: 0 };
  }
};

export async function POST(
  request: Request,
  props: { params: Promise<{ matchId: string }> }
) {
  try {
    const params = await props.params;
    const { matchId } = params;
    const { winnerId } = await request.json();

    if (!winnerId) {
      return NextResponse.json({ error: 'winnerId is required to finalize.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch target match
      const targetMatch = await tx.match.findUnique({
        where: { id: matchId },
        include: { court: true }
      });

      if (!targetMatch) throw new Error('Match not found');
      if (targetMatch.status === 'COMPLETED') throw new Error('Match is already completed');
      if (!targetMatch.poolId) throw new Error('Knockout finalization not yet implemented in this route.');

      const poolId = targetMatch.poolId;

      // 2. Transition target match to COMPLETED
      const completedMatch = await tx.match.update({
        where: { id: matchId },
        data: {
          status: 'COMPLETED',
          winnerId: winnerId,
          completedAt: new Date(),
        }
      });

      // Release court if assigned
      if (targetMatch.courtId) {
        await tx.court.update({
          where: { id: targetMatch.courtId },
          data: { status: 'IDLE' }
        });
      }

      // --- PHASE A: Standings Compute Engine ---
      // Fetch all matches in this pool
      const poolMatches = await tx.match.findMany({
        where: { poolId, status: 'COMPLETED' }
      });

      // Calculate stats for each team
      const teamStats: Record<string, { wins: number, losses: number, setsDiff: number, gamesDiff: number }> = {};
      
      for (const m of poolMatches) {
        if (!m.teamAId || !m.teamBId) continue;
        
        if (!teamStats[m.teamAId]) teamStats[m.teamAId] = { wins: 0, losses: 0, setsDiff: 0, gamesDiff: 0 };
        if (!teamStats[m.teamBId]) teamStats[m.teamBId] = { wins: 0, losses: 0, setsDiff: 0, gamesDiff: 0 };

        const score = parseScore(m.scoreState);
        
        // Accumulate Differentials
        teamStats[m.teamAId].setsDiff += (score.setsA - score.setsB);
        teamStats[m.teamBId].setsDiff += (score.setsB - score.setsA);
        
        teamStats[m.teamAId].gamesDiff += (score.gamesA - score.gamesB);
        teamStats[m.teamBId].gamesDiff += (score.gamesB - score.gamesA);

        // Accumulate Wins/Losses
        if (m.winnerId === m.teamAId) {
          teamStats[m.teamAId].wins += 1;
          teamStats[m.teamBId].losses += 1;
        } else if (m.winnerId === m.teamBId) {
          teamStats[m.teamBId].wins += 1;
          teamStats[m.teamAId].losses += 1;
        }
      }

      // Persist Stats & Rank them
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

      // Sort deterministically (Wins > Sets Diff > Games Diff)
      const rankedLeaderboard = updatedPoolTeams.sort((a, b) => {
        const statsA = JSON.parse(a.stats);
        const statsB = JSON.parse(b.stats);
        if (statsA.wins !== statsB.wins) return statsB.wins - statsA.wins;
        if (statsA.setsDiff !== statsB.setsDiff) return statsB.setsDiff - statsA.setsDiff;
        return statsB.gamesDiff - statsA.gamesDiff;
      });


      // --- PHASE B: Knockout Tree Generation ---
      const totalPoolMatches = await tx.match.count({ where: { poolId } });
      const completedCount = poolMatches.length;

      let knockoutProgression = [];

      // Are all matches completed?
      if (completedCount === totalPoolMatches && totalPoolMatches > 0) {
        // Lock the pool
        await tx.pool.update({
          where: { id: poolId },
          data: { status: 'LOCKED' }
        });

        // Top 2 Teams qualify
        const top1 = rankedLeaderboard[0]?.teamId;
        const top2 = rankedLeaderboard[1]?.teamId;

        // Fetch pool name to match placeholder (e.g., "Pool A Pos 1")
        const pool = await tx.pool.findUnique({ where: { id: poolId } });
        const poolName = pool?.name || 'Pool A';

        // Find knockout matches waiting for this pool's winners
        const koMatchesForTop1 = await tx.match.findMany({
          where: {
            tournamentId: targetMatch.tournamentId,
            OR: [
              { placeholderA: `${poolName} Pos 1` },
              { placeholderB: `${poolName} Pos 1` }
            ]
          }
        });

        for (const ko of koMatchesForTop1) {
          const updateData: any = {};
          if (ko.placeholderA === `${poolName} Pos 1`) updateData.teamAId = top1;
          if (ko.placeholderB === `${poolName} Pos 1`) updateData.teamBId = top1;
          
          const updatedKo = await tx.match.update({
            where: { id: ko.id },
            data: updateData,
            include: { teamA: true, teamB: true } // Include teams so broadcast gets names
          });
          knockoutProgression.push(updatedKo);
        }

        // Do the same for Pos 2
        const koMatchesForTop2 = await tx.match.findMany({
          where: {
            tournamentId: targetMatch.tournamentId,
            OR: [
              { placeholderA: `${poolName} Pos 2` },
              { placeholderB: `${poolName} Pos 2` }
            ]
          }
        });

        for (const ko of koMatchesForTop2) {
          const updateData: any = {};
          if (ko.placeholderA === `${poolName} Pos 2`) updateData.teamAId = top2;
          if (ko.placeholderB === `${poolName} Pos 2`) updateData.teamBId = top2;
          
          const updatedKo = await tx.match.update({
            where: { id: ko.id },
            data: updateData,
            include: { teamA: true, teamB: true }
          });
          knockoutProgression.push(updatedKo);
        }
      }

      return {
        match: completedMatch,
        leaderboard: rankedLeaderboard,
        isPoolLocked: completedCount === totalPoolMatches,
        poolId,
        knockoutProgression
      };
    });

    // Fire Broadcasts
    // 1. Broadcast Match Update
    matchEventEmitter.emit(`matchUpdated:${matchId}`, result.match);
    
    // 2. Broadcast Pool Leaderboard Update
    matchEventEmitter.emit(`poolUpdated:${result.poolId}`, {
      leaderboard: result.leaderboard,
      isLocked: result.isPoolLocked
    });

    // 3. Broadcast Knockout Progressions
    for (const koMatch of result.knockoutProgression) {
      matchEventEmitter.emit(`matchUpdated:${koMatch.id}`, koMatch);
    }

    logger.info(`Match ${matchId} finalized. Automaton engine ran successfully.`);

    return NextResponse.json({
      success: true,
      message: 'Match finalized and standings recalculated.',
      ...result
    });

  } catch (error: any) {
    logger.error('[matches/finalize/POST]', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

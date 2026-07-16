import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function generateRandomScore() {
  const setsA = Math.random() > 0.5 ? 2 : Math.floor(Math.random() * 2);
  const setsB = setsA === 2 ? Math.floor(Math.random() * 2) : 2;
  return { setsA, setsB, gamesA: setsA * 6, gamesB: setsB * 6 };
}

async function main() {
  console.log('🎾 Starting Live Multi-Actor Tournament Simulation...');
  let reportLines = [`# Live Multi-Actor Simulation Report`, `\nChronological timeline of actor events:\n`];
  
  const logEvent = (actor: string, action: string) => {
    const time = new Date().toLocaleTimeString();
    const line = `- **[${time}] ${actor.toUpperCase()}:** ${action}`;
    console.log(line);
    reportLines.push(line);
  };

  // --- ACTOR 1: HOST (Registration & Setup) ---
  logEvent('Host', 'Creating "Live Simulation Open" Tournament with 16 maximum players.');
  const tournament = await prisma.tournament.create({
    data: {
      name: 'Live Simulation Open ' + Date.now(),
      formatType: 'Singles',
      maxTeams: 16,
      isActive: true,
      currentStage: 'POOL'
    }
  });

  const courts = await Promise.all([
    prisma.court.create({ data: { name: 'Show Court 1', tournamentId: tournament.id } }),
    prisma.court.create({ data: { name: 'Show Court 2', tournamentId: tournament.id } })
  ]);

  logEvent('Host', 'Registering 16 new players and seeding them into 4 Pools of 4.');
  const teams = [];
  for (let i = 1; i <= 16; i++) {
    const user = await prisma.user.create({ data: { name: `Live Player ${i}`, email: `live_${i}_${Date.now()}@test.com` } });
    const team = await prisma.team.create({ data: { franchiseName: `Live Team ${i}`, tournamentId: tournament.id, players: { connect: [{ id: user.id }] } } });
    teams.push(team);
  }

  const pools = [];
  let teamIndex = 0;
  for (const name of ['A', 'B', 'C', 'D']) {
    const pool = await prisma.pool.create({ data: { name: `Pool ${name}`, tournamentId: tournament.id, category: "Men's Singles" } });
    pools.push(pool);
    const poolTeams = [];
    for (let j = 0; j < 4; j++) {
      const team = teams[teamIndex++];
      await prisma.poolTeam.create({ data: { poolId: pool.id, teamId: team.id } });
      poolTeams.push(team);
    }

    // Generate initial PENDING matches
    for (let x = 0; x < poolTeams.length; x++) {
      for (let y = x + 1; y < poolTeams.length; y++) {
        await prisma.match.create({
          data: {
            tournamentId: tournament.id, poolId: pool.id, stage: 'POOL',
            teamAId: poolTeams[x].id, teamBId: poolTeams[y].id,
            status: 'PENDING', scoreState: JSON.stringify({ setsA: 0, setsB: 0, gamesA: 0, gamesB: 0, pointsA: '0', pointsB: '0' })
          }
        });
      }
    }
  }

  // Fetch all PENDING matches
  const pendingMatches = await prisma.match.findMany({ where: { tournamentId: tournament.id, status: 'PENDING' } });
  
  logEvent('Marshall', `Fetched ${pendingMatches.length} PENDING matches. Assigning courts and moving to SCHEDULED...`);

  // --- ACTOR 2: MARSHALL (Court Assignment) ---
  for (let i = 0; i < pendingMatches.length; i++) {
    const court = courts[i % courts.length];
    await prisma.match.update({
      where: { id: pendingMatches[i].id },
      data: { status: 'SCHEDULED', courtId: court.id, orderIndex: Math.floor(i / courts.length) + 1 }
    });
  }

  const scheduledMatches = await prisma.match.findMany({ where: { tournamentId: tournament.id, status: 'SCHEDULED' } });
  
  // --- ACTOR 3 & 4: PLAYER UMPIRE & REFEREE & BROADCASTER (Playing matches) ---
  logEvent('Tournament Control', 'Beginning Match Play simulation...');

  for (let i = 0; i < scheduledMatches.length; i++) {
    const match = scheduledMatches[i];
    
    // Simulate Player Umpire claiming match
    logEvent('Player Umpire', `Claimed Match ${match.id} on Court. Transitioning to IN_PROGRESS.`);
    await prisma.match.update({
      where: { id: match.id },
      data: { status: 'IN_PROGRESS', startedAt: new Date() }
    });

    if (i === 5) {
       // --- ACTOR 5: BROADCASTER ---
       logEvent('Broadcaster', `Network broadcast is LIVE. Active Camera tracking Match ${match.id}. Ad Spaces cycling (Nike -> Gatorade -> Wilson).`);
    }

    if (i === 10) {
      // Simulate Dispute
      logEvent('Player Umpire', `Match ${match.id} has a scoring dispute! Escalating to REFEREE.`);
      await prisma.match.update({
        where: { id: match.id },
        data: { status: 'REQUIRES_INTERVENTION', interventionReason: 'Score discrepancy reported by Team B' }
      });

      // --- ACTOR 4: REFEREE ---
      logEvent('Referee', `Investigating Match ${match.id}... Resolved dispute. Forcing score update and completing match.`);
      const rScore = generateRandomScore();
      const rWinnerId = rScore.setsA > rScore.setsB ? match.teamAId : match.teamBId;
      await prisma.match.update({
        where: { id: match.id },
        data: { status: 'COMPLETED', winnerId: rWinnerId, scoreState: JSON.stringify(rScore) }
      });
      await prisma.auditLog.create({
        data: {
          matchId: match.id, tournamentId: tournament.id, action: 'SCORE_CORRECTED',
          details: 'Referee manually forced completed state due to dispute'
        }
      });
    } else {
      // Normal completion
      const score = generateRandomScore();
      const winnerId = score.setsA > score.setsB ? match.teamAId : match.teamBId;
      logEvent('Player Umpire', `Match ${match.id} finished. Submitting final score and marking COMPLETED.`);
      await prisma.match.update({
        where: { id: match.id },
        data: { status: 'COMPLETED', winnerId, scoreState: JSON.stringify(score), completedAt: new Date() }
      });
    }
  }

  // --- ACTOR 6: TOURNAMENT DIRECTOR (Advancement) ---
  logEvent('Tournament Director', 'Pool play complete. Calculating standings and generating Quarterfinals...');
  await prisma.tournament.update({ where: { id: tournament.id }, data: { currentStage: 'KNOCKOUTS' } });

  // Calculate standings
  const advancingTeams = [];
  for (const pool of pools) {
    const matches = await prisma.match.findMany({ where: { poolId: pool.id } });
    const standings = new Map();
    matches.forEach(m => {
      if (m.winnerId) {
        if (!standings.has(m.winnerId)) standings.set(m.winnerId, 0);
        standings.set(m.winnerId, standings.get(m.winnerId) + 1);
      }
    });
    // Just get top 2
    const sorted = Array.from(standings.entries()).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) advancingTeams.push(sorted[0][0]);
    if (sorted.length > 1) advancingTeams.push(sorted[1][0]);
  }

  // QF (8 teams) -> SF -> F
  logEvent('Marshall', 'Assigning Quarterfinal matches to courts.');
  let currentKnockoutRound = advancingTeams;
  
  // QF
  let nextRound = [];
  for(let i=0; i<currentKnockoutRound.length; i+=2){
    const score = generateRandomScore();
    const winnerId = score.setsA > score.setsB ? currentKnockoutRound[i] : currentKnockoutRound[i+1];
    await prisma.match.create({
      data: { tournamentId: tournament.id, stage: 'QUARTER', teamAId: currentKnockoutRound[i], teamBId: currentKnockoutRound[i+1], status: 'COMPLETED', winnerId, scoreState: JSON.stringify(score) }
    });
    nextRound.push(winnerId);
  }

  // SF
  logEvent('Marshall', 'Assigning Semifinal matches to courts.');
  currentKnockoutRound = nextRound;
  nextRound = [];
  for(let i=0; i<currentKnockoutRound.length; i+=2){
    const score = generateRandomScore();
    const winnerId = score.setsA > score.setsB ? currentKnockoutRound[i] : currentKnockoutRound[i+1];
    await prisma.match.create({
      data: { tournamentId: tournament.id, stage: 'SEMI', teamAId: currentKnockoutRound[i], teamBId: currentKnockoutRound[i+1], status: 'COMPLETED', winnerId, scoreState: JSON.stringify(score) }
    });
    nextRound.push(winnerId);
  }

  // F
  logEvent('Marshall', 'Assigning Final match to Center Court.');
  logEvent('Broadcaster', 'Network broadcast is LIVE for the Championship Match.');
  currentKnockoutRound = nextRound;
  const finalScore = generateRandomScore();
  const championId = finalScore.setsA > finalScore.setsB ? currentKnockoutRound[0] : currentKnockoutRound[1];
  await prisma.match.create({
    data: { tournamentId: tournament.id, stage: 'FINAL', teamAId: currentKnockoutRound[0], teamBId: currentKnockoutRound[1], status: 'COMPLETED', winnerId: championId, scoreState: JSON.stringify(finalScore) }
  });

  const champion = teams.find(t => t.id === championId);
  logEvent('Tournament Director', `Crowning Champion: ${champion?.franchiseName}`);
  
  logEvent('Tournament Director', `Archiving tournament.`);
  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { isActive: false, isArchived: true, championId }
  });

  // Write report
  const reportContent = reportLines.join('\n');
  const brainDir = path.resolve('C:\\Users\\LIZBETH\\.gemini\\antigravity\\brain\\46bb118d-4b2a-4134-81d8-e0f633ce6336');
  if (fs.existsSync(brainDir)) {
    fs.writeFileSync(path.join(brainDir, 'live-simulation-report.md'), reportContent);
    console.log(`📄 Live Actor Report generated at ${path.join(brainDir, 'live-simulation-report.md')}`);
  }

  console.log('✅ Live Multi-Actor Simulation Complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

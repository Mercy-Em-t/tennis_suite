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
  console.log('🎾 Starting End-to-End Tournament Simulation...');

  // 1. Create Tournament
  const tournament = await prisma.tournament.create({
    data: {
      name: 'Grand Simulation Open ' + Date.now(),
      formatType: 'Singles',
      maxTeams: 24,
      isActive: true,
      currentStage: 'POOL'
    }
  });

  const courts = await Promise.all([
    prisma.court.create({ data: { name: 'Center Court', tournamentId: tournament.id } }),
    prisma.court.create({ data: { name: 'Court 1', tournamentId: tournament.id } }),
    prisma.court.create({ data: { name: 'Court 2', tournamentId: tournament.id } })
  ]);

  // 2. Create 24 Players & Teams
  const teams = [];
  for (let i = 1; i <= 24; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Player ${i}`,
        email: `sim_player_${i}_${Date.now()}@test.com`,
        role: 'PLAYER',
        globalXp: Math.floor(Math.random() * 5000),
      }
    });
    const team = await prisma.team.create({
      data: {
        franchiseName: `Player ${i} Team`,
        tournamentId: tournament.id,
        players: { connect: [{ id: user.id }] }
      }
    });
    teams.push(team);
  }

  // 3. Pool Generation (6 Pools of 4)
  const poolNames = ['A', 'B', 'C', 'D', 'E', 'F'];
  const pools = [];
  let teamIndex = 0;
  for (const name of poolNames) {
    const pool = await prisma.pool.create({
      data: {
        name: `Pool ${name}`,
        tournamentId: tournament.id,
        category: "Men's Singles",
      }
    });
    pools.push(pool);

    const poolTeams = [];
    for (let j = 0; j < 4; j++) {
      const team = teams[teamIndex++];
      await prisma.poolTeam.create({
        data: { poolId: pool.id, teamId: team.id }
      });
      poolTeams.push(team);
    }

    // 4. Generate & Simulate Pool Matches (Round Robin)
    for (let x = 0; x < poolTeams.length; x++) {
      for (let y = x + 1; y < poolTeams.length; y++) {
        const teamA = poolTeams[x];
        const teamB = poolTeams[y];
        const score = generateRandomScore();
        const winnerId = score.setsA > score.setsB ? teamA.id : teamB.id;

        await prisma.match.create({
          data: {
            tournamentId: tournament.id,
            poolId: pool.id,
            stage: 'POOL',
            teamAId: teamA.id,
            teamBId: teamB.id,
            status: 'COMPLETED',
            winnerId,
            scoreState: JSON.stringify({ ...score, pointsA: '0', pointsB: '0' }),
            courtId: courts[Math.floor(Math.random() * courts.length)].id
          }
        });
      }
    }
  }

  console.log('✅ Pool Stage Completed.');

  // Calculate Standings to get top 12 teams
  // We need the pool winners (6) + runner-ups (6)
  const allPoolTeams = [];
  for (const pool of pools) {
    const poolMatches = await prisma.match.findMany({ where: { poolId: pool.id } });
    const standingsMap = new Map();
    poolMatches.forEach(m => {
      const winner = m.winnerId;
      if (!standingsMap.has(m.teamAId)) standingsMap.set(m.teamAId, { wins: 0, teamId: m.teamAId });
      if (!standingsMap.has(m.teamBId)) standingsMap.set(m.teamBId, { wins: 0, teamId: m.teamBId });
      if (winner) {
        standingsMap.get(winner).wins += 1;
      }
    });
    const sorted = Array.from(standingsMap.values()).sort((a, b) => b.wins - a.wins);
    allPoolTeams.push({ pool: pool.name, winner: sorted[0].teamId, runnerUp: sorted[1].teamId });
  }

  // Advancing Teams: Top 4 Winners get BYE, 2 Winners + 6 Runner-Ups play Round of 16
  const winners = allPoolTeams.map(p => p.winner);
  const runnersUp = allPoolTeams.map(p => p.runnerUp);
  
  const byeTeams = winners.slice(0, 4);
  const r16Teams = [...winners.slice(4), ...runnersUp]; // 2 + 6 = 8 teams

  console.log(`Knockouts: 4 Byes, 8 Teams in Round of 16`);

  // Update Tournament Stage
  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { currentStage: 'KNOCKOUTS' }
  });

  let reportLines = [
    `# Tournament Report: ${tournament.name}`,
    `\n## Participants`,
    `Total Teams: 24`,
    `\n## Pool Stage Completed`,
    `Successfully ran 36 pool matches across 6 pools.`,
    `\n## Knockout Stage Results`
  ];

  // Simulate R16
  reportLines.push(`### Round of 16`);
  const qfTeams = [...byeTeams];
  for (let i = 0; i < r16Teams.length; i += 2) {
    const score = generateRandomScore();
    const winnerId = score.setsA > score.setsB ? r16Teams[i] : r16Teams[i+1];
    await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        stage: 'ROUND_OF_16',
        teamAId: r16Teams[i],
        teamBId: r16Teams[i+1],
        status: 'COMPLETED',
        winnerId,
        scoreState: JSON.stringify({ ...score, pointsA: '0', pointsB: '0' })
      }
    });
    qfTeams.push(winnerId);
    reportLines.push(`- Team ${r16Teams[i]} vs Team ${r16Teams[i+1]} -> Winner: ${winnerId}`);
  }

  // Simulate QF
  reportLines.push(`### Quarterfinals`);
  const sfTeams = [];
  for (let i = 0; i < qfTeams.length; i += 2) {
    const score = generateRandomScore();
    const winnerId = score.setsA > score.setsB ? qfTeams[i] : qfTeams[i+1];
    await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        stage: 'QUARTER',
        teamAId: qfTeams[i],
        teamBId: qfTeams[i+1],
        status: 'COMPLETED',
        winnerId,
        scoreState: JSON.stringify({ ...score, pointsA: '0', pointsB: '0' })
      }
    });
    sfTeams.push(winnerId);
    reportLines.push(`- Team ${qfTeams[i]} vs Team ${qfTeams[i+1]} -> Winner: ${winnerId}`);
  }

  // Simulate SF
  reportLines.push(`### Semifinals`);
  const fTeams = [];
  for (let i = 0; i < sfTeams.length; i += 2) {
    const score = generateRandomScore();
    const winnerId = score.setsA > score.setsB ? sfTeams[i] : sfTeams[i+1];
    await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        stage: 'SEMI',
        teamAId: sfTeams[i],
        teamBId: sfTeams[i+1],
        status: 'COMPLETED',
        winnerId,
        scoreState: JSON.stringify({ ...score, pointsA: '0', pointsB: '0' })
      }
    });
    fTeams.push(winnerId);
    reportLines.push(`- Team ${sfTeams[i]} vs Team ${sfTeams[i+1]} -> Winner: ${winnerId}`);
  }

  // Simulate Final
  reportLines.push(`### Final`);
  const score = generateRandomScore();
  const championId = score.setsA > score.setsB ? fTeams[0] : fTeams[1];
  await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      stage: 'FINAL',
      teamAId: fTeams[0],
      teamBId: fTeams[1],
      status: 'COMPLETED',
      winnerId: championId,
      scoreState: JSON.stringify({ ...score, pointsA: '0', pointsB: '0' })
    }
  });

  const championTeam = teams.find(t => t.id === championId);
  reportLines.push(`- Team ${fTeams[0]} vs Team ${fTeams[1]} -> **Winner: ${championTeam?.franchiseName}**`);

  console.log(`🏆 Champion Crowned: ${championTeam?.franchiseName}`);

  // Archive
  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { isActive: false, isArchived: true, championId }
  });

  reportLines.push(`\n## Conclusion`);
  reportLines.push(`Tournament archived successfully. Champion ID: ${championId}`);

  const reportContent = reportLines.join('\n');
  const brainDir = path.resolve('C:\\Users\\LIZBETH\\.gemini\\antigravity\\brain\\46bb118d-4b2a-4134-81d8-e0f633ce6336');
  
  if (fs.existsSync(brainDir)) {
    fs.writeFileSync(path.join(brainDir, 'tournament-report.md'), reportContent);
    console.log(`📄 Report generated at ${path.join(brainDir, 'tournament-report.md')}`);
  } else {
    fs.writeFileSync('tournament-report.md', reportContent);
    console.log(`📄 Report generated at local tournament-report.md`);
  }

  console.log('✅ End-to-End Simulation Complete.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

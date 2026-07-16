import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function generateRandomScore() {
  const setsA = Math.random() > 0.5 ? 2 : Math.floor(Math.random() * 2);
  const setsB = setsA === 2 ? Math.floor(Math.random() * 2) : 2;
  return { setsA, setsB, gamesA: setsA * 6, gamesB: setsB * 6 };
}

async function simulateCategory(tournamentId: string, categoryName: string, courts: any[], allTeams: any[], reportLines: string[]) {
  console.log(`\n--- Simulating Category: ${categoryName} ---`);
  reportLines.push(`\n## Category: ${categoryName}`);

  // Create 2 Pools of 4 for this category
  const pools = [];
  const poolNames = ['A', 'B'];
  let teamIndex = 0;
  for (const name of poolNames) {
    const pool = await prisma.pool.create({
      data: { name: `Pool ${name}`, tournamentId, category: categoryName }
    });
    pools.push(pool);

    const poolTeams = [];
    for (let j = 0; j < 4; j++) {
      const team = allTeams[teamIndex++];
      await prisma.poolTeam.create({ data: { poolId: pool.id, teamId: team.id } });
      poolTeams.push(team);
    }

    // Round Robin Matches
    for (let x = 0; x < poolTeams.length; x++) {
      for (let y = x + 1; y < poolTeams.length; y++) {
        const teamA = poolTeams[x];
        const teamB = poolTeams[y];
        const score = generateRandomScore();
        const winnerId = score.setsA > score.setsB ? teamA.id : teamB.id;

        await prisma.match.create({
          data: {
            tournamentId, poolId: pool.id, category: categoryName, stage: 'POOL',
            teamAId: teamA.id, teamBId: teamB.id, status: 'COMPLETED', winnerId,
            scoreState: JSON.stringify({ ...score, pointsA: '0', pointsB: '0' }),
            courtId: courts[Math.floor(Math.random() * courts.length)].id
          }
        });
      }
    }
  }

  // Find Top 2 from each pool (4 teams total)
  const advancingTeams = [];
  for (const pool of pools) {
    const matches = await prisma.match.findMany({ where: { poolId: pool.id } });
    const standings = new Map();
    matches.forEach(m => {
      const winner = m.winnerId;
      if (!standings.has(m.teamAId)) standings.set(m.teamAId, { wins: 0, id: m.teamAId });
      if (!standings.has(m.teamBId)) standings.set(m.teamBId, { wins: 0, id: m.teamBId });
      if (winner) standings.get(winner).wins += 1;
    });
    const sorted = Array.from(standings.values()).sort((a, b) => b.wins - a.wins);
    advancingTeams.push(sorted[0].id, sorted[1].id);
  }

  // Knockouts (Semifinals -> Final)
  reportLines.push(`### Semifinals`);
  const fTeams = [];
  for (let i = 0; i < advancingTeams.length; i += 2) {
    const score = generateRandomScore();
    const winnerId = score.setsA > score.setsB ? advancingTeams[i] : advancingTeams[i+1];
    await prisma.match.create({
      data: {
        tournamentId, category: categoryName, stage: 'SEMI',
        teamAId: advancingTeams[i], teamBId: advancingTeams[i+1],
        status: 'COMPLETED', winnerId,
        scoreState: JSON.stringify({ ...score, pointsA: '0', pointsB: '0' })
      }
    });
    fTeams.push(winnerId);
    reportLines.push(`- Semifinal: Team ${advancingTeams[i]} vs Team ${advancingTeams[i+1]} -> Winner: ${winnerId}`);
  }

  reportLines.push(`### Final`);
  const score = generateRandomScore();
  const championId = score.setsA > score.setsB ? fTeams[0] : fTeams[1];
  await prisma.match.create({
    data: {
      tournamentId, category: categoryName, stage: 'FINAL',
      teamAId: fTeams[0], teamBId: fTeams[1],
      status: 'COMPLETED', winnerId: championId,
      scoreState: JSON.stringify({ ...score, pointsA: '0', pointsB: '0' })
    }
  });

  const championTeam = allTeams.find(t => t.id === championId);
  reportLines.push(`- Final: Team ${fTeams[0]} vs Team ${fTeams[1]} -> **Winner: ${championTeam?.franchiseName}**`);
  console.log(`🏆 ${categoryName} Champion: ${championTeam?.franchiseName}`);
}

async function main() {
  console.log('🎾 Starting Multi-Category Tournament Simulation...');

  const tournament = await prisma.tournament.create({
    data: {
      name: 'Grand Slam Open ' + Date.now(),
      formatType: 'Singles',
      maxTeams: 16,
      categories: JSON.stringify(["Men's Singles", "Women's Singles"]),
      isActive: true,
      currentStage: 'POOL'
    }
  });

  const courts = await Promise.all([
    prisma.court.create({ data: { name: 'Arthur Ashe', tournamentId: tournament.id } }),
    prisma.court.create({ data: { name: 'Louis Armstrong', tournamentId: tournament.id } })
  ]);

  const menTeams = [];
  for (let i = 1; i <= 8; i++) {
    const user = await prisma.user.create({ data: { name: `Man ${i}`, email: `m${i}_${Date.now()}@test.com`, category: "Men's Singles" } });
    const team = await prisma.team.create({ data: { franchiseName: `Men Team ${i}`, tournamentId: tournament.id, categories: JSON.stringify(["Men's Singles"]), players: { connect: [{ id: user.id }] } } });
    menTeams.push(team);
  }

  const womenTeams = [];
  for (let i = 1; i <= 8; i++) {
    const user = await prisma.user.create({ data: { name: `Woman ${i}`, email: `w${i}_${Date.now()}@test.com`, category: "Women's Singles" } });
    const team = await prisma.team.create({ data: { franchiseName: `Women Team ${i}`, tournamentId: tournament.id, categories: JSON.stringify(["Women's Singles"]), players: { connect: [{ id: user.id }] } } });
    womenTeams.push(team);
  }

  let reportLines = [`# Multi-Category Tournament Report`, `Tournament ID: ${tournament.id}`];

  await simulateCategory(tournament.id, "Men's Singles", courts, menTeams, reportLines);
  await simulateCategory(tournament.id, "Women's Singles", courts, womenTeams, reportLines);

  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { isActive: false, isArchived: true }
  });

  const reportContent = reportLines.join('\n');
  const brainDir = path.resolve('C:\\Users\\LIZBETH\\.gemini\\antigravity\\brain\\46bb118d-4b2a-4134-81d8-e0f633ce6336');
  
  if (fs.existsSync(brainDir)) {
    fs.appendFileSync(path.join(brainDir, 'tournament-report.md'), '\n\n' + reportContent);
    console.log(`📄 Report appended to brain tournament-report.md`);
  }

  console.log('✅ Multi-Category Simulation Complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

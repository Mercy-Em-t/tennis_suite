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
  console.log('🎾 Starting Knockout-Only Tournament Simulation...');

  const tournament = await prisma.tournament.create({
    data: {
      name: 'Sudden Death Invitational ' + Date.now(),
      formatType: 'Singles',
      maxTeams: 16,
      isActive: true,
      currentStage: 'KNOCKOUTS' // Bypass pools
    }
  });

  const teams = [];
  for (let i = 1; i <= 16; i++) {
    const user = await prisma.user.create({ data: { name: `Survivor ${i}`, email: `survivor${i}_${Date.now()}@test.com` } });
    const team = await prisma.team.create({ data: { franchiseName: `Survivor Team ${i}`, tournamentId: tournament.id, players: { connect: [{ id: user.id }] } } });
    teams.push(team);
  }

  let reportLines = [`# Knockout-Only Tournament Report`, `Tournament ID: ${tournament.id}`];
  
  // R16
  reportLines.push(`### Round of 16`);
  const qfTeams = [];
  for (let i = 0; i < teams.length; i += 2) {
    const score = generateRandomScore();
    const winnerId = score.setsA > score.setsB ? teams[i].id : teams[i+1].id;
    await prisma.match.create({
      data: {
        tournamentId: tournament.id, stage: 'ROUND_OF_16',
        teamAId: teams[i].id, teamBId: teams[i+1].id,
        status: 'COMPLETED', winnerId,
        scoreState: JSON.stringify({ ...score, pointsA: '0', pointsB: '0' })
      }
    });
    qfTeams.push(winnerId);
    reportLines.push(`- ${teams[i].franchiseName} vs ${teams[i+1].franchiseName} -> Winner: ${winnerId}`);
  }

  // QF
  reportLines.push(`### Quarterfinals`);
  const sfTeams = [];
  for (let i = 0; i < qfTeams.length; i += 2) {
    const score = generateRandomScore();
    const winnerId = score.setsA > score.setsB ? qfTeams[i] : qfTeams[i+1];
    await prisma.match.create({
      data: {
        tournamentId: tournament.id, stage: 'QUARTER',
        teamAId: qfTeams[i], teamBId: qfTeams[i+1],
        status: 'COMPLETED', winnerId,
        scoreState: JSON.stringify({ ...score, pointsA: '0', pointsB: '0' })
      }
    });
    sfTeams.push(winnerId);
    reportLines.push(`- Team ${qfTeams[i]} vs Team ${qfTeams[i+1]} -> Winner: ${winnerId}`);
  }

  // SF
  reportLines.push(`### Semifinals`);
  const fTeams = [];
  for (let i = 0; i < sfTeams.length; i += 2) {
    const score = generateRandomScore();
    const winnerId = score.setsA > score.setsB ? sfTeams[i] : sfTeams[i+1];
    await prisma.match.create({
      data: {
        tournamentId: tournament.id, stage: 'SEMI',
        teamAId: sfTeams[i], teamBId: sfTeams[i+1],
        status: 'COMPLETED', winnerId,
        scoreState: JSON.stringify({ ...score, pointsA: '0', pointsB: '0' })
      }
    });
    fTeams.push(winnerId);
    reportLines.push(`- Team ${sfTeams[i]} vs Team ${sfTeams[i+1]} -> Winner: ${winnerId}`);
  }

  // Final
  reportLines.push(`### Final`);
  const score = generateRandomScore();
  const championId = score.setsA > score.setsB ? fTeams[0] : fTeams[1];
  await prisma.match.create({
    data: {
      tournamentId: tournament.id, stage: 'FINAL',
      teamAId: fTeams[0], teamBId: fTeams[1],
      status: 'COMPLETED', winnerId: championId,
      scoreState: JSON.stringify({ ...score, pointsA: '0', pointsB: '0' })
    }
  });

  const championTeam = teams.find(t => t.id === championId);
  reportLines.push(`- Final: Team ${fTeams[0]} vs Team ${fTeams[1]} -> **Winner: ${championTeam?.franchiseName}**`);
  console.log(`🏆 Knockout Champion: ${championTeam?.franchiseName}`);

  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { isActive: false, isArchived: true, championId }
  });

  const reportContent = reportLines.join('\n');
  const brainDir = path.resolve('C:\\Users\\LIZBETH\\.gemini\\antigravity\\brain\\46bb118d-4b2a-4134-81d8-e0f633ce6336');
  
  if (fs.existsSync(brainDir)) {
    fs.appendFileSync(path.join(brainDir, 'tournament-report.md'), '\n\n' + reportContent);
    console.log(`📄 Report appended to brain tournament-report.md`);
  }

  console.log('✅ Knockout-Only Simulation Complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

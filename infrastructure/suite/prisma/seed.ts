import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Golden Loop test data...');

  // Clean existing test data
  await prisma.match.deleteMany({ where: { tournament: { name: 'GOLDEN_LOOP_TEST' } } });
  await prisma.team.deleteMany({ where: { tournament: { name: 'GOLDEN_LOOP_TEST' } } });
  await prisma.tournament.deleteMany({ where: { name: 'GOLDEN_LOOP_TEST' } });

  // Create tournament
  const tournament = await prisma.tournament.create({
    data: {
      name: 'GOLDEN_LOOP_TEST',
      formatType: 'Standard',
      isActive: true,
      maxTeams: 8,
    }
  });

  // Create two teams
  const teamA = await prisma.team.create({
    data: {
      franchiseName: 'Federer / Nadal',
      tournamentId: tournament.id,
    }
  });

  const teamB = await prisma.team.create({
    data: {
      franchiseName: 'Djokovic / Murray',
      tournamentId: tournament.id,
    }
  });

  // Create the test match (SCHEDULED state, fresh scoreState)
  const match = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      teamAId: teamA.id,
      teamBId: teamB.id,
      status: 'SCHEDULED',
      scoreState: JSON.stringify({
        pointsA: '0', pointsB: '0',
        gamesA: 0, gamesB: 0,
        setsA: 0, setsB: 0,
        isTiebreaker: false,
        tiebreakerPointsA: 0, tiebreakerPointsB: 0
      })
    }
  });

  console.log('');
  console.log('✅ Seed complete. Golden Loop test data ready.');
  console.log(`   Tournament ID : ${tournament.id}`);
  console.log(`   Match ID      : ${match.id}`);
  console.log(`   Team A        : ${teamA.franchiseName} (${teamA.id})`);
  console.log(`   Team B        : ${teamB.franchiseName} (${teamB.id})`);
  console.log('');
  console.log('   Boot: npm run dev → open /referee and /broadcast side by side.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

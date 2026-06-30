import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Purely Doubles Phase 4 data...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.match.deleteMany();
  await prisma.court.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tournament.deleteMany();

  // 1. Create Tournament
  const tournament = await prisma.tournament.create({
    data: {
      name: 'Purely Doubles Inaugural',
      formatType: 'Standard',
      isActive: true,
      maxTeams: 16,
    }
  });

  // 2. Create Courts
  const courts = await Promise.all([
    prisma.court.create({ data: { name: 'Center Court', courtType: 'TENNIS_HARD', tournamentId: tournament.id } }),
    prisma.court.create({ data: { name: 'Court 1', courtType: 'TENNIS_HARD', tournamentId: tournament.id } }),
    prisma.court.create({ data: { name: 'Court 2', courtType: 'TENNIS_HARD', tournamentId: tournament.id } })
  ]);

  // 3. Create Users
  const userNames = ['Roger F.', 'Rafa N.', 'Novak D.', 'Andy M.', 'Serena W.', 'Venus W.', 'Carlos A.', 'Jannik S.'];
  const users = await Promise.all(
    userNames.map((name, i) => prisma.user.create({
      data: {
        name,
        email: `player${i+1}@test.com`,
        role: 'PLAYER',
        globalXp: Math.floor(Math.random() * 5000),
        badges: JSON.stringify(['Early Adopter', 'Beta Tester'])
      }
    }))
  );

  // 4. Create Teams
  const teams = await Promise.all([
    prisma.team.create({
      data: {
        franchiseName: 'The Swiss Spaniards',
        tournamentId: tournament.id,
        players: { connect: [{ id: users[0].id }, { id: users[1].id }] }
      }
    }),
    prisma.team.create({
      data: {
        franchiseName: 'Balkan Power',
        tournamentId: tournament.id,
        players: { connect: [{ id: users[2].id }, { id: users[3].id }] }
      }
    }),
    prisma.team.create({
      data: {
        franchiseName: 'Williams Dynasty',
        tournamentId: tournament.id,
        players: { connect: [{ id: users[4].id }, { id: users[5].id }] }
      }
    }),
    prisma.team.create({
      data: {
        franchiseName: 'Next Gen',
        tournamentId: tournament.id,
        players: { connect: [{ id: users[6].id }, { id: users[7].id }] }
      }
    })
  ]);

  const defaultScore = { pointsA: '0', pointsB: '0', gamesA: 0, gamesB: 0, setsA: 0, setsB: 0, isTiebreaker: false, tiebreakerPointsA: 0, tiebreakerPointsB: 0 };

  // 5. Create Matches
  // Match 1: COMPLETED
  await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      teamAId: teams[0].id,
      teamBId: teams[1].id,
      courtId: courts[0].id,
      status: 'COMPLETED',
      scoreState: JSON.stringify({ ...defaultScore, setsA: 2, setsB: 0, gamesA: 6, gamesB: 4 })
    }
  });

  // Match 2: IN_PROGRESS
  await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      teamAId: teams[2].id,
      teamBId: teams[3].id,
      courtId: courts[1].id,
      status: 'IN_PROGRESS',
      scoreState: JSON.stringify({ ...defaultScore, setsA: 1, setsB: 0, gamesA: 4, gamesB: 3, pointsA: '40', pointsB: '15' })
    }
  });

  // Match 3: SCHEDULED
  await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      teamAId: teams[0].id,
      teamBId: teams[2].id,
      status: 'SCHEDULED',
      scoreState: JSON.stringify(defaultScore)
    }
  });

  console.log('✅ Seed complete. Dashboards have data.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

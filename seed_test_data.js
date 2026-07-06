const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

// A simple hash function to match NextAuth credentials pattern (if it's using bcrypt or simple sha, we'll just seed it and we can just use the DB directly to test or write a basic string if it's plaintext for dev)
// Wait, looking at the repo, it might be using bcrypt. We can use bcryptjs.
const bcrypt = require('bcryptjs');

async function seed() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    { email: 'player@test.com', name: 'Test Player', role: 'PLAYER', category: 'PLAYER' },
    { email: 'host@test.com', name: 'Test Host', role: 'HOST', category: 'ORGANIZER' },
    { email: 'referee@test.com', name: 'Test Referee', role: 'REFEREE', category: 'OFFICIAL' },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          role: u.role,
          category: u.category,
          passwordHash,
          trustScore: 100,
          skillLevel: 4.0,
          availability: "{}"
        }
      });
      console.log(`Created ${u.email}`);
    } else {
      console.log(`${u.email} already exists`);
    }
  }

  // Create a tournament for the host
  const host = await prisma.user.findUnique({ where: { email: 'host@test.com' } });
  let tournament = await prisma.tournament.findFirst({ where: { hostId: host.id } });
  if (!tournament) {
    tournament = await prisma.tournament.create({
      data: {
        name: 'Sprint 6 Test Tournament',
        location: 'Test Arena',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        status: 'PUBLISHED',
        hostId: host.id
      }
    });
    console.log(`Created tournament for host`);
  }

  // Assign referee to tournament
  const referee = await prisma.user.findUnique({ where: { email: 'referee@test.com' } });
  const assignment = await prisma.staffAssignment.findFirst({
    where: { userId: referee.id, tournamentId: tournament.id }
  });
  if (!assignment) {
    await prisma.staffAssignment.create({
      data: {
        userId: referee.id,
        tournamentId: tournament.id,
        role: 'REFEREE',
        permissions: ['SCORE', 'OVERRIDE', 'INTERVENE']
      }
    });
    console.log(`Assigned referee to tournament`);
  }

  // Create a pool and match for the referee to score
  let match = await prisma.match.findFirst({ where: { tournamentId: tournament.id } });
  if (!match) {
    // Create a pool
    const pool = await prisma.pool.create({
      data: {
        name: 'Pool A',
        tournamentId: tournament.id,
        category: 'Open',
        status: 'ACTIVE'
      }
    });

    // Create teams (players)
    const player = await prisma.user.findUnique({ where: { email: 'player@test.com' } });
    const teamA = await prisma.team.create({
      data: { franchiseName: 'Team Player', players: { connect: { id: player.id } } }
    });
    const teamB = await prisma.team.create({
      data: { franchiseName: 'Team NPC' }
    });

    // Create Court
    const court = await prisma.court.create({
      data: { name: 'Center Court', tournamentId: tournament.id }
    });

    match = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        poolId: pool.id,
        teamAId: teamA.id,
        teamBId: teamB.id,
        courtId: court.id,
        status: 'SCHEDULED',
        scoreState: JSON.stringify({
          pointsA: 0, pointsB: 0, gamesA: 0, gamesB: 0, setsA: 0, setsB: 0,
          history: [], server: 'A', isTiebreaker: false, tiebreakerPointsA: 0, tiebreakerPointsB: 0
        }),
        stage: 'POOL',
        scheduledTime: new Date()
      }
    });
    console.log(`Created match ${match.id} for referee testing`);
  }

  console.log("Seed complete.");
}

seed().catch(console.error).finally(() => prisma.$disconnect());

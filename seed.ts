import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword('password123');
  
  console.log('Creating fake tournament...');
  const tournament = await prisma.tournament.create({
    data: {
      name: 'Integration Fake Tournament',
      formatType: 'Standard',
      isActive: true,
      maxTeams: 16,
    }
  });

  console.log('Creating 4 fake players...');
  const players = [];
  for (let i = 1; i <= 4; i++) {
    const player = await prisma.user.upsert({
      where: { email: `player${i}@example.com` },
      update: {},
      create: {
        name: `Fake Player ${i}`,
        email: `player${i}@example.com`,
        passwordHash,
        role: 'PLAYER',
        skillLevel: 4.0,
      }
    });
    players.push(player);
  }

  console.log('Grouping players into 2 teams...');
  const team1 = await prisma.team.create({
    data: {
      franchiseName: 'Team Alpha',
      tournamentId: tournament.id,
      players: {
        connect: [{ id: players[0].id }, { id: players[1].id }]
      }
    }
  });

  const team2 = await prisma.team.create({
    data: {
      franchiseName: 'Team Beta',
      tournamentId: tournament.id,
      players: {
        connect: [{ id: players[2].id }, { id: players[3].id }]
      }
    }
  });

  console.log('Creating 2 fake courts...');
  await prisma.court.createMany({
    data: [
      { name: 'Court 1', courtType: 'TENNIS_HARD', tournamentId: tournament.id },
      { name: 'Court 2', courtType: 'TENNIS_HARD', tournamentId: tournament.id },
    ]
  });

  console.log('Creating a scheduled match...');
  const match = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      teamAId: team1.id,
      teamBId: team2.id,
      status: 'SCHEDULED',
      stage: 'POOL',
    }
  });

  console.log('Database successfully seeded with 1 tournament, 4 players, 2 teams, 2 courts, and 1 scheduled match.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

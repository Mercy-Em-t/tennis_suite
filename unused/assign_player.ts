import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find the test player
  let player = await prisma.user.findUnique({
    where: { email: 'testplayer2026@test.com' }
  });

  if (!player) {
    console.log('Player testplayer2026@test.com not found. Searching for any PLAYER role...');
    player = await prisma.user.findFirst({ where: { role: 'PLAYER', email: { contains: 'testplayer' } }});
    if (!player) throw new Error('No players found');
    console.log('Found fallback player:', player.email);
  }

  // Find an active tournament
  let tournament = await prisma.tournament.findFirst({
    where: { isActive: true }
  });

  if (!tournament) {
    console.log('No active tournament found. Finding ANY tournament...');
    tournament = await prisma.tournament.findFirst();
    if (!tournament) throw new Error('No tournaments found.');
  }

  // Check if team already exists
  let team = await prisma.team.findFirst({
    where: {
      tournamentId: tournament.id,
      players: { some: { id: player.id } }
    }
  });

  if (team) {
    console.log(`Player already assigned to team ${team.franchiseName}`);
  } else {
    team = await prisma.team.create({
      data: {
        franchiseName: player.name + ' All-Stars',
        tournamentId: tournament.id,
        players: {
          connect: [{ id: player.id }]
        }
      }
    });
    console.log(`Successfully added ${player.name} to tournament ${tournament.name} under team ${team.franchiseName}`);
  }
}

main().finally(() => prisma.$disconnect());

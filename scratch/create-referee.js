const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'testreferee@example.com';
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    const passwordHash = await bcrypt.hash('12345678', 10);
    user = await prisma.user.create({
      data: {
        name: 'Test Referee',
        email,
        passwordHash,
        role: 'REFEREE'
      }
    });
    console.log('Test Referee created:', user);
  } else {
    console.log('Test Referee already exists:', user);
  }

  // Find the test tournament (first tournament)
  const tournament = await prisma.tournament.findFirst();
  if (tournament) {
    const existingStaff = await prisma.staff.findFirst({
      where: { userId: user.id, tournamentId: tournament.id, role: 'REFEREE' }
    });

    if (!existingStaff) {
      await prisma.staff.create({
        data: {
          name: user.name,
          role: 'REFEREE',
          status: 'APPROVED',
          userId: user.id,
          tournamentId: tournament.id
        }
      });
      console.log(`Assigned as Referee to tournament: ${tournament.name}`);
    } else {
      console.log('Already assigned to tournament');
    }
  } else {
    console.log('No tournament found to assign referee to.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

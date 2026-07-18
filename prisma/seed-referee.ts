import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'REF@TMSAVANNAH.COM'.toLowerCase();
  const passwordHash = await bcrypt.hash('12345678', 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'REFEREE',
    },
    create: {
      name: 'Test Referee',
      email,
      passwordHash,
      role: 'REFEREE',
    },
  });

  console.log(`Created/Updated user: ${user.email} with role ${user.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

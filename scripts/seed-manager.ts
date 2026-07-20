import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'manager@tmsavannah.com';
  const plainPassword = '12345678';
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(plainPassword, salt);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'MANAGER',
      passwordHash
    },
    create: {
      email,
      name: 'System Manager',
      role: 'MANAGER',
      passwordHash
    }
  });

  console.log(`[SEED] Manager account created/updated: ${user.email}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

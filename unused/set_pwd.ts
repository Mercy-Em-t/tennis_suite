import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  const hash = await hashPassword('password123');
  await prisma.user.update({
    where: { email: 'player1@test.com' },
    data: { passwordHash: hash }
  });
  console.log('Password set for player1@test.com to: password123');
}

main().finally(() => prisma.$disconnect());

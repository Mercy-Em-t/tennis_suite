
import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/lib/auth/password.ts';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'player@example.com' } });
  if (existing) {
    console.log('User already exists:', existing);
    return;
  }
  
  const passwordHash = await hashPassword('password123');
  const user = await prisma.user.create({
    data: {
      name: 'Test Player',
      email: 'player@example.com',
      passwordHash,
      phone: '555-0199',
      skillLevel: 4.5,
      playstyle: 'Aggressive Baseliner',
      emergencyContact: 'Jane Doe 555-0100',
      role: 'PLAYER',
    }
  });
  console.log('Successfully provisioned user:', user);
}

main().catch(console.error).finally(() => prisma.$disconnect());


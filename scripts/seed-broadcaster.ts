import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'broadcast@tmsavannah.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Broadcaster already exists');
    return;
  }
  
  await prisma.user.create({
    data: {
      name: 'Network Broadcaster',
      email: email,
      passwordHash: bcrypt.hashSync('12345678', 10),
      role: 'BROADCASTER'
    }
  });
  console.log('Broadcaster created');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: 'network@tmsavannah.com', name: 'Network Admin', role: 'NETWORK' },
    { email: 'delegate@tmsavannah.com', name: 'Tournament Delegate', role: 'DELEGATE' },
    { email: 'marshall@tmsavannah.com', name: 'Court Marshall', role: 'MARSHALL' }
  ];

  for (const user of users) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          passwordHash: bcrypt.hashSync('12345678', 10),
          role: user.role as any
        }
      });
      console.log(`Created ${user.role} user`);
    } else {
      console.log(`${user.role} already exists`);
    }
  }
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

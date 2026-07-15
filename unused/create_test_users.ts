import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  let host = await prisma.user.findFirst({ where: { role: 'HOST' } });
  if (!host) {
    host = await prisma.user.create({
      data: {
        name: 'Test Host',
        email: 'host@test.com',
        role: 'HOST'
      }
    });
  }
  let referee = await prisma.user.findFirst({ where: { role: 'REFEREE' } });
  if (!referee) {
    referee = await prisma.user.create({
      data: {
        name: 'Test Referee',
        email: 'referee@test.com',
        role: 'REFEREE'
      }
    });
  }
  let director = await prisma.user.findFirst({ where: { role: 'DIRECTOR' } });
  if (!director) {
    director = await prisma.user.create({
      data: {
        name: 'Test Director',
        email: 'director@test.com',
        role: 'DIRECTOR'
      }
    });
  }
  console.log('HOST:', host.email);
  console.log('REFEREE:', referee.email);
  console.log('DIRECTOR:', director.email);
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

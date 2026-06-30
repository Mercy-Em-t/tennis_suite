import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  // Reset the corrupted offlineVersion back to 1 on all matches
  const result = await prisma.$executeRaw`UPDATE "Match" SET "offlineVersion" = 1`;
  console.log(`✅ Reset offlineVersion on ${result} rows.`);
  await prisma.$disconnect();
}
fix().catch(e => { console.error(e); process.exit(1); });

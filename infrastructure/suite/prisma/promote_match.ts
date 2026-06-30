import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function promote() {
  const updated = await prisma.match.update({
    where: { id: 'cmqz2ayqu0006n4eih63ajspb' },
    data: { status: 'IN_PROGRESS', offlineVersion: 1 }
  });
  console.log('Match promoted to IN_PROGRESS:', updated.id, '| status:', updated.status);
  await prisma.$disconnect();
}
promote().catch(e => { console.error(e); process.exit(1); });

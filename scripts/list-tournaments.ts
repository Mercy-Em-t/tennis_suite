/**
 * Diagnostic: list all tournaments in DB with their hostId and slug
 * Run: npx tsx scripts/list-tournaments.ts
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const all = await prisma.tournament.findMany({
    select: { id: true, name: true, slug: true, hostId: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`Total tournaments in DB: ${all.length}\n`);
  for (const t of all) {
    console.log(`  name: "${t.name}" | slug: ${t.slug} | hostId: ${t.hostId} | active: ${t.isActive} | created: ${t.createdAt.toISOString().split('T')[0]}`);
  }

  // Also list all hosts
  const hosts = await prisma.user.findMany({
    where: { role: 'HOST' },
    select: { id: true, name: true, email: true },
  });
  console.log(`\nHost users (${hosts.length}):`);
  for (const h of hosts) {
    console.log(`  id: ${h.id} | name: ${h.name} | email: ${h.email}`);
  }
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });

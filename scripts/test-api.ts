/**
 * Diagnostic: test the tournaments API and auth token
 * Run: npx tsx scripts/test-api.ts
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Check if slug column exists on Tournament
  const sample = await prisma.tournament.findFirst({
    select: { id: true, name: true, slug: true, hostId: true },
  });
  console.log('Sample tournament (with slug):', sample);

  // 2. Verify tournaments for the known host
  const hostId = 'cmrm6f0yi000013nhttn7p08w';
  const tournaments = await prisma.tournament.findMany({
    where: { hostId },
    select: { id: true, slug: true, name: true, isActive: true, isArchived: true },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`\nTournaments for host ${hostId}:`);
  for (const t of tournaments) {
    console.log(`  - "${t.name}" | slug: ${t.slug} | active: ${t.isActive}`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });

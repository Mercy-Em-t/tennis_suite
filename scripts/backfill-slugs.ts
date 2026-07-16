/**
 * Backfill slugs for all tournaments that don't have one yet.
 * Run once: npx tsx scripts/backfill-slugs.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'tournament';
}

async function main() {
  const tournaments = await prisma.tournament.findMany({
    where: { slug: null },
    select: { id: true, name: true },
  });

  console.log(`Found ${tournaments.length} tournament(s) without a slug.`);

  for (const t of tournaments) {
    let base = slugify(t.name);
    let candidate = base;
    let counter = 2;

    // Find a unique slug
    while (true) {
      const existing = await prisma.tournament.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!existing) break;
      candidate = `${base}-${counter++}`;
    }

    await prisma.tournament.update({
      where: { id: t.id },
      data: { slug: candidate },
    });

    console.log(`  ✓ "${t.name}" → "${candidate}"`);
  }

  console.log('Done.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

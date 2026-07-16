import { prisma } from '@/lib/prisma';

/**
 * Converts a tournament name into a URL-safe slug.
 * e.g. "Summer Open 2026!" → "summer-open-2026"
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // strip non-alphanumeric except spaces and hyphens
    .replace(/\s+/g, '-')            // spaces → hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .replace(/^-|-$/g, '');          // trim leading/trailing hyphens
}

/**
 * Generates a unique slug for a tournament.
 * If "summer-open-2026" is taken, tries "summer-open-2026-2", "summer-open-2026-3", etc.
 */
export async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || 'tournament';
  let candidate = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.tournament.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    // No conflict, or the conflict is the same tournament (update scenario)
    if (!existing || existing.id === excludeId) {
      return candidate;
    }

    candidate = `${base}-${counter}`;
    counter++;
  }
}

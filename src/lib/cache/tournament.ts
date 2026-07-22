import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

/**
 * Fetches a tournament by ID or slug and caches the result.
 * This is served from Next.js Data Cache (Edge Cache).
 * 
 * To invalidate this cache (e.g. when tournament details are updated),
 * call `revalidateTag('tournament-details')` or `revalidateTag(\`tournament-${id}\`)`.
 */
export const getCachedTournament = unstable_cache(
  async (id: string) => {
    return await prisma.tournament.findFirst({
      where: { 
        OR: [
          { id: id },
          { slug: id }
        ]
      }
    });
  },
  ['tournament-profile'], // Unique key parts
  {
    tags: ['tournament-details'], // Global tag to bust all tournament profiles if needed
    revalidate: 3600 // Background revalidation every hour just in case
  }
);

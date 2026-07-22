# Implementation Walkthrough: Streamlining Database Operations

I have successfully implemented both Read Caching and Write Buffering to significantly reduce database load. Here is a summary of the changes and how the system works now.

## 1. Read Caching (Next.js Data Cache)

### Changes Made:
- **Created a Caching Layer:** I added a new file `src/lib/cache/tournament.ts` that wraps Prisma's `tournament.findFirst` query with Next.js's `unstable_cache`.
- **Global Tagging:** The cached query is tagged with `['tournament-details']`. This means we can instantly purge the edge cache from anywhere in the app by simply calling `revalidateTag('tournament-details')` whenever a tournament is updated.
- **Updated Public Views:** I refactored the `PublicTournamentProfile` page (`src/app/(marketing)/(public)/tournaments/[id]/profile/page.tsx`) to use the new `getCachedTournament` function instead of making direct database queries.

### Result:
When hundreds of players load a tournament profile, Next.js will execute exactly **one** database query, cache the result globally, and serve it to everyone else with 0 database hits.

---

## 2. Write Buffering (Redis Write-Behind Cache)

### Changes Made:
- **Redis Centralization:** I extracted the Upstash Redis client configuration into `src/lib/redis.ts` so it can be reused safely outside of the rate-limiter.
- **Match State Buffer:** I created `src/lib/engine/match-buffer.ts`. This utility handles retrieving and saving live score states to Redis (acting as our ultra-fast memory buffer) instead of hitting Postgres immediately. It also keeps track of which matches have unsaved changes by storing their IDs in a Redis set (`system:dirty_matches`).
- **Refactored Scoring API:** In `src/app/api/match/score/route.ts`, when a referee taps to score a point:
  - If the match is ongoing, the score is buffered in Redis (1-2ms response time, 0 DB writes).
  - If the match is completed, it commits the final score directly to PostgreSQL and cleans up Redis to guarantee permanence.
- **Background DB Sync:** I created a new Cron API Endpoint at `src/app/api/cron/flush-scores/route.ts`. When this endpoint is called, it:
  1. Grabs all modified match IDs from Redis.
  2. Fetches their latest buffered scores.
  3. Executes a single `prisma.$transaction` to bulk-update PostgreSQL efficiently.
  4. Removes the processed IDs from the dirty list.

### Result:
Referees can rapidly tap scores point-by-point across 20 simultaneous matches, and instead of thousands of immediate SQL UPDATEs, the system instantly absorbs them in Redis. The cron endpoint can be pinged every 60 seconds to do one tiny bulk SQL operation in the background.

> [!IMPORTANT]  
> **Next Step for Production:** To make the Write-Buffer fully autonomous in production, you will need to set up a Cron Job (like Vercel Cron) to execute a GET request to `/api/cron/flush-scores` every minute. For local testing, you can just manually navigate to `http://localhost:3000/api/cron/flush-scores` in your browser.

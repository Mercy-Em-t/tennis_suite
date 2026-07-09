# Stage 2 Integration Notes & Walkthrough

This document tracks the integration steps, decisions, and technical walkthroughs for Stage 2 of the Tennis Suite integration phase.

## Technical Decisions
- **SSE vs WebSockets:** Opted for Server-Sent Events (SSE) via a Next.js `GET` API route combined with a global Node.js `EventEmitter` to push real-time score updates to the client (Broadcaster/Referee) efficiently within a Serverless context, satisfying the requirement for Prisma middleware/hooks.
- **Implicit Global Broadcast:** By using a Prisma Client Extension (`src/lib/prisma.ts`), the broadcast is not manually tied to the score endpoint. Instead, the Prisma hook intercepts *any* `match.update` call in the application and immediately fires an event containing the updated payload to all listening clients, guaranteeing real-time sync no matter what process triggers the update.
- **Atomic Database Operations:** Refactored the score update endpoint to use a Prisma interactive transaction (`$transaction`). This ensures that the fetch -> advance score -> update process is completely atomic and free from race conditions.
- **RESTful Endpoints:** Moved the score endpoint from the legacy `/api/match/score` to the standard RESTful `/api/matches/[matchId]/score`.

## Walkthrough

*To be completed after testing the implementation.*

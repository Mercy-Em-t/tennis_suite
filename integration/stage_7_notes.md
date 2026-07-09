# Integration Stage 7 Notes

## Objectives
- Integrate Court mappings and statuses into the schema.
- Create an atomic Dispatch API to assign a Match to a Court and move them into `WARMUP` and `READY` states.
- Execute the "Pulse Test" using real-time SSE streams in the sandbox environment.

## Technical Execution
- **Schema Enhancements:**
  - Added a `status String @default("IDLE")` field to the `Court` model in `schema.prisma` to track its availability (`IDLE`, `WARMUP`, `IN_PROGRESS`, `MAINTENANCE`).
- **Backend API (State Machine):**
  - Created `POST /api/tournaments/[id]/dispatch`.
  - Enforced a strict collision check: if the targeted court is already in progress, the API rejects the request with a `409 Conflict`.
  - Used an atomic Prisma transaction (`prisma.$transaction`) to securely transition `Match.status -> READY`, `Match.courtId -> [court.id]`, and `Court.status -> WARMUP`.
- **Real-Time Data Propagation:**
  - Integrated the global `matchEventEmitter` into the dispatch route.
  - When the dispatch successfully commits, it broadcasts a `matchUpdated:${matchId}` event containing the new match state and an explicit `_dispatch_event` flag.
- **The Sandbox UI (Pulse Test):**
  - Re-purposed the UI in `src/app/sandbox/marshall/page.tsx` into a testing dispatcher that fetches the hardcoded match and posts it to the Dispatch API.
  - Re-purposed the UI in `src/app/sandbox/team/page.tsx` into a receiver that opens an `EventSource` listening to `/api/matches/[matchId]/stream`. 
  - Upon receiving the SSE broadcast, it instantly flashes a massive Red/White notification banner telling the player to report to their court.

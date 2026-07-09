# Integration Stage 8 Notes

## Objectives
- Automatically calculate table updates when a match ends.
- Dynamically construct the next stage's knockout bracket without human administration when all pool matches complete.
- Tie the Standings and Bracket updates to real-time broadcasts.

## Technical Execution
- **Sandbox Preparation:**
  - Expanded `src/app/api/sandbox/hardcode/route.ts` to generate a 4-team `Pool`, multiple completed pool matches, one pending pool match, and a pre-allocated knockout `Match` (Semi-Final 1).
- **The Finalization Engine (`POST /api/matches/[matchId]/finalize`):**
  - **Phase A (Compute):** Fetch all completed matches for the pool. Tally wins and calculate $\Delta \text{Sets}$ and $\Delta \text{Games}$. Update the `PoolTeam.stats` cache. Sort deterministically.
  - **Phase B (Knockout Tree Generation):** Detect if the total completed match count equals the total pool match count. If so, update the pool status to `LOCKED`. Query for matches looking for `placeholderA = 'Pool A Pos 1'` and populate them with the `teamId` from the generated leaderboard.
- **The Broadcast Subsystem:**
  - Added a new native EventSource endpoint at `/api/pools/[poolId]/stream`.
  - The finalization engine emits `poolUpdated:${poolId}` with the leaderboard payload.
  - It also loops through any progressed knockout matches and fires `matchUpdated:${koMatch.id}`.
- **The Automaton Pulse Test (`/sandbox/automaton`):**
  - Built a unified dashboard to test the engine.
  - Left side: A Framer Motion table subscribed to `poolUpdated`.
  - Right side: A visual bracket component subscribed to `matchUpdated`.
  - Hitting the finalization trigger instantly updates both UI components without browser refreshes.

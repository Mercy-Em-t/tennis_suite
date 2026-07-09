# Integration Stage 11 Notes

## Objectives
- Introduce God-Mode controls for the Tournament Delegate to forcefully override game data.
- Ensure strict accountability by enforcing a mandatory text justification and writing to an immutable Audit Log.
- Ensure that overrides cascade through the Standings Compute Engine (from Stage 8) to fix pool rankings globally.

## Technical Execution
- **The Override API (`/api/delegate/override`)**:
  - Requires `matchId`, `delegateId`, and `justification` (min 10 characters).
  - Executes a single Prisma `$transaction`.
  - Writes the action, user, and previous/new state diff directly to the `AuditLog` table.
  - Updates the `Match` record.
  - **The Cascade Engine**: If the overridden match belongs to a pool, the endpoint automatically loads all completed pool matches, recalculates the entire pool standings matrix (Wins, Set Differential, Game Differential), and persists the corrected leaderboard.
  - Broadcasts `matchUpdated`, `auditLogUpdated`, and `poolUpdated` SSE events so all clients receive the corrected truth instantly.
- **The Delegate Dashboard (`/sandbox/delegate`)**:
  - A secure UI featuring a high-contrast red warning theme.
  - Provides inputs to force the final sets and winner of a match.
  - Validates that the justification field is filled before unlocking the "Execute Override Transaction" button.
  - Displays a live-streaming, read-only feed of the immutable Audit Log below the form so the admin can review the history of mutations on that match.

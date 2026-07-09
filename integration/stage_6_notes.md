# Integration Stage 6 Notes

## Objectives
- Ascertain the relationship between Tournament, Match, and Team in the Prisma schema.
- Build a sandbox script/endpoint to hardcode a tournament and a match.
- Build a sandbox endpoint to manually modify a match's current score (`cscore`) to test stability.

## Technical Execution
- **Schema Relationships Analyzed:**
  - `Tournament` <-> `Team`: 1-to-Many. Teams are scoped to a specific tournament.
  - `Tournament` <-> `Match`: 1-to-Many. Matches are scoped to a specific tournament.
  - `Match` <-> `Team`: Many-to-Many, represented by two specific optional foreign keys on the Match (`teamAId`, `teamBId`).
- **Sandbox Endpoints Created:**
  - `GET /api/sandbox/hardcode`: When hit, this endpoint programmatically creates a barebones `Tournament`, two `Team`s, and an `IN_PROGRESS` `Match` bridging them, returning the IDs.
  - `GET /api/sandbox/score?matchId=...`: When provided a `matchId`, this endpoint manually modifies the `scoreState` of the match via Prisma to increment a game score, bypassing all standard engine auth rules to verify raw write-stability and trigger the standard telemetry.

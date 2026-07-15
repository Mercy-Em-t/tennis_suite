# Documentation: Production Sprint 02

## Objective
Transition the project into a production-ready state by addressing unresolved errors, optimizing performance, and achieving a clean build.

## State Changes & Project Adjustments
- **Scoring Engine Refactor**: Updated `TennisScoreState` (`src/lib/engine/scoring.ts`) to use dynamic `MatchFormat` objects instead of hardcoded 6 games/3 sets logic. Added `servingPlayer` state to automatically track and toggle service turns dynamically during gameplay.
- **Multi-Tenant Security Hardening**: Addressed Insecure Direct Object Reference (IDOR) vulnerabilities across `src/app/api/tournaments/[id]`. Replaced `findUnique` and `update` methods (which only filtered by `id`) with `findFirst` and `updateMany` to securely enforce `tournamentId` constraints on all tenant-specific lookups and mutations.

## Decisions Log
- **Match Formats**: Decided to pass `MatchFormat` objects to `advanceScore` rather than relying on global constants, allowing flexible rulesets (Fast 4, Standard, Super Tiebreak) per match.
- **IDOR Remediation**: Decided to use Prisma's `updateMany` for single-record mutations to enable checking compound constraints (`id` + `tournamentId`) since `update` strictly requires unique keys.

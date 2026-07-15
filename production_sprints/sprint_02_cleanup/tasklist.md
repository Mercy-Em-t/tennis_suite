# Tasklist: Production Sprint 02

Goal: Clean up the project, resolve existing console errors/warnings, verify production build stability, and enforce multi-tenant security.

## Completed Tasks
- [x] Refactor scoring engine (`TennisScoreState`) to support dynamic match formats (e.g., Fast 4, Super Tiebreaks).
- [x] Implement serving player tracking logic in the scoring engine.
- [x] Audit relational queries for multi-tenant `tournamentId` enforcement.
- [x] Patch IDOR vulnerabilities in 9 API endpoints using `findFirst` and `updateMany`.
- [x] Create custom ESLint rule `tennis/enforce-tenant-gating` to prevent future IDOR regressions.
- [x] Enable strict case-sensitivity for imports in `tsconfig.json` to prevent Vercel 404 drops.
- [x] Consolidate floating root components and archive stale test scripts to the `unused/` directory.
- [x] Fix next-set-server mathematical logic in `scoring.ts` for tiebreaks to strictly adhere to tennis rules.
- [x] Harden registration API: Migrate `/api/checkout/success` to tenant-isolated `/api/tournaments/[id]/register` with `Serializable` atomic transactions.

## Pending Build & Audit Tasks
- [x] Run `npm run build` to identify strict type errors and build failures.
- [x] Fix any identified build errors.
- [x] Review Next.js console output for deprecation warnings or slow performance bottlenecks.
- [x] Remove unused or duplicated code identified during the build.
- [x] Ensure environment variables (`.env`) are correctly mapped for a production deployment.
- [x] Finalize a successful, warning-free production build.

## Host Experience Audit
- [ ] Simulate the Host journey starting from the landing page.
- [ ] Verify navigation to host onboarding or host dashboard.
- [ ] Document any friction points, broken links, or visual glitches.

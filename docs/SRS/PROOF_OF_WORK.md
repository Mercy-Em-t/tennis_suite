# System Verification & Proof of Work

**Application:** Tennis Suite (`sports.tmsavannah.com`)
**Document Type:** Acceptance Test Specification & Proof of Work
**SRS Reference:** [`docs/SRS/README.md`](./README.md)
**Date:** 2026-07-23
**Status:** `PENDING EXECUTION` — Tests defined; results to be recorded on execution.

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Traceability Matrix](#2-traceability-matrix)
3. [Test Environment](#3-test-environment)
4. [Test Groups](#4-test-groups)
   - [TG-1: Role-Based Access Control (RBAC)](#tg-1-role-based-access-control-rbac)
   - [TG-2: Scoring Engine](#tg-2-scoring-engine)
   - [TG-3: Matchmaking & Ranking](#tg-3-matchmaking--ranking)
   - [TG-4: Court Booking & Allocation](#tg-4-court-booking--allocation)
   - [TG-5: Tournament Bracket Generation](#tg-5-tournament-bracket-generation)
   - [TG-6: Live Broadcasting (SSE Overlay)](#tg-6-live-broadcasting-sse-overlay)
   - [TG-7: Outlier Detection (Anti-Smurfing)](#tg-7-outlier-detection-anti-smurfing)
   - [TG-8: Financial Ledger Integrity](#tg-8-financial-ledger-integrity)
   - [TG-9: Performance & Latency](#tg-9-performance--latency)
   - [TG-10: Security](#tg-10-security)
   - [TG-11: Multi-Tenancy & Architecture Constraints](#tg-11-multi-tenancy--architecture-constraints)
   - [TG-12: External Service Stubs (Integration Points)](#tg-12-external-service-stubs-integration-points)
5. [Proof-of-Work Sign-Off](#5-proof-of-work-sign-off)

---

## 1. Purpose & Scope

This document defines the formal acceptance tests for the Tennis Suite system. Every test case is **derived directly from a named requirement in the SRS** — a Functional Requirement (FR), User Requirement (UR), Non-Functional Requirement (NFR), External Interface requirement (EI), or Constraint (C). Passing these tests constitutes **Proof of Work** that the system fulfils what it specified about itself.

### Result Notation

| Symbol | Meaning |
|--------|---------|
| ✅ PASS | The system behaved exactly as specified |
| ❌ FAIL | The system did not meet the requirement |
| ⚠️ PARTIAL | Partially satisfied — see notes |
| ⬜ PENDING | Not yet executed |

---

## 2. Traceability Matrix

Every test case is traceable to at least one SRS requirement ID.

| Test Case ID | Requirement ID(s) | Section |
|---|---|---|
| TC-RBAC-01 | FR-1, NFR-3 | RBAC |
| TC-RBAC-02 | FR-1, NFR-3 | RBAC |
| TC-RBAC-03 | FR-1, NFR-3 | RBAC |
| TC-RBAC-04 | FR-1 | RBAC |
| TC-SCORE-01 | FR-2 | Scoring Engine |
| TC-SCORE-02 | FR-2 | Scoring Engine |
| TC-SCORE-03 | FR-2 | Scoring Engine |
| TC-SCORE-04 | FR-2 | Scoring Engine |
| TC-MATCH-01 | UR-1.1 | Matchmaking |
| TC-MATCH-02 | UR-1.2 | Matchmaking |
| TC-MATCH-03 | UR-1.3 | Matchmaking |
| TC-COURT-01 | UR-2.1 | Court Booking |
| TC-COURT-02 | UR-2.2 | Court Booking |
| TC-COURT-03 | UR-2.3 | Court Booking |
| TC-TOURN-01 | UR-3.1 | Tournament |
| TC-TOURN-02 | UR-3.2 | Tournament |
| TC-BROAD-01 | FR-3, UR-4.1, NFR-2 | Broadcasting |
| TC-BROAD-02 | UR-4.2 | Broadcasting |
| TC-OUTL-01 | FR-4 | Outlier Detection |
| TC-LEDG-01 | UR-2.3 | Financial Ledger |
| TC-PERF-01 | NFR-1 | Performance |
| TC-PERF-02 | NFR-2 | Performance |
| TC-SEC-01 | NFR-3 | Security |
| TC-SEC-02 | NFR-4 | Security |
| TC-ARCH-01 | NFR-5 | Architecture |
| TC-ARCH-02 | C-1 | Architecture |
| TC-ARCH-03 | C-2 | Architecture |
| TC-STUB-01 | EI-1 | Integration Stubs |
| TC-STUB-02 | EI-2 | Integration Stubs |

---

## 3. Test Environment

```
Node Version   : per package.json engines field
Package Manager: npm
Framework      : Next.js (App Router)
ORM            : Prisma
Database       : SQLite (dev.db) for local; PostgreSQL (Supabase) for staging
Local Dev URL  : http://localhost:3000
Test Roles     : PLAYER, HOST, ADMIN, REFEREE, BROADCASTER, MARSHALL
```

**Pre-conditions for ALL tests:**
1. The development server is running (`npm run dev` / Turbopack).
2. `dev.db` is seeded with at least 2 Player accounts, 1 Admin account, 1 Referee account, 1 Broadcaster account.
3. Environment variables are set as per `.env.example`.

---

## 4. Test Groups

---

### TG-1: Role-Based Access Control (RBAC)

**SRS Reference:** FR-1, NFR-3
**Criteria:** The system shall implement RBAC at the Edge Middleware level using stateless JWT verification, supporting roles: HOST, ADMIN, REFEREE, BROADCASTER, PLAYER, MARSHALL.

---

#### TC-RBAC-01 — Referee cannot access Director dashboard

| Field | Value |
|---|---|
| **Requirement** | FR-1, NFR-3 |
| **Pre-condition** | A user with role `REFEREE` is authenticated and holds a valid JWT |
| **Action** | Navigate to `/director` or `/app/dashboards/director` |
| **Expected Result** | HTTP 403 or redirect to `/unauthorized`. The Referee dashboard is accessible at `/referee` only. |
| **Result** | ⬜ PENDING |
| **Notes** | |

---

#### TC-RBAC-02 — Unauthenticated user cannot access any protected route

| Field | Value |
|---|---|
| **Requirement** | FR-1, NFR-3 |
| **Pre-condition** | No valid JWT cookie is present in the browser |
| **Action** | Navigate directly to `/app`, `/referee`, `/director` |
| **Expected Result** | All routes redirect to `/login` |
| **Result** | ⬜ PENDING |
| **Notes** | |

---

#### TC-RBAC-03 — JWT is verified at the Edge (not in the Lambda/API handler)

| Field | Value |
|---|---|
| **Requirement** | NFR-3 |
| **Pre-condition** | A tampered or expired JWT cookie is present |
| **Action** | Navigate to any protected route |
| **Expected Result** | The middleware (`src/middleware.ts`) intercepts before Next.js route handlers execute, and returns 401 |
| **Result** | ⬜ PENDING |
| **Notes** | Verify via Next.js dev logs that the `middleware.ts` matcher fired, not the route handler |

---

#### TC-RBAC-04 — All six roles can access their designated dashboard

| Field | Value |
|---|---|
| **Requirement** | FR-1 |
| **Pre-condition** | One test account per role (HOST, ADMIN, REFEREE, BROADCASTER, PLAYER, MARSHALL) |
| **Action** | Log in as each role and navigate to the designated dashboard |
| **Expected Result** | Each role lands on their correct dashboard without a 403 |
| **Result** | ⬜ PENDING |
| **Notes** | |

---

### TG-2: Scoring Engine

**SRS Reference:** FR-2
**Criteria:** The scoring engine shall calculate game states deterministically (Love, 15, 30, 40, Deuce, Ad) and handle tiebreak edge cases.

---

#### TC-SCORE-01 — Standard game progression: Love → 15 → 30 → 40 → Game

| Field | Value |
|---|---|
| **Requirement** | FR-2 |
| **Pre-condition** | An active match exists in state `ACTIVE`. Player A has 0 points. |
| **Action** | Log 4 consecutive points for Player A |
| **Expected Result** | Score states transition: `Love-All` → `15-Love` → `30-Love` → `40-Love` → `Game, Player A` |
| **Result** | ⬜ PENDING |
| **Notes** | |

---

#### TC-SCORE-02 — Deuce and Advantage states

| Field | Value |
|---|---|
| **Requirement** | FR-2 |
| **Pre-condition** | Both players are at 40 (Deuce) |
| **Action** | Log 1 point for Player A, then 1 point for Player B |
| **Expected Result** | State after Player A point: `Advantage Player A`. State after Player B point: back to `Deuce` |
| **Result** | ⬜ PENDING |
| **Notes** | |

---

#### TC-SCORE-03 — Tiebreak: first to 7 with 2-point lead wins

| Field | Value |
|---|---|
| **Requirement** | FR-2 |
| **Pre-condition** | A set has reached 6-6, triggering a tiebreak |
| **Action** | Bring both players to 6-6 in the tiebreak, then log 2 consecutive points for Player A |
| **Expected Result** | Player A wins the tiebreak at `8-6`. The system records the correct tiebreak winner and set result. |
| **Result** | ⬜ PENDING |
| **Notes** | |

---

#### TC-SCORE-04 — Scoring is deterministic: same inputs produce same output

| Field | Value |
|---|---|
| **Requirement** | FR-2 |
| **Pre-condition** | A match scoring event log is available |
| **Action** | Replay the same event log twice via the scoring engine |
| **Expected Result** | Both replays produce identical final scores and state sequences |
| **Result** | ⬜ PENDING |
| **Notes** | Validates the Event-Sourced architecture |

---

### TG-3: Matchmaking & Ranking

**SRS Reference:** UR-1.1, UR-1.2, UR-1.3
**Criteria:** Players can join a queue, be matched within a 10% skill differential, log scores, and have ranking auto-updated on conclusion.

---

#### TC-MATCH-01 — Matchmaking respects 10% skill differential

| Field | Value |
|---|---|
| **Requirement** | UR-1.1 |
| **Pre-condition** | Player A has XP/Elo of 1000. Player B has XP/Elo of 1050 (5%). Player C has XP/Elo of 1200 (20%). |
| **Action** | Player A joins the matchmaking queue |
| **Expected Result** | Player A is matched with Player B (within 10%). Player C is NOT offered as a match. |
| **Result** | ⬜ PENDING |
| **Notes** | |

---

#### TC-MATCH-02 — Point-by-point score logging is persisted in real time

| Field | Value |
|---|---|
| **Requirement** | UR-1.2 |
| **Pre-condition** | An active match is in progress |
| **Action** | Submit a score event via the UI |
| **Expected Result** | The score is persisted to the database immediately. A concurrent viewer sees the updated score via SSE without refreshing. |
| **Result** | ⬜ PENDING |
| **Notes** | |

---

#### TC-MATCH-03 — Global ranking and XP update automatically on match conclusion

| Field | Value |
|---|---|
| **Requirement** | UR-1.3 |
| **Pre-condition** | Record Player A's XP and rank before the match |
| **Action** | Conclude a match with Player A as the winner |
| **Expected Result** | Player A's XP and global rank are updated without manual intervention. Player B's XP decreases or is adjusted per the Elo formula. |
| **Result** | ⬜ PENDING |
| **Notes** | |

---

### TG-4: Court Booking & Allocation

**SRS Reference:** UR-2.1, UR-2.2, UR-2.3
**Criteria:** Courts are allocated without overlap, a minimum 10-minute buffer is enforced, and transactions are logged to an immutable ledger.

---

#### TC-COURT-01 — No double-booking: concurrent booking requests for the same court and time

| Field | Value |
|---|---|
| **Requirement** | UR-2.1 |
| **Pre-condition** | Court 1 is available from 10:00–11:00 |
| **Action** | Submit two simultaneous booking requests for Court 1 at 10:00 |
| **Expected Result** | Exactly one booking succeeds. The second returns an error indicating the court is unavailable. |
| **Result** | ⬜ PENDING |
| **Notes** | |

---

#### TC-COURT-02 — Buffer time enforcement: booking within 10 minutes of existing booking is rejected

| Field | Value |
|---|---|
| **Requirement** | UR-2.2 |
| **Pre-condition** | Court 1 is booked from 10:00–11:00 |
| **Action** | Attempt to book Court 1 from 11:05–12:00 (only 5 minutes after previous booking ends) |
| **Expected Result** | Booking is rejected. Error message states a minimum 10-minute buffer is required. |
| **Result** | ⬜ PENDING |
| **Notes** | |

---

#### TC-COURT-03 — A booking at 11:10 (10-minute buffer respected) succeeds

| Field | Value |
|---|---|
| **Requirement** | UR-2.2 |
| **Pre-condition** | Court 1 is booked from 10:00–11:00 |
| **Action** | Attempt to book Court 1 from 11:10–12:00 |
| **Expected Result** | Booking succeeds. Ledger entry is created. |
| **Result** | ⬜ PENDING |
| **Notes** | |

---

### TG-5: Tournament Bracket Generation

**SRS Reference:** UR-3.1, UR-3.2
**Criteria:** The system auto-generates brackets and assigns byes to highest seeds when participant count is not a power of 2.

---

#### TC-TOURN-01 — Bracket generates correctly for power-of-2 participant count (8 players)

| Field | Value |
|---|---|
| **Requirement** | UR-3.1 |
| **Pre-condition** | A tournament has exactly 8 registered participants |
| **Action** | Director triggers bracket generation |
| **Expected Result** | A complete single-elimination bracket is generated with 4 Round-1 matches, no byes. All 8 players are assigned a match. |
| **Result** | ⬜ PENDING |
| **Notes** | |

---

#### TC-TOURN-02 — Byes are assigned to highest seeds for non-power-of-2 count (6 players)

| Field | Value |
|---|---|
| **Requirement** | UR-3.2 |
| **Pre-condition** | A tournament has exactly 6 registered participants (not a power of 2) |
| **Action** | Director triggers bracket generation |
| **Expected Result** | The system generates a bracket with exactly 2 byes assigned to the 2 highest-seeded players. The remaining 4 players compete in Round 1. |
| **Result** | ⬜ PENDING |
| **Notes** | |

---

### TG-6: Live Broadcasting (SSE Overlay)

**SRS Reference:** FR-3, UR-4.1, UR-4.2, NFR-2
**Criteria:** SSE broadcasts score changes in real time (sub-200ms). Referee is alerted if match overruns by 15 minutes.

---

#### TC-BROAD-01 — SSE overlay receives score update within 200ms

| Field | Value |
|---|---|
| **Requirement** | FR-3, UR-4.1 |
| **Pre-condition** | A Broadcaster is subscribed to the SSE endpoint for a live match |
| **Action** | A score event is submitted. Record the timestamp of submission (T1) and the timestamp the SSE event is received (T2). |
| **Expected Result** | `T2 - T1 < 200ms` |
| **Result** | ⬜ PENDING |
| **Notes** | Measure using browser DevTools Network tab (EventStream) |

---

#### TC-BROAD-02 — Referee alert fires when match exceeds scheduled duration by 15 minutes

| Field | Value |
|---|---|
| **Requirement** | UR-4.2 |
| **Pre-condition** | A match is scheduled to end at 14:00. The `REFEREE_ALERT_THRESHOLD_MINS` env var is set to `15`. |
| **Action** | Advance system clock past 14:15 without concluding the match (or mock the timestamp in a unit test) |
| **Expected Result** | `sendRefereeAlert()` is called. The referee's email/phone receives an alert containing the matchId, courtId, and overrun duration. |
| **Result** | ⬜ PENDING |
| **Notes** | Can be unit-tested against `notification_service.stub.ts` |

---

### TG-7: Outlier Detection (Anti-Smurfing)

**SRS Reference:** FR-4
**Criteria:** The system shall flag matches where score input frequency deviates from historical norms by more than 3 standard deviations.

---

#### TC-OUTL-01 — Abnormally fast score submissions are flagged

| Field | Value |
|---|---|
| **Requirement** | FR-4 |
| **Pre-condition** | The system has historical scoring frequency data (mean, std dev) for matches of this format |
| **Action** | Submit all scoring events for a full set in under 60 seconds (far below historical norm) |
| **Expected Result** | The match is flagged in the database with an `outlierDetected: true` flag or equivalent. An alert is surfaced to the Admin/Referee dashboard. |
| **Result** | ⬜ PENDING |
| **Notes** | |

---

### TG-8: Financial Ledger Integrity

**SRS Reference:** UR-2.3
**Criteria:** All transaction events are logged to an immutable financial ledger.

---

#### TC-LEDG-01 — Ledger entries cannot be updated or deleted

| Field | Value |
|---|---|
| **Requirement** | UR-2.3 |
| **Pre-condition** | A court fee transaction has been logged to the ledger |
| **Action** | Attempt to `UPDATE` or `DELETE` the ledger record directly via Prisma or the API |
| **Expected Result** | The operation is rejected (either by Prisma model constraints, row-level security on Supabase, or the absence of any `update`/`delete` API route for ledger entries) |
| **Result** | ⬜ PENDING |
| **Notes** | Verify by inspecting that no `updateLedger` or `deleteLedger` route exists in the API |

---

### TG-9: Performance & Latency

**SRS Reference:** NFR-1, NFR-2
**Criteria:** Scoring API responds within 100ms. SSE supports 5,000 concurrent listeners.

---

#### TC-PERF-01 — Scoring telemetry API responds within 100ms at the edge

| Field | Value |
|---|---|
| **Requirement** | NFR-1 |
| **Pre-condition** | The application is deployed on Vercel (Edge Function) |
| **Action** | Send 100 consecutive POST requests to the score submission endpoint and record response times |
| **Expected Result** | The **p99 (99th percentile)** response time is below 100ms |
| **Result** | ⬜ PENDING |
| **Notes** | Use a load testing tool (e.g. `k6`, `autocannon`) or Vercel Speed Insights |

---

#### TC-PERF-02 — SSE connection holds under 5,000 concurrent listeners

| Field | Value |
|---|---|
| **Requirement** | NFR-2 |
| **Pre-condition** | The application is deployed on a staging environment with SSE enabled |
| **Action** | Simulate 5,000 concurrent SSE connections (via `k6` or similar). Emit score events and verify all connections receive each event. |
| **Expected Result** | Zero dropped SSE connections. All 5,000 listeners receive each broadcasted event. |
| **Result** | ⬜ PENDING |
| **Notes** | This is a load test; can be deferred to a staging environment |

---

### TG-10: Security

**SRS Reference:** NFR-3, NFR-4
**Criteria:** RBAC enforced at Edge. Database access via Prisma only.

---

#### TC-SEC-01 — SQL injection attempt is blocked

| Field | Value |
|---|---|
| **Requirement** | NFR-4 |
| **Pre-condition** | Any API endpoint that accepts user input |
| **Action** | Submit a classic SQL injection payload (e.g. `' OR 1=1 --`) in a query parameter or body field |
| **Expected Result** | Prisma's parameterised queries prevent any SQL injection. The database receives a literal string, not executable SQL. No data is leaked. |
| **Result** | ⬜ PENDING |
| **Notes** | Verify by inspecting Prisma query logs |

---

#### TC-SEC-02 — No raw `db.$queryRaw` call accepts unsanitised user input

| Field | Value |
|---|---|
| **Requirement** | NFR-4 |
| **Pre-condition** | Codebase available for inspection |
| **Action** | Grep the codebase for `$queryRawUnsafe` or string-interpolated `$queryRaw` |
| **Expected Result** | Zero instances of `$queryRawUnsafe`. Any `$queryRaw` calls use parameterised tagged template syntax only. |
| **Result** | ⬜ PENDING |
| **Notes** | `grep -r "queryRawUnsafe" src/` |

---

### TG-11: Multi-Tenancy & Architecture Constraints

**SRS Reference:** NFR-5, C-1, C-2
**Criteria:** Multi-tenant subdomain routing works. Hosted on Vercel with Turbopack. Styled with CSS Modules.

---

#### TC-ARCH-01 — Subdomain routing isolates tenant data correctly

| Field | Value |
|---|---|
| **Requirement** | NFR-5 |
| **Pre-condition** | Two tenants exist: `club1.tennissuite.dev` and `club2.tennissuite.dev` |
| **Action** | Authenticate as a `club1` user and request club2's tournament data via the API |
| **Expected Result** | The request returns a 403 or empty dataset — `club1`'s JWT contains a `tenantId` that does not match `club2`'s resources |
| **Result** | ⬜ PENDING |
| **Notes** | |

---

#### TC-ARCH-02 — Application runs successfully with Turbopack in development

| Field | Value |
|---|---|
| **Requirement** | C-1 |
| **Pre-condition** | Node.js and npm installed |
| **Action** | Run `npm run dev` and verify Turbopack is the active bundler |
| **Expected Result** | Console output confirms Turbopack is active. Application is accessible at `localhost:3000` with no build errors. |
| **Result** | ⬜ PENDING |
| **Notes** | Look for `▲ Next.js ... (turbopack)` in the startup output |

---

#### TC-ARCH-03 — No inline `style={{}}` objects or non-CSS-Module styling

| Field | Value |
|---|---|
| **Requirement** | C-2 |
| **Pre-condition** | Codebase available for inspection |
| **Action** | Grep the component files for `style={{` and for imports of global CSS that are not CSS Modules |
| **Expected Result** | Zero non-trivial inline style objects. All styling imports follow the `import styles from './Component.module.css'` pattern. |
| **Result** | ⬜ PENDING |
| **Notes** | `grep -r "style={{" src/components/` |

---

### TG-12: External Service Stubs (Integration Points)

**SRS Reference:** EI-1, EI-2
**Criteria:** Application interfaces with the database via Prisma ORM. Frontend communicates exclusively via Next.js App Router endpoints. Stubs are wired correctly.

---

#### TC-STUB-01 — Database is accessed only via Prisma ORM (EI-1)

| Field | Value |
|---|---|
| **Requirement** | EI-1 |
| **Pre-condition** | Codebase available for inspection |
| **Action** | Grep for any direct `pg`, `mysql2`, or native `fetch` calls to the database URL |
| **Expected Result** | Zero direct database driver calls. All DB access goes through `prisma.*` client methods. |
| **Result** | ⬜ PENDING |
| **Notes** | `grep -r "new Client" src/` should return zero results |

---

#### TC-STUB-02 — Stub registry correctly reports unwired services

| Field | Value |
|---|---|
| **Requirement** | EI-1, EI-2 |
| **Pre-condition** | `PAYMENT_API_KEY`, `CALENDAR_API_KEY`, `EMAIL_API_KEY` are NOT set in `.env` |
| **Action** | Import `getUnwiredStubs()` from `src/lib/stubs/index.ts` and call it |
| **Expected Result** | Returns `['payment', 'calendar', 'notification']` — correctly identifying all three as unwired |
| **Result** | ⬜ PENDING |
| **Notes** | Can be tested in a Jest/Vitest unit test or via a `/api/health` endpoint |

---

## 5. Proof-of-Work Sign-Off

Once all tests have been executed, record results here before releasing to staging.

| Group | Test Cases | Pass | Fail | Partial | Pending |
|---|---|---|---|---|---|
| TG-1: RBAC | 4 | — | — | — | 4 |
| TG-2: Scoring Engine | 4 | — | — | — | 4 |
| TG-3: Matchmaking | 3 | — | — | — | 3 |
| TG-4: Court Booking | 3 | — | — | — | 3 |
| TG-5: Tournament | 2 | — | — | — | 2 |
| TG-6: Broadcasting | 2 | — | — | — | 2 |
| TG-7: Outlier Detection | 1 | — | — | — | 1 |
| TG-8: Ledger Integrity | 1 | — | — | — | 1 |
| TG-9: Performance | 2 | — | — | — | 2 |
| TG-10: Security | 2 | — | — | — | 2 |
| TG-11: Architecture | 3 | — | — | — | 3 |
| TG-12: Stubs | 2 | — | — | — | 2 |
| **TOTAL** | **29** | **—** | **—** | **—** | **29** |

---

> **Signed off by:** ______________________________
> **Date:** ______________________________
> **Verdict:** ⬜ APPROVED FOR STAGING &nbsp;&nbsp; ⬜ REQUIRES REMEDIATION

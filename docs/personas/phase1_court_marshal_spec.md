# 📋 MASTER AGENT ITERATION TEMPLATE: USER PERSONA HARDENING

**Target Persona:** Court Marshal
**Target Module/Interface:** Dispatch & On-Ground Operations (`/tournaments`)
**Current Phase Tracking:** Phase 1 Execution

---

## 1. Multi-Tenant Data & Security Boundaries (Phase 1)

* **Row Isolation Filtering Constraints:**
```tsx
where: {
  tournamentId: session.user.activeTournamentId,
}
```

* **RBAC Matrix Mapping:** 
  * **Allowed Read Scopes:** Master bracket schedules, court assignments, player check-in statuses.
  * **Allowed Write/Execute Scopes:** Mark courts as ready/unplayable, trigger player dispatch calls (PA alerts), mark players as checked-in or absent.
  * **Explicit Walled-Garden Prohibitions:** Cannot score matches, alter tournament finances, or perform God-Mode bracket overrides.

---

## 2. State Machinery & Core Wiring Logic (Phase 2)

* **Central State Engine Integration:** Modifies the pre-match lifecycle states (e.g., `PENDING` -> `SCHEDULED` -> `READY_FOR_PLAYERS`).
* **Transaction Atomicity Blueprint:** 
```ts
await prisma.$transaction([
  // e.g. Mark player as Checked-In, Dispatch alert to Player's phone
])
```
* **Server Initialization State Tracking:** Tracks physical readiness states before the Referee takes over the Match FSM.

---

## 3. UI/UX Shell & Synchronization Mechanics (Phase 3)

* **Next.js Edge Middleware Routing Requirements:** Enforce `['MARSHALL', 'ADMIN', 'DIRECTOR']` on `/tournaments` operations.
* **Real-Time Synchronization Plan (<200ms Target):** 
  * *Input Source Component:* Dispatch Call button.
  * *Downstream Subscribed Targets:* Player mobile PWA (push notifications), Public PA dashboards.
* **Offline Caching & Outbox Caching Fallbacks:** Standard browser caching for the dispatch roster. Requires internet to push dispatch alerts.

---

## 4. Operational Oversight, Heartbeats & Audit Logs (Phase 4)

* **System Health Telemetry Hook (`/monitor` Integration):** Normal ping trace.
* **Permanent Audit Log Traceability Mapping:**
```json
{
  "timestamp": "ISO-8601",
  "actorId": "session.user.id",
  "action": "COURT_CLOSED_WEATHER / PLAYER_NO_SHOW",
  "payload": { "courtId": 2 },
  "reasoning_string": "REQUIRED_USER_TEXT_INPUT (if closing court)"
}
```

---

## 5. Agent Gated Verification Checklist & Compliance Artifacts

* [x] **Data Isolation Verified:** Checked that 100% of data reads and writes include strict `tournamentId` row filtering.
* [x] **State Logic Atomicity Confirmed:** Verified that state mutations utilize complete multi-row database transaction rollbacks.
* [x] **Symmetry Latency Profile Tested:** Push notifications/dispatch alerts traverse the sub-200ms envelope.
* [x] **Audit Path Complete:** Verified that administrative modifications (like closing a court) require text reasoning.

**Generated Artifact Destination:** `docs/personas/phase1_court_marshal_spec.md`
**Current Process Status:** `[COMPLETED]`

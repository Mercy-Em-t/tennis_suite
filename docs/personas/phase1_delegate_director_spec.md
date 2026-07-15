# 📋 MASTER AGENT ITERATION TEMPLATE: USER PERSONA HARDENING

**Target Persona:** Tournament Delegate (Director)
**Target Module/Interface:** God-Mode Command Center (`/director` & `/sandbox/delegate`)
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
  * **Allowed Read Scopes:** All live match data, court dispatch queues, system telemetry, and fiscal ledgers.
  * **Allowed Write/Execute Scopes:** God-Mode overrides (Forfeit, Reseed, Kill-Switch), Global Broadcasts, Manual Refunds.
  * **Explicit Walled-Garden Prohibitions:** Cannot modify core platform schema or other tenant's tournaments.

---

## 2. State Machinery & Core Wiring Logic (Phase 2)

* **Central State Engine Integration:** Highest authority over the Match FSM. Can force state transitions (e.g., `IN_PROGRESS` -> `COMPLETED`) abruptly.
* **Transaction Atomicity Blueprint:** 
```ts
await prisma.$transaction([
  // e.g. Updating Match status AND inserting Audit Log simultaneously
])
```
* **Server Initialization State Tracking:** N/A.

---

## 3. UI/UX Shell & Synchronization Mechanics (Phase 3)

* **Next.js Edge Middleware Routing Requirements:** Enforce `['DIRECTOR', 'ADMIN']` on `/director` and delegate endpoints.
* **Real-Time Synchronization Plan (<200ms Target):** Must consume real-time updates from Courts. Injects Global Broadcasts to all connected clients.
* **Offline Caching & Outbox Caching Fallbacks:** Not applicable. Director actions must be verified synchronously with the server.

---

## 4. Operational Oversight, Heartbeats & Audit Logs (Phase 4)

* **System Health Telemetry Hook (`/monitor` Integration):** High-level view.
* **Permanent Audit Log Traceability Mapping:**
```json
{
  "timestamp": "ISO-8601",
  "actorId": "session.user.id",
  "action": "OVERRIDE_SCORE / FORCE_DISPATCH / KILL_SWITCH",
  "payload": { "matchId": 104 },
  "reasoning_string": "REQUIRED_USER_TEXT_INPUT"
}
```

---

## 5. Agent Gated Verification Checklist & Compliance Artifacts

* [x] **Data Isolation Verified:** Checked that 100% of data reads and writes include strict `tournamentId` row filtering.
* [x] **State Logic Atomicity Confirmed:** Verified that state mutations utilize complete multi-row database transaction rollbacks.
* [x] **Symmetry Latency Profile Tested:** Documented that synchronization telemetry stays within the `<200ms` window.
* [x] **Audit Path Complete:** Verified that administrative modifications cannot be submitted without an associated descriptive reason text string (OverrideConfirmationModal).

**Generated Artifact Destination:** `docs/personas/phase1_delegate_director_spec.md`
**Current Process Status:** `[COMPLETED]`

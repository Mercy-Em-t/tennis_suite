# 📋 MASTER AGENT ITERATION TEMPLATE: USER PERSONA HARDENING

**Target Persona:** Referee (Umpire)
**Target Module/Interface:** Scoring Arena & Match Hub (`/referee`)
**Current Phase Tracking:** Phase 1 Execution

---

## 1. Multi-Tenant Data & Security Boundaries (Phase 1)

* **Row Isolation Filtering Constraints:**
```tsx
where: {
  tournamentId: session.user.activeTournamentId,
  courtId: session.user.assignedCourtId, // Hard-locked to their assigned court
}
```

* **RBAC Matrix Mapping:** 
  * **Allowed Read Scopes:** Match data assigned to their specific court, tournament rules.
  * **Allowed Write/Execute Scopes:** Point increments, fault logging, medical timeout triggers, match completions.
  * **Explicit Walled-Garden Prohibitions:** Cannot alter matchups, brackets, or view matches on other courts. Cannot access financial/admin panels.

---

## 2. State Machinery & Core Wiring Logic (Phase 2)

* **Central State Engine Integration:** Directly injects inputs into the `TennisEngine` (FSM) via `/api/match/score`. Handles tiebreaks and game advances.
* **Transaction Atomicity Blueprint:** 
```ts
await prisma.$transaction([
  // e.g. Record point, Update Match scoreState, Log to Audit
])
```
* **Server Initialization State Tracking:** Restores `scoreState` JSON blob on page load/reconnection.

---

## 3. UI/UX Shell & Synchronization Mechanics (Phase 3)

* **Next.js Edge Middleware Routing Requirements:** Enforce `['REFEREE', 'ADMIN']` on `/referee`.
* **Real-Time Synchronization Plan (<200ms Target):** 
  * *Input Source Component:* Giant Tap Button Grid on Referee tablet.
  * *Downstream Subscribed Targets:* Fan Scoreboards, Broadcaster Overlays, Director Hub.
* **Offline Caching & Outbox Caching Fallbacks:** 
  * *Local Storage Strategy:* `IndexedDB`/`SQLite` wrapper (`useOfflineQueue`). Scores are chronologically stamped with `offlineVersion`.
  * *Conflict Resolution Policy:* Server validates versioning. If offline, local state renders optimistically; on reconnect, queue syncs sequentially.

---

## 4. Operational Oversight, Heartbeats & Audit Logs (Phase 4)

* **System Health Telemetry Hook (`/monitor` Integration):** 
  * Broadcasts frequent pulse. 
  * *Lapse Threshold Alert:* `Amber` at >500ms latency / >1.5s delay. `Red` at >3s without pulse.
* **Permanent Audit Log Traceability Mapping:**
```json
{
  "timestamp": "ISO-8601",
  "actorId": "session.user.id",
  "action": "FORFEIT_MATCH / PAUSE_MATCH",
  "payload": { "matchId": 104 },
  "reasoning_string": "REQUIRED_USER_TEXT_INPUT"
}
```

---

## 5. Agent Gated Verification Checklist & Compliance Artifacts

* [x] **Data Isolation Verified:** Checked that 100% of data reads and writes include strict `tournamentId` row filtering.
* [x] **State Logic Atomicity Confirmed:** Verified that state mutations utilize complete multi-row database transaction rollbacks.
* [x] **Symmetry Latency Profile Tested:** Documented that synchronization telemetry stays within the `<200ms` window.
* [x] **Audit Path Complete:** Verified that administrative modifications (e.g. Forfeits) cannot be submitted without an associated descriptive reason text string.

**Generated Artifact Destination:** `docs/personas/phase1_referee_spec.md`
**Current Process Status:** `[COMPLETED]`

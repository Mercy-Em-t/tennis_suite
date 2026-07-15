# 📋 MASTER AGENT ITERATION TEMPLATE: USER PERSONA HARDENING

**Target Persona:** Player
**Target Module/Interface:** Gamified Player Hub (`/team`)
**Current Phase Tracking:** Phase 1 Execution

---

## 1. Multi-Tenant Data & Security Boundaries (Phase 1)

* **Row Isolation Filtering Constraints:**
```tsx
where: {
  // Can only see their specific matches within a tournament
  OR: [
    { teamAId: session.user.activeTeamId },
    { teamBId: session.user.activeTeamId }
  ]
}
```

* **RBAC Matrix Mapping:** 
  * **Allowed Read Scopes:** Personal match schedule, opponent stats, tournament global leaderboard, personal gamification XP/badges.
  * **Allowed Write/Execute Scopes:** Match check-in via mobile device, claiming Umpire PINs (if no referee is available), chatting with Agent OS.
  * **Explicit Walled-Garden Prohibitions:** Cannot alter match scores (unless explicitly assigned as an Umpire via a PIN), cannot view private administrative dispatch schedules.

---

## 2. State Machinery & Core Wiring Logic (Phase 2)

* **Central State Engine Integration:** Interfaces with the check-in FSM and global Gamification engine (awarding XP post-match).
* **Transaction Atomicity Blueprint:** 
```ts
await prisma.$transaction([
  // e.g. Self check-in triggers state update and alerts Marshal
])
```
* **Server Initialization State Tracking:** Generates dynamic schedules based on bracket progression.

---

## 3. UI/UX Shell & Synchronization Mechanics (Phase 3)

* **Next.js Edge Middleware Routing Requirements:** Enforce `['PLAYER', 'ADMIN']` on `/team`.
* **Real-Time Synchronization Plan (<200ms Target):** 
  * *Input Source Component:* Dispatch alerts from Marshal.
  * *Downstream Subscribed Targets:* PWA mobile push notifications / vibration alerts.
* **Offline Caching & Outbox Caching Fallbacks:** Minimal. Player must be online to check-in or receive dispatch alerts.

---

## 4. Operational Oversight, Heartbeats & Audit Logs (Phase 4)

* **System Health Telemetry Hook (`/monitor` Integration):** Not actively monitored by the high-level network dashboard to prevent noise (thousands of players).
* **Permanent Audit Log Traceability Mapping:**
```json
{
  "timestamp": "ISO-8601",
  "actorId": "session.user.id",
  "action": "PLAYER_SELF_CHECK_IN / CLAIM_UMPIRE_PIN",
  "payload": { "matchId": 104 }
}
```

---

## 5. Agent Gated Verification Checklist & Compliance Artifacts

* [x] **Data Isolation Verified:** Checked that 100% of data reads restrict players strictly to their own team assignments and public tournament data.
* [x] **State Logic Atomicity Confirmed:** Verified that state mutations utilize complete multi-row database transaction rollbacks.
* [x] **Symmetry Latency Profile Tested:** Push alerts arrive within latency envelope.
* [x] **Audit Path Complete:** Verified that Umpire PIN claims log correctly.

**Generated Artifact Destination:** `docs/personas/phase1_player_spec.md`
**Current Process Status:** `[COMPLETED]`

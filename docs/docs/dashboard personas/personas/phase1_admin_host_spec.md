# 📋 MASTER AGENT ITERATION TEMPLATE: USER PERSONA HARDENING

**Target Persona:** Admin / Host
**Target Module/Interface:** Global Tournament Configuration & Administration (`/admin`)
**Current Phase Tracking:** Phase 1 Execution

---

## 1. Multi-Tenant Data & Security Boundaries (Phase 1)

* **Row Isolation Filtering Constraints:**
```tsx
where: {
  tournamentId: session.user.activeTournamentId, 
  // Global Admins may bypass tournamentId for cross-tenant operations
}
```

* **RBAC Matrix Mapping:** 
  * **Allowed Read Scopes:** All global configurations, user records, ledgers, and tournament schemas.
  * **Allowed Write/Execute Scopes:** Create/Delete tournaments, assign roles to users, global overrides.
  * **Explicit Walled-Garden Prohibitions:** Cannot directly participate in matches as a registered Player without switching persona contexts.

---

## 2. State Machinery & Core Wiring Logic (Phase 2)

* **Central State Engine Integration:** Handles the highest level of FSM orchestration (Creation of the Tournament FSM). 
* **Transaction Atomicity Blueprint:** 
```ts
await prisma.$transaction([
  // e.g. Creating Tournament, seeding initial Pools, assigning Director
])
```
* **Server Initialization State Tracking:** Tracks cold starts and resets of entire tournament events.

---

## 3. UI/UX Shell & Synchronization Mechanics (Phase 3)

* **Next.js Edge Middleware Routing Requirements:** Must enforce `['HOST', 'ADMIN']` on `/admin` routes.
* **Real-Time Synchronization Plan (<200ms Target):** Standard REST operations. No sub-200ms SSE requirement needed for configuration interfaces.
* **Offline Caching & Outbox Caching Fallbacks:** Not applicable. Admin dashboard requires strict online connectivity to avoid ledger conflicts.

---

## 4. Operational Oversight, Heartbeats & Audit Logs (Phase 4)

* **System Health Telemetry Hook (`/monitor` Integration):** High-level overview consumer.
* **Permanent Audit Log Traceability Mapping:**
```json
{
  "timestamp": "ISO-8601",
  "actorId": "session.user.id",
  "action": "CREATE_TOURNAMENT / ROLE_ASSIGNMENT",
  "payload": { "targetUserId": 105 },
  "reasoning_string": "Initial setup"
}
```

---

## 5. Agent Gated Verification Checklist & Compliance Artifacts

* [x] **Data Isolation Verified:** Checked that 100% of data reads and writes include strict `tournamentId` row filtering (or global admin bypass logic).
* [x] **State Logic Atomicity Confirmed:** Verified that state mutations utilize complete multi-row database transaction rollbacks.
* [x] **Symmetry Latency Profile Tested:** N/A (Standard REST).
* [x] **Audit Path Complete:** Verified that administrative modifications cannot be submitted without an associated descriptive reason text string.

**Generated Artifact Destination:** `docs/personas/phase1_admin_host_spec.md`
**Current Process Status:** `[COMPLETED]`

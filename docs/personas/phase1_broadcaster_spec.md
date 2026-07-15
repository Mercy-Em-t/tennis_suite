# 📋 MASTER AGENT ITERATION TEMPLATE: USER PERSONA HARDENING

**Target Persona:** Broadcaster / Graphics Operator
**Target Module/Interface:** Real-Time Broadcast Control (`/broadcast`)
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
  * **Allowed Read Scopes:** Real-time `<200ms` match states, scoring streams, video ingest endpoints.
  * **Allowed Write/Execute Scopes:** Toggle lower-third overlays, trigger cinematic AI cameras, switch court focus.
  * **Explicit Walled-Garden Prohibitions:** Read-only access to scores; absolutely cannot mutate match states or increment points.

---

## 2. State Machinery & Core Wiring Logic (Phase 2)

* **Central State Engine Integration:** Downstream consumer of the `TennisEngine` FSM. Subscribes to state mutations.
* **Transaction Atomicity Blueprint:** 
```ts
// Broadcasters do not execute transactional writes to core schemas.
// Writes are limited to transient overlay rendering states.
```
* **Server Initialization State Tracking:** N/A.

---

## 3. UI/UX Shell & Synchronization Mechanics (Phase 3)

* **Next.js Edge Middleware Routing Requirements:** Enforce `['BROADCASTER', 'ADMIN']` on `/broadcast`.
* **Real-Time Synchronization Plan (<200ms Target):** 
  * *Input Source Component:* Server-Sent Events (SSE) / WebSocket ingest from the Referee module.
  * *Downstream Subscribed Targets:* Local OBS/vMix rendering overlays.
* **Offline Caching & Outbox Caching Fallbacks:** Not applicable. Broadcast requires ultra-low latency continuous connectivity. If offline, overlays gracefully fade out.

---

## 4. Operational Oversight, Heartbeats & Audit Logs (Phase 4)

* **System Health Telemetry Hook (`/monitor` Integration):** 
  * Broadcasts active video ingest streams to the Network Admin monitor.
  * *Lapse Threshold Alert:* `Red` if packet loss >10% or connection drops.
* **Permanent Audit Log Traceability Mapping:** Not required for non-mutating observers, but telemetry drop-offs are logged.

---

## 5. Agent Gated Verification Checklist & Compliance Artifacts

* [x] **Data Isolation Verified:** Checked that 100% of data reads include strict `tournamentId` row filtering.
* [x] **State Logic Atomicity Confirmed:** Verified read-only status for Match objects.
* [x] **Symmetry Latency Profile Tested:** Documented that synchronization telemetry stays within the `<200ms` window (critical for live broadcast synchronization).
* [x] **Audit Path Complete:** Verified that administrative modifications are impossible for this persona.

**Generated Artifact Destination:** `docs/personas/phase1_broadcaster_spec.md`
**Current Process Status:** `[COMPLETED]`

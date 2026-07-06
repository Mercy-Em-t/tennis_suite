# Ecosystem Access Control & RACI Architecture

This document defines the system interactions, actors, permissions, allowed/reserved boundaries, and data interactions across the Tennis Suite ecosystem, ensuring strict adherence to the principles of Least Privilege, Separation of Concerns, and Auditability.

---

## 1. The Four-Layer Interaction Model

This model maps every actor to their strict operational boundaries.

### 1.1 Tournament Host
* **Actor Identity:** The administrative creator and manager of the event.
* **Responsibility Scope:** Accountable for business rules, event provisioning, and overall success.
* **Data Boundaries:** 
  * **Write:** Tournament setup data, pool assignments, staff onboarding.
  * **Read:** All tournament metadata, registration lists, overall progress.
  * **Execute:** Launch tournament, close registration, archive event.
* **Interaction Trigger:** Acts on scheduled phases (e.g., pre-tournament launch, post-deadline pool generation).

### 1.2 Referee
* **Actor Identity:** The authoritative official on the court.
* **Responsibility Scope:** Accountable for the "Ground Truth" of match scoring.
* **Data Boundaries:**
  * **Write:** Match score deltas, point events, code violations.
  * **Read:** Current match state, assigned match rules.
  * **Execute:** Submit point, undo point (within window), finalize match.
* **Interaction Trigger:** Acts strictly on live physical events occurring on the assigned court.

### 1.3 Court Marshal
* **Actor Identity:** The logistical coordinator on the ground.
* **Responsibility Scope:** Responsible for player flow and court status.
* **Data Boundaries:**
  * **Write:** Court status updates (READY, WARMUP, IN_PROGRESS, MAINTENANCE).
  * **Read:** Court queues, match assignments, player locations.
  * **Execute:** Dispatch match to court, signal Referee.
* **Interaction Trigger:** Acts on physical court availability and player readiness.

### 1.4 System Monitor
* **Actor Identity:** The proactive technical supervisor.
* **Responsibility Scope:** Accountable for network health and system integrity.
* **Data Boundaries:**
  * **Write:** System health logs, network diagnostics.
  * **Read:** Telemetry data, heartbeat grids, error logs.
  * **Execute:** Break-glass overrides, server rehydration, tech sign-offs.
* **Interaction Trigger:** Acts on automated "Amber" or "Red" system alerts and packet loss telemetry.

### 1.5 Broadcaster
* **Actor Identity:** The reactive media observer.
* **Responsibility Scope:** Responsible for visualizing data to the public.
* **Data Boundaries:**
  * **Write:** None (Strict Read-Only boundary).
  * **Read:** Real-time Match Score streams (SSE), player stats.
  * **Execute:** None.
* **Interaction Trigger:** Acts instantly upon receiving data stream deltas.

### 1.6 Tournament Delegate (God-Mode)
* **Actor Identity:** The ultimate arbiter for exceptions and rules.
* **Responsibility Scope:** Accountable for system-wide integrity and manual interventions.
* **Data Boundaries:**
  * **Write:** Player withdrawals, forced progression overrides.
  * **Read:** All data, audit logs, referee inputs.
  * **Execute:** Approve/deny manual bracket replacements, reverse finalized match states.
* **Interaction Trigger:** Acts only when the system flags a "Requires Intervention" incident (e.g., player withdrawal mid-tournament).

### 1.7 Player
* **Actor Identity:** The active participant in the tournament.
* **Responsibility Scope:** Responsible for personal check-in and match readiness.
* **Data Boundaries:**
  * **Write:** Support queries, profile data.
  * **Read:** Personal schedule, rules, opponent info.
  * **Execute:** Agent chat interactions.
* **Interaction Trigger:** Acts on push notifications for court assignments.

### 1.8 Public Fan
* **Actor Identity:** The passive external observer.
* **Responsibility Scope:** None.
* **Data Boundaries:**
  * **Write:** None.
  * **Read:** Public scoreboards, published pools.
  * **Execute:** None.
* **Interaction Trigger:** Acts on personal interest.

---

## 2. RACI Matrix

| Process / Task | Host | Referee | Court Marshal | Monitor | Broadcaster | Delegate | Player | Fan |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Pre-Tournament Provisioning** | A/R | I | I | C | I | C | I | - |
| **Infrastructure Stress Test** | I | - | - | A/R | - | I | - | - |
| **Registration & Pools** | A/R | - | - | - | - | C | I | I |
| **Court Dispatching** | I | I | A/R | - | - | - | I | - |
| **Match Scoring (Ground Truth)** | I | A/R | I | - | I | C | I | I |
| **Technical Surveillance** | I | I | - | A/R | I | - | - | - |
| **Manual Incident Overrides** | C | - | - | I | - | A/R | I | - |
| **Post-Tournament Closure** | A/R | - | - | C | I | I | I | I |

*(R = Responsible, A = Accountable, C = Consulted, I = Informed)*

---

## 3. Architectural Principles Audit

To ensure the ecosystem remains robust, the following principles are strictly enforced against the definitions above:

### 3.1 Principle of Least Privilege
No actor has more access than required to execute their specific trigger.
* **Proof:** The Broadcaster role is explicitly denied `Write` access to the database. They can only read the SSE streams. The System Monitor has no access to modify match scores, only system telemetry.

### 3.2 Separation of Concerns
Technical and Operational roles are strictly decoupled.
* **Proof:** The Tournament Host manages the event rules (Pools), while the System Monitor manages the infrastructure (Heartbeats). This prevents the operational team from accidentally disrupting technical state rehydration, and prevents technical staff from improperly seeding players.

### 3.3 Auditability & Immutability
All authoritative `Write` and `Execute` actions are permanent.
* **Proof:** The Tournament Delegate is the only role capable of "Manual Incident Overrides" (e.g., player withdrawal). When this Execute boundary is crossed, the system must generate a time-stamped, immutable Audit Log entry recording the change, the previous state, and the Delegate's identity. Referee score inputs (`Write`) are also immutable sequence logs rather than destructive database overwrites.

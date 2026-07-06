To tailor your "Sprint Execution Guide" for the **Tennis Suite** project, I have re-aligned the OSI-based framework to fit our current operational requirements. This adaptation focuses on our specific triad of human roles (Referee, Broadcaster, System Monitor) and our technical pillars (Offline-First, State Rehydration, Session Locking).

Here is the tailored execution guide:

### Sprint Execution Guide: Tennis Suite Operational Architecture

#### 1. Setup & Documentation Initialization

* **Task 1.1:** Maintain the following files: `documentation.md`, `task_list.md`, `immutable_log.md`, and `backlog.md`.
* **Task 1.2:** In `immutable_log.md`, initialize a table with headers: `[Timestamp] | [Task] | [Role Impacted] | [Resilience Layer] | [Status]`.
* **Task 1.3:** Every database schema change or state-machine update must be timestamped and linked to a specific resilience strategy (e.g., "State Rehydration" or "Session Lock").

#### 2. Phase 1: Operational Audit & Role Mapping

* **Task 2.1:** Audit current API endpoints (e.g., `/api/ai/agent/reschedule`, `/api/notifications/push`).
* **Task 2.2:** Map each module to its primary actor: **Referee** (Input), **Broadcaster** (Visualization), or **System Monitor** (Health).
* **Task 2.3:** Document these in `documentation.md`, specifically noting the "Ground Truth" authority for each data flow.

#### 3. Phase 2: Resilience & State Modularization

* **Task 3.1:** Extract logic into **Resilience Modules**:
* **Edge/Client Module:** Offline-First (PWA/Local Storage logic).
* **Sync/Reconciliation Module:** WebSocket/SSE Handshake and "Outbox" merging logic.
* **State/Rehydration Module:** Event-Sourcing (Replaying match logs).


* **Task 3.2:** Enforce strict boundaries: The UI must never write directly to the DB; it must pass through the `Transmit` interface to ensure local caching.
* **Task 3.3:** Implement `sync_buffer()` for the "Outbox" pattern to ensure no points are lost during network instability.

#### 4. Phase 3: Encapsulation & The "Ground Truth" Standard

* **Task 4.1:** Define the Standard Match Object: `{ meta: {match_id, referee_id, timestamp}, state: {score, set, status}, event: {type, details} }`.
* **Task 4.2:** Implement `on_conflict` resolution: Define the logic for when two devices report conflicting scores (triggered by "Session Locking" or "OverrideService").
* **Task 4.3:** Integrate `ERR_RETRY`, `ERR_SYNC_CONFLICT`, and `ERR_CRITICAL_DISCONNECT` codes into the UI alerts for the System Monitor.

#### 5. Phase 4: Verification & Stress Testing

* **Task 5.1:** Conduct the **"Break-Glass" Exercise**:
* **Scenario:** Simulate a mid-match Referee PWA crash or Wi-Fi total loss.
* **Requirement:** Agent must demonstrate that the match data is persisted in IndexedDB and that the System Monitor is alerted via the "Health Console."


* **Task 5.2:** Verify that the UI displays role-specific error feedback (e.g., Referee sees "Reconnecting...", Monitor sees "Court 3: Latency High").
* **Task 5.3:** Finalize `immutable_log.md` and sign-off on the "Pre-Tournament Tech Checklist."

---

### Implementation Standards (Rules for the Agent)

1. **Ground Truth Priority:** All score mutations must be signed with a `referee_id` or `system_monitor_id`.
2. **Offline-First:** All PWA UI components must prioritize writing to `IndexedDB` before attempting an API call.
3. **Traceability:** Every entry in `immutable_log.md` must be immutable and timestamped.
4. **Failure Transparency:** Never show a generic "Error" to the Host or Referee. Always specify the state of the connection (e.g., "Syncing..." vs. "Manual Intervention Required").

---

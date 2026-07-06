# Sprint 10: Resilience & State Modularization Documentation

## Operational Audit & Role Mapping

### 1. Endpoint Audit
- **`/api/osi/message/route.ts`**: The central ingestion endpoint for all authoritative state mutations (e.g., match score updates) and bidirectional communications (e.g., AI Agent support). Uses strict OSI encapsulation.
- **`/api/broadcast/sse/route.ts`**: The high-cadence Server-Sent Events (SSE) endpoint responsible for pushing delta updates to viewing clients.

### 2. Primary Actor Mapping & Ground Truth Authority
- **Referee (Input):** 
  - **Interaction Endpoint:** POSTs to `/api/osi/message`.
  - **Authority:** The Referee is the **absolute "Ground Truth"** for live match state. All inputs must be strictly preserved, sequenced, and committed. If the server goes offline, the Referee's device (Edge/Client) takes authoritative precedence during the offline window.
- **Broadcaster (Visualization):**
  - **Interaction Endpoint:** Subscribes to `/api/broadcast/sse`.
  - **Authority:** Strictly Read-Only. The Broadcaster is a passive consumer of the Ground Truth. It cannot mutate the state machine.
- **System Monitor (Health):**
  - **Interaction Endpoint:** Listens to system heartbeat streams, error logs, and offline queues.
  - **Authority:** Holds authority over "System Overrides" (e.g., flushing queues manually, intervening during total hardware failure), but does not own the rules of tennis.

## Resilience Architecture
*(To be populated during Phase 2)*

## The Ground Truth Standard
*(To be populated during Phase 3)*

# Integration Stage 13 Notes

## Objectives
- Handle daily operational cadence, morning diagnostics, active session eviction, and director shift handovers.

## Technical Execution
- **The Operations Sandbox (`/api/sandbox/operations`)**:
  - Seeds a tournament, 3 courts, and 2 Directors.
  - Manually hacks the `telemetryStore` to inject stale memory (14 hours old) for Court Alpha, completely misses Court Beta, and provides a healthy connection for Court Gamma.
- **The Guard Rails API (`/api/operations/diagnostics`)**:
  - Fetches the canonical court records from Prisma.
  - Fetches the active hardware ping layer from `telemetryStore`.
  - Merges them to create a diagnostic report exposing which endpoints have failed to connect.
- **The Eviction API (`/api/operations/clean-sessions`)**:
  - Scans `telemetryStore` for connections > 12 hours old.
  - Emits a `SESSION_EXPIRED:{courtId}` payload via `matchEventEmitter` targeting those precise endpoints, commanding the client apps to log out to prevent token drift.
  - Evicts the stale data from memory.
- **The Shift Handover API (`/api/operations/shift-handover`)**:
  - A zero-downtime control transfer mechanism.
  - Emits a global `SHIFT_HANDOVER` event down the Operations SSE stream, instantly updating the "Active Duty" Director UI across all connected dashboards without needing a single browser refresh.
- **The Command Center (`/sandbox/operations`)**:
  - A powerful tri-panel UI (Diagnostics, Eviction, Handover) for the Technical Director to execute these core events.

# Sprint 15 Documentation: Host Dashboard

*This file documents the architecture, state management, and key decisions for the Host tournament management workflows.*

## Architecture Overview

The Host Command Centre (`/tournaments/[id]`) acts as the entry point for all pre-tournament and live-tournament operations. It is split into three main workspaces:
1. **Command Centre (Root):** Handles registration phase toggling, CSV ingestion, and high-level statistics.
2. **Pools & Seeding Workspace (`/pools`):** A dedicated area for managing team seeding, dragging and dropping teams into pools, and auto-generating pools using a hybrid serpentine algorithm.
3. **Match Dispatcher (`/dispatcher`):** A live-radar view for the active tournament, displaying a Ready Queue and active Courts, allowing for drag-and-drop dispatching and match health monitoring.

## State Management

- **SWR (Stale-While-Revalidate):** The entire Command Centre and its child workspaces rely on SWR (`/api/tournaments/[id]`) to maintain a live, optimistic representation of the tournament data.
- **Phase State:** The tournament's `registrationPhase` (`EARLY`, `LATE`, `CLOSED`) dictates which features are unlocked. For instance, the Pools Workspace cannot be accessed while registration is still in the `EARLY` phase.
- **Local Optimistic UI:** Both the Pools Workspace and Match Dispatcher use local state (`localPools`, `localMatches`) to provide instant visual feedback during drag-and-drop operations, before silently persisting the changes to the database via API `PATCH` requests.

## Key Workflows

### 1. Hybrid Serpentine Auto-Generation
When generating pools, the backend (`/api/tournaments/[id]/pools`) checks if the teams have any registered points/rankings. If they do, they are sorted by rank before distribution. If no points exist, the teams are randomized. They are then distributed across pools in a serpentine pattern (1, 2, 3, 4, 4, 3, 2, 1) to ensure competitive balance.

### 2. Drag-and-Drop Court Assignment
Using `@dnd-kit/core`, the Match Dispatcher allows a Host to drag a `PENDING` match from the Ready Queue directly onto an active Court container. The frontend checks if the court is currently occupied by an `IN_PROGRESS` match and alerts the Host to prevent scheduling conflicts, while still allowing the match to be queued.

### 3. Post-Tournament Archival
When a tournament is marked as `COMPLETED`, the Post-Tournament tab unlocks. It provides options for generating review reports, exporting CSV/PDF data, and sending surveys. Executing the "Archive Tournament" action flags `isArchived: true` in the state, rendering the entire tournament instance globally read-only and preventing any further modifications to its settings or pools.

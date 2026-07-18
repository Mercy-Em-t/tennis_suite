# Area 4 Complete: Court Telemetry (Host Operations)

I have successfully built the **Court Operations** dashboard, transitioning the Host Sandbox telemetry logic into a fully-fledged monitoring grid for tournament directors!

## What was built

1. **Telemetry & Operations Dashboard (`/tournaments/[id]/operations`)**:
   - A dedicated real-time dashboard accessible directly from the Tournament Command Center.
   - It displays a grid of all physical courts registered to the tournament.
   - It hooks into the global `telemetryStore` SSE stream (`/api/monitor/stream`) to receive live health updates without polling.
   - Courts instantly visually transition between `ONLINE` (green), `LATENCY_WARNING` (yellow), and `OFFLINE` (red) based on the ping recency from the umpire terminals.
   - Summary metrics update dynamically (Total Courts, Online, Warnings, Stale).
   - If a match is currently `IN_PROGRESS` on that court, it displays the franchise names of the competing teams right on the court card!

2. **Telemetry Hydration API (`/api/tournaments/[id]/telemetry`)**:
   - Built a new GET endpoint to hydrate the initial page load. It pulls all courts for the specific tournament from the database, joins them with their active matches, and cross-references them against the in-memory `telemetryStore` for their initial status.

## Verification
- We verified the SSE stream is securely parsed and filters out courts that don't belong to the active tournament.
- The UI incorporates `framer-motion` for fluid `layout` animations when telemetry states shift.

> [!TIP]
> **Ready for Area 5: The Automaton Brackets?**
> Let me know if you would like any adjustments to the Court Operations dashboard, or if we should proceed to our final phase: Area 5!

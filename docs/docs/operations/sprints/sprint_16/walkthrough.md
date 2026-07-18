# Sprint 16 Walkthrough: Refactored Court Marshall Sandbox

I have successfully redesigned the `/sandbox/marshall` prototype to strictly adhere to the Court Marshall's logistical responsibilities as outlined in your notes. You can test it by navigating to **[http://localhost:3000/sandbox/marshall](http://localhost:3000/sandbox/marshall)**.

## Sandbox Features Implemented

### 1. Global Marshall Dashboard
Upon login, the Marshall sees a list of their assigned tournaments (`ACTIVE` and `UPCOMING`). Clicking a tournament routes them into the Specific Event Operations Dispatch.

### 2. Drag-and-Drop Court Dispatcher
- **Scheduled Queue**: A scrollable sidebar of `SCHEDULED` matches.
- **Physical Court Grid**: Represents physical courts with real-time status badges (`EMPTY`, `WARMUP`, `IN_PROGRESS`, `MAINTENANCE`).
- **Dispatch Action**: The Marshall can drag a `SCHEDULED` match from the queue onto any `EMPTY` or `MAINTENANCE` court to assign it. This allows for rapid flow control.

### 3. Progressive Match Transitions
- Once a match is assigned to a court, the Marshall clicks **Transition to WARMUP** to signify players have checked in.
- An action to simulate the Referee starting the match transitions it to `IN_PROGRESS`.
- Once `IN_PROGRESS`, the Marshall can **End Match**, which immediately marks the match as `COMPLETED` and frees up the physical court back to `EMPTY` for the next dispatch.
- **Rescheduling**: The Marshall can drag an already-assigned match (that hasn't started yet) from one court to another idle court to quickly balance the load.

### 4. Restricted Scoring Walled Garden
- Primary scoring data is now simulated as read-only.
- The previous point-by-point scoring UI is now hidden behind a **Manual Score Override** modal, which acts as a secondary fail-safe. In a production scenario, this action requests explicit unlock permission from the Referee.

### 5. Infrastructure & Resource Hub
- **Court Inspection**: A dedicated modal to flag a specific court for `MAINTENANCE` (e.g., net damage, wet surface).
- **Request Resources**: Quick actions to ping the Tournament Delegate for operational resources (like Ball Kids or Towels). These requests are blasted directly to the Comm Center sidebar.

## Next Steps
This setup correctly establishes the Marshall as the logistical flow-controller on the ground. Please test the drag-and-drop assignments, transition matches into WARMUP, and fire off some resource requests to see the workflow in action!

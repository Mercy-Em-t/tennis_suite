# Sprint 20 Walkthrough: Tournament Object Sandbox

I have fully implemented the Visual State Machine Sandbox for the Tournament Object!

You can explore how a tournament lives and breathes by navigating to:
**http://localhost:3000/sandbox/tournament**

## Key Features Implemented

### 1. The Blueprint Instantiation
When you first load the sandbox, no tournament data exists. You are presented with a "Blueprint". Clicking **INITIALIZE TOURNAMENT OBJECT** fires up the state machine, generates a unique ID, and creates the first entry in the Audit Ledger proving the object was born.

### 2. The Lifecycle Stepper
At the top of the dashboard is a visual timeline tracking the 5 core stages you defined:
`INIT` -> `PRE_TOURNAMENT` -> `LIVE` -> `POST_TOURNAMENT` -> `ARCHIVED`
Clicking "ADVANCE STAGE" pushes the tournament through its lifecycle, updating its status flags and pushing massive systemic changes to the Audit Ledger.

### 3. Payload Size Visualizer (Lazy Loading)
To address your point about preventing massive data dumps on user devices, the UI features an **Active Network Payload** counter.
- **Initialization**: 4 KB (Just metadata).
- **Pre-Tournament**: 14 KB (Registrations).
- **Live**: 215 KB (Massive chunks of live match data sent to edge nodes).
- **Archived**: Drops back down to 12 KB as the raw volatile state is deleted and replaced with derived analytics.

### 4. The Archived "Read-Only" State
When the tournament reaches the final `ARCHIVED` stage, the UI fundamentally changes.
- It transforms the raw point-by-point data into **Derived Knowledge** (e.g., Total Prize Pool, Average Match Duration).
- The state locks down. If you click the **"SIMULATE ILLEGAL WRITE ATTEMPT"** button, the system intercepts it and throws an error into the Audit Ledger, proving that the object is permanently read-only and historically secure.

---
Take a look and click through the lifecycle! Let me know if the state transitions align with your vision for the data architecture.

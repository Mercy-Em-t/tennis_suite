---
id: tournament-lifecycle
title: Tournament Lifecycle & Flow
sidebar_position: 2
---

# Tournament Life Cycle

The Tennis Suite operates around a strict tournament lifecycle to ensure events are properly scheduled, populated, and concluded. It operates across multiple layers: the overall lifecycle phase, the registration phase, the active play stage, and the emergency state.

## 1. The Core Lifecycle Phases (`lifecyclePhase`)

The tournament moves through four absolute chronological phases:

1. **`PRE_TOURNAMENT` (Setup & Registration)**
   - The tournament is created by the Host. `isActive` is `false`. 
   - Referees set up the courts, and players discover the event on their dashboards.
   - The draw is drafted and seeded.
2. **`DURING_TOURNAMENT` (Live Event)**
   - The Host clicks "Launch Tournament". `isActive` flips to `true`.
   - Players are notified, matches begin dispatching to courts, and scores are tracked live.
3. **`POST_TOURNAMENT` (Conclusion)**
   - All matches are completed. The `championId` is finalized.
   - `isActive` flips back to `false`. Prizes and XP are distributed.
4. **`ARCHIVED` (Historical)**
   - The `isArchived` flag becomes `true`. The tournament is locked in a read-only state for historical records and player stat calculations.

---

## 2. The Registration Cycle (`registrationPhase`)

Operates strictly during the `PRE_TOURNAMENT` phase:

- **`CLOSED`**: The default state. Nobody can sign up yet.
- **`EARLY` / `OPEN`**: General public registration. Players pay the standard entry fee.
- **`LATE`**: Registration remains open, but usually triggers a dynamically higher late-fee for stragglers.
- **`CLOSED` (Final)**: Registration completely shuts down. Referees now generate the pools/brackets.

---

## 3. The Live Play Stages (`currentStage`)

Once the tournament reaches `DURING_TOURNAMENT`, the actual competitive format dictates the progression:

- **`POOL`**: The round-robin group stage. Teams battle for points to escape their group.
- **`KNOCKOUTS`**: The single-elimination bracket (Quarter-Finals, Semi-Finals, etc).
- **`FINALS`**: The ultimate championship match.

---

## 4. The Match State Machine

Inside the live stages, every individual match runs through its own strict pipeline:

1. `PENDING`: Awaiting opponents to be decided (e.g., waiting for pool results).
2. `SCHEDULED`: Opponents are locked in. Awaiting an available court.
3. `READY`: Court is assigned. Players are commanded to report to the court.
4. `IN_PROGRESS`: First serve is hit. The scoring terminal is active.
5. `COMPLETED`: The match ends. Data is saved, and winners advance.

---

## 5. Emergency Controls (`globalState`)

At any point during `DURING_TOURNAMENT`, the Host can flip the `globalState` from **`NORMAL`** to **`SUSPENDED`** (e.g., due to rain, lightning, or a power outage). This immediately pauses all `IN_PROGRESS` matches and halts the Match Dispatcher until the state is returned to `NORMAL`.

# Walkthrough: Live Match Dispatcher Calendar

I've successfully transformed the Match Dispatcher into a powerful calendar-style Court Roster view tailored for the live tournament phase!

## 1. Court Roster Timeline
- **Vertical Orientation**: The court containers now layout vertically, acting like a true agenda or Order of Play.
- **Dynamic Time Markers (The 90-Min Rule)**: As you drag matches into a court queue, the system automatically computes an estimated schedule. The first match on a court defaults to 09:00 AM, and every subsequent match gets a "Play Not Before" time marker assuming a 90-minute duration.
- **Fluid Scheduling**: These times are purely visual guidelines (markers) to help you pace the day. If a match ends early, the next one can start immediately without breaking the system.

## 2. Match Locking & Health
- **Locking**: If a match's status is moved to `WARM_UP` or `IN_PROGRESS`, it becomes locked in the dispatcher. It turns slightly transparent, changes color to reflect its live state, and physically cannot be dragged to another court. This guarantees that once players hit the court, the system enforces reality.
- **Color Coding**: 
  - `IN_PROGRESS`: Green border (`LIVE`).
  - `WARM_UP`: Purple border (`WARM UP`).
  - `PENDING`: Standard card.
  - `REQUIRES_INTERVENTION`: Red.

## 3. The Knockout Rule Enforced
As you requested:
> *Knockout matches shouldn't appear unless the definitive actual player or team to play in the knockout match has been determined.*

I added a strict filter to the **Ready Queue** (Unscheduled Matches). Any match generated for the `KNOCKOUTS` stage is completely hidden from the dispatcher if it contains placeholder teams (e.g., "Pool A Pos 1"). They will only appear in the queue ready to be scheduled *after* pool play calculates the points and definitively resolves those players into real teams!

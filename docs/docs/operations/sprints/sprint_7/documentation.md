# Sprint 7 Documentation

## Objective
Initialize the new `Tournament Director` user role and scaffold the administrative workspace for Sprint 7.

## The 15 Core Functions of the Tournament Delegate

1. **Global System Override**: The ability to manually change any match score or outcome in the event of an officiating error.
2. **Tournament-Wide Suspension**: A "Kill Switch" to halt all matches simultaneously during emergencies (e.g., severe weather).
3. **Bracket/Draw Re-Seeding**: The authority to manually re-seed or adjust brackets mid-tournament.
4. **Audit Log Review**: Full visibility into every action taken by Referees, Marshals, and Hosts to resolve disputes or verify integrity.
5. **Financial & Prize Money Management**: Oversight of prize money distribution and adjustments.
6. **Staff Escalation Resolution**: Serving as the final arbiter when disputes exceed the authority of a Referee or Marshal.
7. **Dynamic Configuration Changes**: Updating core tournament rules (e.g., scoring formats, match durations) while the event is live.
8. **Participant Disqualification/Withdrawal Approval**: Validating and enforcing the removal of players from the tournament.
9. **Sponsor Payout Adjustment**: Managing financial adjustments related to sponsor compliance or visibility.
10. **Official Personnel Appointment**: Final approval for staff assignments if standard procedures fail.
11. **Dispute Mediation (Final Ruling)**: Delivering the binding final decision on questions of "tennis law".
12. **System Health Oversight**: Monitoring the "Pulse" of the system to ensure data integrity across all courts.
13. **Broadcast Feed Quality Control**: Authority to intervene if the Broadcaster’s production value or accuracy fails to meet standards.
14. **Refund & Transaction Reconciliation**: Managing financial disputes regarding entry fees or participant status.
15. **Tournament Closure & Final Archive**: Validating all data for the final tournament report before permanent archiving.

---

## Detailed Implementation: Fleshing Out Core Functions

### Function 1: Global System Override
This is the most sensitive function. It allows the Delegate to correct "Ground Truth" data if a match record becomes corrupted or if there is an undeniable officiating error.

- **UI/UX Implementation**: This feature is hidden behind an "Unlock" icon. When selected, the Delegate must input a mandatory "Reasoning" field.
- **Audit Stamping**: Every override is stamped with the Delegate’s ID and timestamped, creating an immutable record of the change.
- **Cascading Update**: Once the Delegate overrides a score or winner, the system automatically recalculates the status for all downstream matches and pushes the update to the Broadcaster’s overlay and the Host’s dashboard.

### Function 2: Tournament-Wide Suspension ("The Kill Switch")
This is the ultimate emergency function. It is designed to immediately halt operations across the entire facility when safety or technical integrity is compromised.

#### 1. The Trigger Mechanism
- **The Interface**: A prominent, high-contrast, "locked" toggle located at the top-right corner of the Delegate’s dashboard.
- **Activation Requirement**: Uses a **"Slide to Confirm"** interaction to prevent accidental triggering, coupled with a mandatory selection of a pre-set emergency code (e.g., *Weather Event*, *Medical Emergency*, *Technical Failure*, *Civil Disturbance*).
- **System Feedback**: Upon activation, the screen border glows amber/red, and a "Suspension Active" status badge appears on every connected device in the suite.

#### 2. Cascade Effect
Forces the entire ecosystem into a "Safe State":
- **Referee**: Match timer freezes; scoring interface locks; "Pause" screen appears.
- **Court Marshal**: Immediate push notification to proceed to designated court to assist with evacuations or stabilization.
- **Broadcaster**: Live feed automatically overlays a "Temporary Suspension" graphic; feed set to a "Hold" pattern.
- **Player**: Connected apps receive an instant, full-screen notification explaining the reason.
- **Host**: Dashboard switches to "Crisis Management" mode, showing a map of active courts and personnel status.

#### 3. Restoration Procedure
Only the Delegate can "Reschedule" or "Resume" play.
- **Resumption Protocols**: When toggled off, a "Ready-Up" sequence forces every Referee to manually confirm they have re-verified players and court surface before restarting the clock.
- **Integrity Check**: The system logs the exact duration of the suspension, adding it to the match record for statistical reporting.

### Function 3: Bracket/Draw Re-Seeding
This function allows the Delegate to surgically alter the tournament path mid-event. This is typically used if a player withdraws late, a bracket error is discovered, or an emergency forces a change in tournament format.
- **The "Drag-and-Drop" Authority**: The Delegate views the master bracket in a schematic editor. They can swap seeds or move players between slots.
- **The "Integrity Lock"**: The system will highlight potential conflicts (e.g., if a moved player has already played a match against their new opponent).
- **Automated Notification**: Once the Delegate "commits" the new bracket, the system triggers a **Force-Push** notification to all affected players and the Tournament Host, updating their individual schedules instantly.

### Function 4: Emergency Broadcast Messaging (The "PA System")
To ensure transparency during crises, the Delegate has a direct line to every participant via their respective interfaces.
- **Broadcast Modes**:
  - **Urgent Overlay**: A text-based banner that appears across *all* active screens (Referee tablets, Broadcaster monitors, and Player devices).
  - **Audio/Voice Intercom**: If the facility has an integrated PA system, the Delegate can trigger a pre-recorded or live voice announcement.
  - **Push Alert**: A standard notification for non-urgent but important updates (e.g., "Matches moved to Indoor Courts due to rain").
- **Message Templates**: To save time during high-stress moments, the Delegate uses templates (e.g., *"Attention: Please suspend play and head to the clubhouse."*).

#### Integrated Workflow Example (Severe Thunderstorm)
1. **Delegate** hits the **Kill Switch (Function 2)**.
2. The **Emergency Broadcast (Function 4)** automatically sends a "Suspend Play" notification to all screens.
3. The **Delegate** assesses the damage to the schedule and uses **Bracket/Draw Re-Seeding (Function 3)** to condense the schedule (e.g., changing "Best of 5" to "Best of 3" for remaining matches to finish before sunset).


### Function 5: Financial & Prize Money Management
This function transitions the Delegate from the "Court" to the "Office," ensuring the financial integrity of the tournament.
- **The Dashboard**: A dedicated ledger tab that tracks entry fees, fine deductions (e.g., code violations), and final prize pool payouts.
- **Payout Triggers**: The Delegate can "Unlock" payout workflows only once the Tournament Host has verified completion of the final matches.
- **Adjustment Logic**: If a player is disqualified mid-tournament, the Delegate has the authority to adjust their payout (or forfeit it) based on official tournament policy, with the change automatically reflected in the financial report.

### Function 6: Staff Escalation & Dispute Mediation
This is where the Delegate acts as the **"Final Arbiter."**
- **The Dispute Queue**: When a Referee or Court Marshal marks a situation as "Escalated," it hits the Delegate’s dashboard as a high-priority alert.
- **Mediation Interface**: The Delegate can open a direct, private communication channel with the Referee on-court to get a "ground truth" debrief.
- **Final Ruling**: Once a decision is made, the Delegate submits the ruling. The system archives the entire conversation (the "dispute log") and pushes the outcome to the scoreboard and the affected players' devices.

### Function 7: Dynamic Configuration Changes
This gives the Delegate "Live Tweaking" powers to keep the tournament moving.
- **What can be changed?**
  - **Scoring Formats**: Switching from Advantage scoring to No-Ad scoring if the tournament is behind schedule.
  - **Tie-break Rules**: Shortening or lengthening tie-break requirements.
  - **Match Duration**: Adjusting how many sets are played (e.g., dropping from 5-set to 3-set matches).
- **Safety Gate**: Any configuration change triggers a "Global Sync," where all active scoreboards and broadcast overlays are instantly updated with the new rule set, preventing confusion for players and viewers.

### Function 8: Participant Disqualification/Withdrawal Approval
The Delegate serves as the formal "executioner" for rule-based removals, ensuring a Referee cannot unilaterally remove a high-profile player without a double-check by the Tournament authority.

### Function 9: Sponsor Payout Adjustment
Tracks "Visibility Metrics." If a sponsor's logo feed goes down due to a glitch, the Delegate flags this in the financial ledger to adjust billing or contract fulfillment post-tournament.

### Function 10: Official Personnel Appointment
If a scheduled Referee or Marshal is unavailable, the Delegate can swap staff in the system, immediately granting them access permissions for their new assigned courts.

### Function 11: Dispute Mediation (Final Ruling)
Beyond the initial conflict, this acts as the "Court of Appeals." The Delegate’s decision is logged as "Final," locking the match state and preventing further automated disputes.

### Function 12: System Health Oversight
A live "Dashboard of Dashboards." The Delegate monitors network latency, battery levels on Referee tablets, and sensor reliability. If a sensor fails, they can initiate a "Manual Mode" for that court.

### Function 13: Broadcast Feed Quality Control
Monitors feed "cleanliness." If the Broadcaster fails to provide required telemetry (e.g., speed gun data), the Delegate can issue a "Quality Alert" to the production lead.

### Function 14: Refund & Transaction Reconciliation
Manages the "User Ledger." If an event is canceled due to weather, this function triggers the automated refund distribution process to all ticket holders or participants.

### Function 15: Tournament Closure & Final Archive
The "Golden Seal." This is the final step where the Delegate locks the database, generates the official tournament report, and pushes the data to the permanent historical archive.

#### Summary of the "God-Mode" Operational Scope
| Category | Functions Involved |
| --- | --- |
| **Emergency Control** | 2, 8, 12, 13 |
| **Logic & Authority** | 1, 3, 6, 7, 11 |
| **Administrative/Financial** | 4, 5, 9, 10, 14, 15 |

## UI/UX Requirements: The "God-Mode" Dashboard
To support these high-consequence actions, the interface must prioritize visibility and safeguard against accidental input:
- **The "Kill Switch"**: A prominent, high-stakes button to trigger broadcast-wide alerts (e.g., "Tournament Suspended").
- **Audit Trail View**: A master log providing a transparent view of all system actions for resolving disputes.
- **Recursive Settings Access**: Ability to edit any Tournament Factory configuration even while the event is live.
- **Safety Features**:
  - **Confirmation-Heavy Flows**: Every override action requires secondary confirmation and a mandatory "reasoning" input.
  - **Visual Warning**: High-contrast, red/orange accents signify permanent, system-wide consequences.
  - **System Hierarchy**: UI resembles the Host dashboard but includes "Unlock" icons indicating full editability.

### Strategic Layout Strategy: The "Unified Context"
To keep the experience consistent across Tablet and Desktop, we will use a Responsive Framework rather than separate apps.

#### 1. Desktop Primary (The "Command Center")
- **Purpose**: Strategic oversight, long-form data entry, and multi-feed monitoring.
- **Layout**:
  - **Side-Rail Navigation**: Always-visible "Global States" (e.g., Total System Status, Active Alerts count).
  - **Main Workspace**: A "tiled" grid allowing the Delegate to pin specific views (e.g., Live Scoreboard, Emergency Broadcast, Audit Log) simultaneously.
  - **Secondary Monitor Support**: Designed to allow the "Live Feed" (from the Broadcaster) to be detached to a second screen.

#### 2. Tablet Native (The "Floor Walker")
- **Purpose**: Rapid response, physical movement around the facility, and direct intervention.
- **Layout**:
  - **Adaptive HUD**: The Desktop grid collapses into a "Tabbed" view or a vertical stack.
  - **Touch-Optimized**: High-flick targets for buttons (e.g., the "Kill Switch" requires a deliberate swipe-to-commit).
  - **Contextual Awareness**: Uses location/proximity logic—if the Delegate walks near a specific court, the Tablet detects this and auto-prioritizes the feed/info for that match.

#### 3. Phase 3: The "Mobile Later" Strategy
Mobile implementation will be restricted to **Read-Only / Alert-Only** mode:
- **Alerts**: Push notifications for crises or escalations.
- **Read-Only**: Checking high-level status (e.g., "Is the tournament paused?").
- **Action Restriction**: Mobile app will *not* allow "Kill Switch" or "Bracket Changes" to prevent dangerous accidental inputs.

## Operational Logic & Backend APIs
The Delegate’s interface prevents "feature bloat" while offering total control. The "Audit Trail" ensures accountability and time-stamped verification whenever a Delegate intervenes.

### Database Schema Changes
- Modified `AuditLog` in Prisma to make `matchId` optional (`String?`).
- Added `tournamentId` (`String?`) to track global/tournament-wide suspensions and setting overrides.

### Core Backend Endpoints
- `POST /api/director/killswitch`: Receives a mandatory `reason`, wraps a database transaction that sets all active matches to `REQUIRES_INTERVENTION`, and writes a global `AuditLog`.
- `GET /api/director/audit`: Fetches the latest 100 `AuditLog` entries for the Master Log view.

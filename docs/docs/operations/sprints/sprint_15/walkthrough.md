# Sprint 15 Complete: Sandbox Host Workflow

We have successfully translated the new abstract Host Workflow from your notes directly into a state-driven Sandbox prototype. This allows you to click through the entire lifecycle of a tournament seamlessly before we wire up the live backend routes.

## What's Included

### 1. Global Host Dashboard (`/sandbox/host`)
- **Tournament List:** Lists all tournaments managed by the Host.
- **Priority Views:** Toggle between "Priority (Active & Upcoming)" and "View All" (with dropdown status filtering).
- **Provisioning:** Use the `+ Provision New Tournament` button to instantly spin up a new tournament instance.
- **Data Persistence:** Uses `localStorage` via a custom `useSandboxState` hook so that if you refresh the page or navigate back, your created tournaments and their progress states are perfectly preserved.

### 2. Specific Tournament Management (`/sandbox/host/tournament/[id]`)
Clicking on a tournament card routes you into its management instance. This is broken down into three main tabs: `Pre-Tournament`, `During Tournament`, and `Post-Tournament`.

#### Pre-Tournament Checklist
> **Note:** The Pre-Tournament stage forces strict chronological progression. You cannot access Stage 4 (Match Scheduling) until Stage 3 (Pool Manager) is completed.

- **Stage 1 - Launch:** Confirm details, assign staff (Referees/Marshalls), and officially "Launch" the event.
- **Stage 2 - Registration:** Access Magic links, CSV imports, and registration counters. Toggle the phase to `CLOSED` to lock out early entries.
- **Stage 3 - Pool Manager:** Opens once registrations close. Contains mock Serpentine auto-generation, manual pool additions, and the "Publish Pools" action. Includes a mock **Collaboration Log** demonstrating chat between Host and Referee.
- **Stage 4 - Match Scheduling:** Opens once pools are published. Features a simplified **CSS Grid Calendar** mockup for court assignments, alongside the standard list views. Once satisfied, hit "Publish Schedule & Start Event".

#### During Tournament (Live Radar)
> **Warning:** This tab displays a "Not Active" warning state until you publish the schedule in Stage 4 of the Pre-Tournament checklist.

- **Live Progression:** Displays active courts, current match scores, and elapsed time.
- **Completion Stats:** Visual progress bar tracking pool match completion (e.g. 65% done).
- **Action Center:** Force-complete the tournament, pause operations, or unlock the Knockout Stage once pool matches are finalized.
- **Activity Log:** A live feed of Umpire and Referee actions around the venue.

#### Post-Tournament (Archival & Reports)
> **Note:** You must click "Force Complete Tournament" in the During-Tournament tab to unlock these post-event activities.

- **Reviews & Reports:** Access the Final Standings Report and the Incident & Dispute Log.
- **Surveys & Feedback:** Generate survey links and view the participant feedback dashboard.
- **Data Export:** Export the entire tournament dataset as CSV or PDF.
- **Archival:** Archiving a tournament locks it into a strict **read-only** state. No further modifications can be made, and it receives an `ARCHIVED` status badge globally.

## Verification Checklist
- [x] Global Dashboard filters and routes correctly.
- [x] State persists across browser refreshes via `localStorage`.
- [x] Pre-Tournament checklist enforces sequential unlocking.
- [x] Calendar mockup, collaboration logs, and live radar correctly implemented in their respective stages.

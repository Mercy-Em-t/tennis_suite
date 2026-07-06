# Sprint 4: Host Operational Workflow

This document serves as the finalized master blueprint of the Host Operational Workflow implemented during Sprint 4. The Tennis Suite platform now provides a seamless, elite-tier digital environment for hosting, organizing, and managing sports tournaments from onboarding to final results.

## 1. Authentication & Onboarding (The Gateway)

* **Access Control:** The system requires distinct routing for new and returning hosts.
* **New Hosts:** Must complete the "Tournament Factory" wizard before accessing the dashboard.
* **Returning Hosts:** Redirected to the Host Dashboard upon login.
* **Middleware Enforcement:** Users with an `ONBOARDING_IN_PROGRESS` status are restricted from accessing `/admin` routes until the factory process is finalized.

## 2. The "Tournament Factory" Wizard

A high-intent, 4-step wizard to provision tournament infrastructure.

1. **Identity:** Name, Start/End Date, Location.
2. **Structure:** Tournament categories (singles, doubles), Tournament Type (Round-Robin/Elimination), Match Duration, Scoring Rules.
3. **Infrastructure:** Court Count, Names, and Surface Type.
    * *UX Rule:* Immediate "Simultaneous Match Capacity" preview shown to the host.
4. **Branding:** Logo/Sponsor URL upload.
    * *UX Rule:* Automatic placeholder generation to prevent "dead ends." Can be updated later in tournament settings.

## 3. Host Dashboard (Command Center)

* **Visual Format:** Card-based grid displaying high-level tournament metadata (Active, Upcoming, Past).
* **Registration Management:**
    * Toggle switch for `OPEN`/`CLOSED` registration status with configurable deadlines.
    * Auto-generation of unique Registration Links.
    * Allows appending late registrants to existing pools after the main deadline, triggering a `PoolVersionID` increment.

## 4. Pool & Match Intelligence

* **Pool Generation:**
    * Manual drag-and-drop seeding and pool arrangement.
    * Generated pools are exportable and locked prior to Match generation.
* **Match Dispatcher (Court Queues):**
    * Visual drag-and-drop grid for assigning matches to specific courts (Order of Play).
    * **Conflict Resolution:** System flags scheduling overlaps (e.g., assigning a match to an occupied court) rather than failing silently. Court Queues replace static time slots to accommodate variable match lengths.

## 5. The Progression Engine

* **State Machine:** Automated transition from `Pool Stage` → `Knockouts`.
* **Dynamic Bracket Injection:** Once a Pool is locked, the top 2 players are dynamically injected into their Knockout placeholders, and match statuses transition from `PENDING` to `SCHEDULED`.
* **Dependency Aware:** Knockout bracket is treated as a "dependent state machine." When a player is removed, the state propagates upstream.

## 6. Exception Management (Assisted Override Protocol)

* **Withdrawal Protocol:** The system handles withdrawals by pausing the match (`REQUIRES_INTERVENTION`) and disabling automated progression. No abandoning matches halfway without a good reason.
* **Intelligent Recommendation Engine:** Analyzes pool data (win-rate, seed) to identify the mathematically optimal replacement.
* **UI/UX:** Displays a "Recommended Replacement" card with an "Approve Replacement" button, while hiding other candidates behind an "Explore Alternatives" toggle to ensure neutrality without stripping Host authority.

## 7. Staffing & Role Delegation

* **Role-Based Access Control (RBAC):** Default roles include `Referee`, `Court Marshall`, and `Tournament Admin`.
* **Dual Acquisition Strategy:**
    * **Public Applications:** "Magic Link" allowing the community to apply for staff roles, placing them in a "Pending" queue for Host approval.
    * **Direct Assignment:** Instant bypass of the application process via email.
* **Dispatcher Integration:** Allows drag-and-drop or dropdown assignment of `APPROVED` staff to specific Courts.
* **Scoring Protection:** The scoring API verifies the specific `RefereeID` assigned to the `Court` where the match is taking place. Unauthorized attempts are rejected (`403 Forbidden`) and logged.

## 8. Non-Functional Requirements & Security

* **Audit Logging:** All manual overrides, score changes, and substitutions are recorded in a permanent audit log, linked to the exact UserID.
* **Usability:** Dark-mode glassmorphism aesthetic for an elite, professional feel.
* **Session Integrity:** Assigned staff permissions are tied to their unique user accounts and actively validated on every API request.
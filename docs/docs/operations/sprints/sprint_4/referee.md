# Referee Module & Staff Onboarding Documentation

This document outlines the architecture, workflows, and implementation details for the **Staff Application & Onboarding System** and the **Referee Scoring Module**, built to empower tournament officials with offline-capable tools and granular access control.

## 1. Staff Application & Onboarding System

The onboarding system shifts the burden of finding staff off the Host by enabling a community-driven application process using "Magic Links."

### Workflow
1. **Magic Link Generation:** In the Host Command Center (under "Role Delegation"), a public `Magic Invite Link` is generated for the tournament (e.g., `/tournaments/[id]/apply`).
2. **Public Application:** Users navigating to this link are presented with a streamlined application page. If unauthenticated, they are redirected to login and automatically brought back. They apply for roles like `REFEREE` or `MARSHALL`.
3. **Pending Queue:** Applications are logged in the `Staff` table with a `PENDING` status.
4. **Host Approval:** The Host reviews the "Pending Applications" queue in the Command Center. Clicking "Approve" fires a `PATCH` to `/api/tournaments/[id]/staff`, transitioning the user's status to `APPROVED`.
5. **Direct Assignment Bypass:** Hosts retain the ability to forcefully assign a role by directly entering an existing user's email address.

### Security
- The Application API ensures users cannot apply twice for the same tournament.
- The Status Update API strictly validates that the approving party is a Global `HOST` or `ADMIN`.

## 2. Role-Based Access Control (RBAC) Refactor

To allow Referees to manage tournaments without granting them destructive global permissions, we implemented a centralized middleware wrapper.

### `requireTournamentAccess` Middleware
This function replaces the rigid `requireAuth(['HOST'])` checks for operational tasks.
- **How it Works:** It verifies the user's global session token, then queries the `Staff` table to see if the user has an `APPROVED` role for that specific `tournamentId`.
- **Powers Granted to Referees:** Referees can now securely invoke APIs to:
  - Generate Knockout Brackets.
  - Auto-Dispatch matches to idle courts.
  - Forcefully override matches or swap teams.
  - Score any active match in the tournament.
- **Powers Denied:** Referees are actively blocked (`403 Forbidden`) from altering tournament metadata, withdrawing teams permanently, or approving other staff.

## 3. The Referee Module (PWA)

The Referee Module is an offline-capable Progressive Web App (PWA) designed for courtside operation in environments with unstable internet.

### The Referee Hub (`/referee`)
- Displays all tournaments the user is actively assigned to.
- Provides a bridge to the Host Command Center via an "Open Command Center" button, seamlessly allowing Referees to view the macro-state of the event.

### The Scoring Arena (`/referee/matches/[tournamentId]/[matchId]`)
- A highly visible, distraction-free scoring interface tailored for mobile devices.
- Referees increment scores, which are optimisticly updated on the UI and pushed to the API (`/api/tournaments/[id]/matches/[matchId]/score`).

### Offline Sync Engine
To combat dropped connections at sports venues, the Scoring Arena utilizes a custom hook (`useOfflineQueue`).
1. **Queueing:** If a score update fails due to network loss, the mutation is serialized and stored in `localStorage` under `offlineScoreQueue`.
2. **Reconnection:** The application listens for the browser's `'online'` event.
3. **Synchronization:** Upon reconnection, the queue is processed sequentially, hitting the dedicated `/api/sync/offline` endpoint.
4. **Resolution:** The UI alerts the Referee that scores have been successfully synchronized with the main server.

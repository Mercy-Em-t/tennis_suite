# Sprint 4: Landing Page V2, Routing Matrix, and Auth Integration

## Overview
Sprint 4 focused on completely overhauling the public-facing landing experience, refining the platform routing matrix, and integrating the live authentication and registration endpoints directly into the frontend. Additionally, this sprint heavily addressed the **Host Operational Workflow**, **Staff Onboarding**, and the **Referee Scoring Module** to provide an elite-tier digital environment for tournament management.

## Key Accomplishments

### 1. Landing Page Reconstruction (V2 to V1)
- **New Live Landing Page**: Successfully migrated the futuristic `landing-v2` layout to the root `/` path, officially making it the primary entry point for the Tennis Suite application.
- **Legacy Backup**: The previous `page.tsx` was gracefully downgraded to `page.backup.tsx` to maintain a safe fallback point if needed.
- **Visual Aesthetic**: Retained all framer-motion animations, the deep space theme (`#0d1117`), and the glowing accent elements.

### 2. Navigation & Routing Matrix Alignment
- **Separation of Concerns**: Clarified the crucial difference between "System Registration" (creating an Organizer/Host account) and "Tournament Registration" (a Player joining a specific tournament).
- **Host Onboarding Placeholder**: Created the `/host-onboarding` route. All "Host a Tournament" or "Start Hosting Today" buttons across the Navbar, Hero, Bottom CTA, and Footer now properly point to this dedicated flow.
- **Broadcast Placeholder**: Created a sleek modal placeholder for the "Watch Live Broadcast" action to prevent routing errors while the cinematic `/broadcast` page is still under development.
- **Global Path Updates**: Updated all internal `router.push('/landing-v2')` calls to `router.push('/')` across the About, Contact, and Roles pages.

### 3. Tournament Registration & Backend Integration
- **In-Place Modal Registration**: Replaced the static "Register for Tournament" button with a highly immersive, blurred overlay modal.
- **Form Implementation**: Built a functional React form requesting `Full Name`, `Email Address`, `Password`, and `Franchise Name`.
- **Backend Auth Piping**: Wired the modal to send `POST` requests directly to `/api/auth/register`. 
- **User Creation & Redirection**: Upon successful authentication and creation of the `PLAYER` role, the system automatically redirects the user to the `/team` dashboard or the checkout flow.

### 4. About Us & Contact Pages
- **Mission Alignment**: Created an `/about` page tightly focused on empowering the next generation of sports organizers with elite, automated technology.
- **Minimalist Contact Flow**: Created a `/contact` page with a clean form that hits the newly created `/api/contact` endpoint, avoiding raw email exposure and preparing the system to pipe data to an internal notification service.

### 5. Staff Application & Onboarding System
- **Magic Link Generation:** The Host Command Center now dynamically generates "Magic Invite Links" (e.g., `/tournaments/[id]/apply`) that the host can distribute.
- **Public Application Portal:** A dedicated page where users can apply for roles like `REFEREE` or `MARSHALL`. If unauthenticated, it automatically redirects to login and back.
- **Approval Workflow:** Hosts manage a "Pending Applications" queue and can approve staff with one click, officially granting them RBAC authority within the tournament. 
- **Direct Assignment Bypass:** Hosts can bypass the application process by directly entering a user's email address to assign them a role.

### 6. Referee Module & RBAC Refactoring
- **Centralized Middleware (`requireTournamentAccess`):** Replaced static role checks with dynamic, tournament-level access control. Referees are actively authorized to generate draws, auto-dispatch matches, and execute overrides, while being securely blocked from withdrawing teams or altering tournament metadata.
- **The Scoring Arena (PWA):** A dedicated, mobile-optimized interface (`/referee/matches/[tournamentId]/[matchId]`) for courtside scoring.
- **Offline Sync Engine:** Implemented a robust `useOfflineQueue` hook. When the network drops, scores are serialized locally. Upon browser `'online'` events, the system automatically synchronizes the payload via `/api/sync/offline` and updates the central database.
- **Host-Referee Bridge:** Added "Open Command Center" links within the Referee Hub so officials can easily drop into the macro-view of the tournament without manual URL entry.

## Next Steps
- Expand the `/broadcast` cinematic telemetry UI.
- Finalize the `/checkout` integration for franchise registration fees.
- **Sprint 5**: Begin building the public-facing spectator portal (Interactive Bracket, Standings) and Global Leaderboards.

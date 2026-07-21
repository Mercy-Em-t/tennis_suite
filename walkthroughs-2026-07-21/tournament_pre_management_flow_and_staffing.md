# Walkthrough: Tournament Pre-Management Flow & Staffing

I have successfully implemented the "Hard Lock" and established the boundaries for staffing as we discussed!

## Changes Made

### 1. The Setup Required Hard Lock (Tournament Hub)
The Tournament Hub (`/app/dashboards/tournaments/[id]`) now evaluates if the `isSetupComplete` condition is met. Specifically, it checks if `startDate`, `endDate`, `location`, and `contactEmail` are present. 
- If a host clicks "Manage" on a newly created tournament, they will be greeted with a blurred overlay blocking the Pre-Tournament tools, with a giant **"Complete Tournament Settings"** button. This forces them to set up the basic parameters properly first.

### 2. Dual Staffing Boundaries
I updated the Registration Stage (Stage 2) in the `PreTournamentView` to introduce the **Post-Launch Staffing Boundary**:
- **Pre-Launch**: Hosts can still use the "Manage Staff Directory" button in Stage 1 to manually invite referees/marshals via email.
- **Post-Launch**: A new **"Call for Staff"** magic link section was added directly next to the player Magic Link in Stage 2. 
- The "Call for Staff" link remains completely disabled until the tournament is officially launched.

### 3. API Consistency 
I verified that the backend endpoint (`/api/tournaments/[id]/launch`) was already mirroring the exact same requirements (dates, location, email), which means our UI lock is mathematically identical to the backend API lock. It will securely prevent any premature launches. 
I also updated the simulated "Launch Dispatch Email" inside the API so that it includes the correct `/apply-staff` link instead of the wrong legacy route.

## Verification
- Verified the `PreTournamentView` renders the `staffLink` properly.
- Verified the `isSetupComplete` lock covers the entire `PreTournamentView` rendering logic.
- Verified the Launch API correctly rejects requests missing mandatory fields.

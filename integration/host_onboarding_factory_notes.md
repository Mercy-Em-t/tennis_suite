# Sprint Complete: Host Onboarding & Factory Initialization

The Tournament Factory initialization pipeline has been built out, ensuring atomic row generation when a Host sets up their first Club!

## What was Accomplished

### 1. Unified Frontend State Machine
I built the Client-side React component at `src/app/app/onboarding/page.tsx`. This replaces the dummy modal logic. It features:
- **Phase 01:** Org Provisioning (captures the club/org name).
- **Phase 02:** Financial Ledger Setup (hooks into the `/api/onboarding/stripe-link` to begin the payout connect loop).
- **Phase 03:** Infrastructure Grid Mapping (captures physical court specs).
- **Phase 04:** Syncing (locks the UI while sending the data payload to the backend engine).

### 2. Atomic Factory Engine (`/api/onboarding/initialize-factory`)
The transaction engine has been built natively using the `Club` schema layout you currently have in Prisma. When the API fires, it executes a single `$transaction`:
1. It provisions the root `Club` container.
2. It generates the inaugural `Tournament` record bound to that Club and the Host.
3. It iterates and injects the requested number of `Court` rows, pre-linked to the active Tournament.
*(If any of these inserts fail, the database safely rolls back, preventing dangling entities!)*

### 3. JWT Session Rehydration
To avoid the clunky `/api/auth/token-swap` call (which requires the `Staff` table and is meant for runtime role switching), the factory API itself organically re-signs your session JWT. It injects the fresh `organizationId`, `activeTournamentId`, and `hasClub: true` flags directly into the edge cookie. When the frontend gets a `200 OK`, it simply calls `router.push('/app/dashboards/host')` and the edge proxy waves them through immediately!

## How to Verify
1. Register a completely new Host account at `app.yourdomain.com/host-onboarding`.
2. Login. The Central Sorting engine will detect that `hasClub` is false and push you into the new Onboarding Wizard!
3. Fill out the mock parameters and hit "Provision Tournament Factory". 
4. Check your database, or just watch the client seamlessly redirect into your Host Dashboard as your JWT permissions instantly upgrade.

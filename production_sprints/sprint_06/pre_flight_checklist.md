# Sprint 6 Pre-Flight Checklist: "Purely Doubles Inaugural"

This document outlines the final operational runway and environmental checklists required before launching the first live Tennissuite event.

## 1. Environment Secrets Rotation & Production Promotion

- [ ] **Database Mirror Check:** Promote local SQLite/Prisma development schema to production-grade cloud PostgreSQL (e.g., Supabase).
  - [ ] Run query analyzer scripts to verify indexes on `tournamentId`, `courtId`, and `matchStatus` are compiled cleanly for concurrent connections.
- [ ] **Secret Asset Cycling:** Access Vercel edge deployment engine and swap development keys with cryptographically signed production strings:
  - [ ] Stripe live production webhook signing signatures (`Stripe-Signature`).
  - [ ] JWT session encryption tokens (enforcing passwordless/OTP auth states).
  - [ ] Remote Terraform cloud state-locking configurations to protect against concurrent code drops.

## 2. The Physical Infrastructure Setup ("The On-Site Hook")

- [ ] **The Referee / Device Lock Protocol:** Verify on-site physical devices used by Referees and Court Marshals have their local PWA outbox cache (IndexedDB) primed.
- [ ] **The Broadcaster OBS / vMix Stencil Binding:**
  - [ ] Map video director encoders (OBS Studio/vMix) to reactive overlay endpoints (`/api/broadcast/highlights/latest`).
  - [ ] Run graphics validation checks ensuring real-time match events update CSS/HTML scorebug overlay via SSE under <200ms latency.
  - [ ] Confirm sponsor adintro/outro banner wrappers inject cleanly onto the video stream canvas on breakpoints/set-winning states.

## 3. The "Purely Doubles Inaugural" Dry Run

- [ ] **The Offline-First Stress Test (Pre-Flight Break-Glass Exercise):**
  - [ ] Load Referee interface, begin scoring, trigger total network disconnect.
  - [ ] Verify PWA local caching mechanism safely holds point variations without losing operational states.
  - [ ] Reconnect network and verify client engine drains data queue chronologically back to PostgreSQL using `offlineVersion` checks without state collisions.
- [ ] **God-Mode Override Verification:**
  - [ ] Trigger mock scoring conflict on court.
  - [ ] Tournament Delegate opens Match Monitor Panel, hits secure data unlock toggle, and executes admin score override.
  - [ ] Verify platform blocks mutation until Delegate inputs mandatory text explanation.
  - [ ] Confirm finalized action instantly outputs a timestamped log to the permanent, unalterable ledger stream alongside user session context.

## 4. Launch Order Checklists (Tournament Morning)

- [ ] **1. Deploy the Edge Layer:** Run `terraform apply` to lock down production load-balancer and edge-network path parameters.
- [ ] **2. Open the Storefront:** Flip main app routing rules to let dynamic custom subdomains (`app.tennissuite.com`) accept live traffic.
- [ ] **3. Initialize Inbound Flow:** Open public registration gateway, monitor payment transactions in Stripe Dashboard, and watch the system engine run autonomously.

# "Purely Doubles Inaugural" Launch Checklist

This document serves as the final operational runway to execute before opening the dynamic storefront gates for the first live Tennissuite event.

## 1. Environment Secrets Rotation & Production Promotion

- [ ] **Database Mirror Check:** Promote local SQLite/Prisma development schema to production-grade cloud PostgreSQL instances (e.g., Supabase). Run query analyzer scripts to verify that indexes on `tournamentId`, `courtId`, and `matchStatus` compile cleanly to process concurrent connections.
- [ ] **Secret Asset Cycling:** Access Vercel edge deployment engine and swap out development keys for live, cryptographically signed production strings:
  - [ ] Stripe live production webhook signing signatures (`Stripe-Signature`).
  - [ ] JWT session encryption tokens.
  - [ ] Remote Terraform cloud state-locking configurations.

## 2. The Physical Infrastructure Setup ("The On-Site Hook")

- [ ] **The Referee / Device Lock Protocol:** Verify that on-site physical devices used by Referees and Court Marshals have their local PWA outbox cache (IndexedDB) primed.
- [ ] **The Broadcaster OBS / vMix Stencil Binding:** Map encoders (OBS Studio) to the reactive overlay endpoints (`/api/broadcast/highlights/latest`).
  - [ ] Run graphics validation checks for real-time match events updating the CSS/HTML scorebug overlay via SSE (<200ms latency envelope).
  - [ ] Confirm sponsor adintro/outro banner wrappers inject cleanly onto the video stream canvas when a breakpoint or set-winning state occurs.

## 3. The "Purely Doubles Inaugural" Dry Run

- [ ] **The Offline-First Stress Test (Simulated Wi-Fi Drop-out):**
  - [ ] Instruct a test user to load the Referee interface, begin scoring, and intentionally trigger a total network disconnect.
  - [ ] Verify PWA local caching mechanisms hold point variations safely without losing states.
  - [ ] Verify upon reconnecting, the client engine accurately "drains" the data queue chronologically back to PostgreSQL using `offlineVersion` checks without state collisions.
- [ ] **God-Mode Override Verification:**
  - [ ] Trigger a mock scoring conflict on court.
  - [ ] Tournament Delegate pulls up the central Match Monitor Panel, hits secure data unlock toggle, and executes administrative score override.
  - [ ] Verify platform blocks mutation until a mandatory text explanation is provided.
  - [ ] Confirm finalized action instantly outputs a timestamped log to the permanent ledger stream alongside the user's session context.

## 🚀 Launch Order

Once the above vectors pass verification, execute the following sequence on tournament morning:

1. [ ] **Deploy the Edge Layer:** Run `terraform apply` to lock down production load-balancer and edge-network path parameters.
2. [ ] **Open the Storefront:** Flip main app routing rules to let dynamic custom subdomains (`app.tennissuite.com`) accept live traffic.
3. [ ] **Initialize Inbound Flow:** Open the public registration gateway, monitor payment transactions in Stripe Dashboard, and watch the system engine run autonomously.

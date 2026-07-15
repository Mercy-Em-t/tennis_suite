# Sprint 6 Tasklist: "Purely Doubles Inaugural" Pre-flight Checklist

## 1. Environment Secrets Rotation & Production Promotion

- [ ] **Database Mirror Check:** Promote local SQLite/Prisma development schema to production-grade cloud PostgreSQL (e.g., Supabase).
- [ ] **Query Analyzer:** Verify that indexes on `tournamentId`, `courtId`, and `matchStatus` are compiled cleanly to process concurrent connections effortlessly.
- [ ] **Secret Asset Cycling:** Access Vercel edge deployment engine and swap out all development keys with cryptographically signed production strings.
  - [ ] Stripe live production webhook signing signatures (`Stripe-Signature`).
  - [ ] JWT session encryption tokens (enforcing rigid passwordless/OTP authentication states).
  - [ ] Remote Terraform cloud state-locking configurations to protect against concurrent code drops.

## 2. The Physical Infrastructure Setup ("The On-Site Hook")

- [ ] **The Referee / Device Lock Protocol:** Verify that on-site physical devices being used by Referees and Court Marshals have their local PWA outbox cache (IndexedDB) primed.
- [ ] **The Broadcaster OBS / vMix Stencil Binding:** Map encoders (OBS Studio) to the reactive overlay endpoints (`/api/broadcast/highlights/latest`).
- [ ] **Graphics Validation Checks:** Ensure real-time match events update the CSS/HTML scorebug overlay automatically via server-sent events (SSE) underneath the target <200ms latency envelope.
- [ ] **Sponsor Ads Injection:** Confirm that sponsor adintro/outro banner wrappers inject cleanly onto the video stream canvas when a breakpoint or set-winning state occurs.

## 3. The "Purely Doubles Inaugural" Dry Run

- [ ] **The Offline-First Stress Test:**
  - [ ] Instruct a test user to load the Referee interface and begin scoring a match.
  - [ ] Intentionally trigger a total network disconnect.
  - [ ] Prove that the PWA local caching mechanisms hold the point variations safely without losing operational states.
  - [ ] Prove that upon reconnecting, the client engine accurately "drains" the data queue chronologically back to the PostgreSQL database fortress using `offlineVersion` checks without causing state collisions.
- [ ] **God-Mode Override Verification:**
  - [ ] Trigger a mock scoring conflict on court.
  - [ ] Have a designated Tournament Delegate pull up the central Match Monitor Panel, hit the secure data unlock toggle, and execute an administrative score override.
  - [ ] Verify that the platform blocks the mutation until the Delegate inputs a mandatory text explanation.
  - [ ] Confirm that the finalized action instantly outputs a timestamped log to the permanent, unalterable ledger stream alongside the user's session context.

## 🚀 Launch Order Checklists

- [ ] **Deploy the Edge Layer:** Run `terraform apply` to lock down production load-balancer and edge-network path parameters.
- [ ] **Open the Storefront:** Flip the main app routing rules to let dynamic custom subdomains (`app.tennissuite.com`) accept live traffic.
- [ ] **Initialize Inbound Flow:** Open the public registration gateway, monitor the payment transactions in the Stripe Dashboard, and watch the system engine run autonomously.

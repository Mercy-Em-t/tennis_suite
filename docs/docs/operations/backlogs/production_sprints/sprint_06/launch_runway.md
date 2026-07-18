# The "Purely Doubles Inaugural" - Final Operational Runway

To cross the finish line between the stabilized codebase and launching the first live **Tennissuite** event, the following highly specific environmental and physical checklists must be cleared.

## 1. Environment Secrets Rotation & Production Promotion

Before routing live transactions, data layers must be shifted from sandbox/local mode to the hardened enterprise edge.

- [ ] **Database Mirror Check**: Promote local SQLite/Prisma development schema to production-grade cloud PostgreSQL instances (e.g., Supabase). 
  - *Validation*: Run query analyzer scripts to verify that indexes on `tournamentId`, `courtId`, and `matchStatus` are compiled cleanly to process concurrent connections effortlessly.
- [ ] **Secret Asset Cycling**: Access Vercel edge deployment engine and swap out all development keys. Replace them with live, cryptographically signed production strings for:
  - [ ] Stripe live production webhook signing signatures (`Stripe-Signature`).
  - [ ] JWT session encryption tokens (enforcing rigid passwordless/OTP authentication states).
  - [ ] Remote Terraform cloud state-locking configurations to protect against concurrent code drops.

## 2. The Physical Infrastructure Setup ("The On-Site Hook")

Structural dress rehearsals must be run at the physical venue.

- [ ] **The Referee / Device Lock Protocol**: Verify that the on-site physical devices being used by Referees and Court Marshals have their local PWA outbox cache (IndexedDB) primed.
- [ ] **The Broadcaster OBS / vMix Stencil Binding**:
  - [ ] Video director maps their encoders (like OBS Studio) to the reactive overlay endpoints (`/api/broadcast/highlights/latest`).
  - [ ] Run graphics validation checks to ensure real-time match events update the CSS/HTML scorebug overlay automatically via server-sent events (SSE) under the **<200ms latency envelope**.
  - [ ] Confirm that sponsor adintro/outro banner wrappers inject cleanly onto the video stream canvas when a breakpoint or set-winning state occurs.

## 3. The "Purely Doubles Inaugural" Dry Run

Staff agents must execute a simulated **Pre-Flight "Break-Glass" Exercise** before opening public lead ingestion and dynamic registrations.

### Offline-First Stress Test
```text
[Simulated Wi-Fi Drop-out] ──► [Referee Enters Score] ──► [Cached locally in IndexedDB]
                                                                    │
                                                                    ▼
[Broadcaster Overlay Frozen] ◄── [Server Sync Restored] ◄── [Outbox Drains via chronological offlineVersion]
```
- [ ] Instruct a test user to load the Referee interface, begin scoring a match, and intentionally trigger a total network disconnect.
- [ ] **Validation 1**: Proves that the PWA local caching mechanisms hold the point variations safely without losing operational states.
- [ ] **Validation 2**: Proves that upon reconnecting, the client engine accurately "drains" the data queue chronologically back to the PostgreSQL database fortress using `offlineVersion` checks without causing state collisions.

### God-Mode Override Verification
- [ ] Trigger a mock scoring conflict on court. 
- [ ] Have a designated Tournament Delegate pull up the central Match Monitor Panel, hit the secure data unlock toggle, and execute an administrative score override.
- [ ] **Validation**: Verify that the platform blocks the mutation until the Delegate inputs a mandatory text explanation. Confirm that the finalized action instantly outputs a timestamped log to the permanent, unalterable ledger stream alongside the user's session context.

## 🚀 Launch Order Checklists

Execute the following sequence on tournament morning:

- [ ] **1. Deploy the Edge Layer**: Run `terraform apply` to lock down production load-balancer and edge-network path parameters.
- [ ] **2. Open the Storefront**: Flip the main app routing rules to let dynamic custom subdomains (`app.tennissuite.com`) accept live traffic.
- [ ] **3. Initialize Inbound Flow**: Open the public registration gateway, monitor the payment transactions in the Stripe Dashboard, and watch the system engine run autonomously.

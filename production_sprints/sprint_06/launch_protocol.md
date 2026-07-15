# Purely Doubles Inaugural - Launch Protocol
*Date: 2026-07-15*

To cross the finish line and launch the first live Tennissuite event, the following environmental and physical checklists must be cleared.

## 1. Environment Secrets Rotation & Production Promotion
- [ ] **Database Mirror Check**: Promote local SQLite/Prisma development schema to production-grade cloud PostgreSQL instances (e.g., Supabase). Verify indexes on `tournamentId`, `courtId`, and `matchStatus`.
- [ ] **Secret Asset Cycling**: Swap out all development keys in Vercel for live production strings:
  - Stripe live production webhook signing signatures (`Stripe-Signature`).
  - JWT session encryption tokens.
  - Remote Terraform cloud state-locking configurations.

## 2. The Physical Infrastructure Setup ("The On-Site Hook")
- [ ] **The Referee / Device Lock Protocol**: Verify on-site physical devices used by Referees and Court Marshals have local PWA outbox cache (IndexedDB) primed.
- [ ] **The Broadcaster OBS / vMix Stencil Binding**:
  - Map video encoders (OBS Studio) to reactive overlay endpoints (`/api/broadcast/highlights/latest`).
  - Run graphics validation to ensure real-time match events update CSS/HTML scorebug overlay via SSE (<200ms latency).
  - Confirm sponsor adintro/outro banner wrappers inject cleanly.

## 3. The "Purely Doubles Inaugural" Dry Run
- [ ] **The Offline-First Stress Test**:
  - Load Referee interface, begin scoring, and intentionally trigger total network disconnect.
  - Prove PWA local caching holds point variations safely.
  - Prove data queue drains chronologically upon reconnect without state collisions using `offlineVersion`.
- [ ] **God-Mode Override Verification**:
  - Trigger mock scoring conflict.
  - Tournament Delegate uses Match Monitor Panel to execute administrative score override.
  - Verify platform blocks mutation until Delegate inputs mandatory text explanation.
  - Confirm timestamped log to permanent ledger stream alongside user session context.

## 🚀 Launch Order Checklists (Tournament Morning)
1. [ ] **Deploy the Edge Layer**: Run `terraform apply` to lock down production load-balancer and edge-network path parameters.
2. [ ] **Open the Storefront**: Flip main app routing rules to let dynamic custom subdomains accept live traffic.
3. [ ] **Initialize Inbound Flow**: Open public registration gateway, monitor payment transactions in Stripe, and watch the system engine run.

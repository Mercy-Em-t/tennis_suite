# Sprint 6 Backlogs: Launch Readiness Checklists

## 1. Environment Secrets Rotation & Production Promotion
- [ ] **Database Mirror Check**: Promote local SQLite/Prisma development schema to production-grade cloud PostgreSQL (e.g., Supabase).
- [ ] **Query Analyzer**: Run scripts to verify indexes on `tournamentId`, `courtId`, and `matchStatus` are compiled cleanly.
- [ ] **Secret Asset Cycling**: Swap out all development keys for live production strings in Vercel.
- [ ] Configure Stripe live production webhook signing signatures (`Stripe-Signature`).
- [ ] Configure JWT session encryption tokens (passwordless/OTP).
- [ ] Configure Remote Terraform cloud state-locking configurations.

## 2. The Physical Infrastructure Setup ("The On-Site Hook")
- [ ] **Referee / Device Lock Protocol**: Verify on-site devices have their local PWA outbox cache (IndexedDB) primed.
- [ ] **Broadcaster OBS / vMix Stencil Binding**: Map encoders to reactive overlay endpoints (`/api/broadcast/highlights/latest`).
- [ ] Run graphics validation checks for real-time match events via SSE (<200ms latency).
- [ ] Confirm sponsor adintro/outro banner wrappers inject correctly.

## 3. The "Purely Doubles Inaugural" Dry Run
- [ ] **The Offline-First Stress Test**: Test Referee interface scoring during intentional network disconnect.
- [ ] Verify PWA local caching holds point variations.
- [ ] Verify accurate chronological data queue drain to PostgreSQL upon reconnecting without state collisions.
- [ ] **God-Mode Override Verification**: Trigger mock scoring conflict and execute administrative score override via Match Monitor Panel.
- [ ] Verify platform blocks mutation until Delegate inputs mandatory text explanation.
- [ ] Verify finalized action outputs a timestamped log to the permanent ledger.

## 4. Launch Order Checklists
- [ ] **Deploy the Edge Layer**: Run `terraform apply` to lock down production parameters.
- [ ] **Open the Storefront**: Route traffic to dynamic custom subdomains (`app.tennissuite.com`).
- [ ] **Initialize Inbound Flow**: Open public registration gateway and monitor Stripe transactions.

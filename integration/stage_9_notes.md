# Integration Stage 9 Notes

## Objectives
- Integrate financial lifecycle (registration, checkouts, and multi-tenant ledger distribution).
- Utilize Stripe checkout and a Webhook for atomic state transitions.
- Drive live registration updates to a Host Dashboard via SSE.

## Technical Execution
- **Database Schema Expansion:**
  - Added `LedgerEntry` to `prisma/schema.prisma` to track `grossAmount`, `platformFee` (10%), and `hostPayout`.
- **Checkout API & Stripe Integration:**
  - Implemented `POST /api/tournaments/[id]/checkout` which provisions a Stripe Checkout Session if secret keys are available.
  - Implemented a seamless **Sandbox Mock Fallback**. If `STRIPE_SECRET_KEY` is missing, it routes the user to a mock success handler which simulates the webhook firing internally.
- **The Immutable Webhook (`POST /api/webhooks/stripe`):**
  - Consumes `checkout.session.completed` events.
  - Wraps operations in a `prisma.$transaction`.
  - Updates `Team.paymentStatus` from `PENDING_PAYMENT` to `REGISTERED`.
  - Distributes funds across `RainmakerFee`, `PartnerPayout`, and `LedgerEntry`.
  - Emits the `SLOT_OCCUPIED` real-time SSE event globally for that tournament.
- **The Rainmaker Pulse Test Interfaces:**
  - **The Registration Gateway** (`/sandbox/registration`): Public portal displaying the payment CTA.
  - **The Host Dashboard** (`/sandbox/host-dashboard`): Admin panel displaying a live count of registered teams (subscribed to the SSE channel).
  - Paying via the Gateway instantly updates the Host Dashboard counter without refresh.

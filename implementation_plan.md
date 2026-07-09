# Next.js Build Stabilization Plan

During the previous iterations, we identified three major classes of build errors caused by recent architectural and API changes. Rather than playing "whack-a-mole" by running the build over and over, this plan comprehensively lists every single file that suffers from these issues so we can batch-fix them.

## 1. Next.js 15+ Async `cookies()` Breaking Change
Next.js updated `cookies()` to return a Promise that must be awaited (`await cookies()`).

**Files to fix (`const cookieStore = cookies()` -> `const cookieStore = await cookies()`):**
- `src/lib/auth/require-auth.ts`
- `src/app/api/tournaments/[id]/matches/[matchId]/score/route.ts`
- `src/app/api/tournaments/[id]/matches/[matchId]/call-referee/route.ts`
- `src/app/api/onboarding/initialize-factory/route.ts`
- `src/app/app/team/profile/page.tsx`
- `src/app/app/page.tsx`
- `src/app/app/dashboards/layout.tsx`
- **15 Director API Routes**: 
  - `src/app/api/director/broadcast/route.ts`
  - `src/app/api/director/killswitch/route.ts`
  - `src/app/api/director/disputes/route.ts`
  - `src/app/api/director/override-score/route.ts`
  - `src/app/api/director/payouts/route.ts`
  - `src/app/api/director/reseed-bracket/route.ts`
  - `src/app/api/director/settings/route.ts`
  - `src/app/api/director/staff/route.ts`
  - `src/app/api/director/ledger/route.ts`
  - `src/app/api/director/health/route.ts`
  - `src/app/api/director/disqualify/route.ts`
  - `src/app/api/director/broadcast-override/route.ts`
  - `src/app/api/director/broadcast-alert/route.ts`
  - `src/app/api/director/archive/route.ts`
  - `src/app/api/director/audit/route.ts`

## 2. Legacy Token Shape (`payload.id` instead of `payload.sub`)
The `TennisSuiteToken` was upgraded. It no longer has an `.id` property; instead, it uses the standard JWT `.sub` property and includes a `.context` object. 

**Files to fix (`payload.id` -> `payload.sub`):**
- `src/lib/auth/require-auth.ts`
- `src/app/api/upsell/route.ts`
- `src/app/api/tournaments/[id]/matches/[matchId]/score/route.ts`
- `src/app/api/tournaments/[id]/matches/[matchId]/call-referee/route.ts`
- `src/app/api/player/umpire/claim/route.ts`
- `src/app/api/player/history/route.ts`
- `src/app/api/player/tournaments/[id]/route.ts`
- `src/app/api/player/dashboard/route.ts`
- `src/app/api/player/tournaments/[id]/checkin/route.ts`
- `src/app/app/team/profile/page.tsx`
- **All 15 Director API Routes** (listed above)

**Files to fix (`signToken({ id })` -> `signToken({ sub, roles, context })`):**
- `src/app/api/auth/register/route.ts` (Verify the `tokenPayload` object matches the strict type)

## 3. Strict Prisma Schema Validation (`tournamentId` missing)
To enforce multi-tenant isolation, the `RainmakerFee` and `PartnerPayout` models now strictly require a `tournamentId`. We must pass `tournamentId` in their creation payloads.

**Files to fix for `rainmakerFee.create`:**
- `src/lib/engine/finance.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/api/upsell/route.ts`
- `src/app/api/revenue/distribute/route.ts`

**Files to fix for `partnerPayout.create`:**
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/api/revenue/distribute/route.ts`

## User Review Required
> [!IMPORTANT]
> Because there are over **30 files** requiring these systemic updates, running a mass find-and-replace will be much more efficient than the single-file iteration cycle. Do you approve moving forward with applying these fixes en masse, before running the 5-iteration check again?

# Integration Stage 5 Notes

## Objectives
- Build out the authentication and RBAC layers.
- Implement onboarding funnels and specific dashboard redirects based on roles.
- Polish UI elements.

## Technical Execution
- **API Access Controls:**
  - Upgraded the `/api/matches/[matchId]/score/route.ts` to implement advanced Player Umpire rules.
  - The API previously hard-rejected `PLAYER` roles using the `requireAuth()` global guard.
  - Modified the gate to let `PLAYER` through, and then explicitly queried the match. If the authenticated player's ID matches the `match.umpireId` record, they are granted temporary, localized authorization to submit scores. If not, they receive a 403 Forbidden.
  - *Bug Fix:* Resolved a potential `TypeError` where the API was incorrectly unpacking `authResult.user` instead of `authResult` directly.
  - **Security Enhancement:** Implemented Upstash Redis rate-limiting on the `/api/auth/login` endpoint. It applies a 5-minute sliding window capped at 5 requests per `IP:Email` combination to strictly prevent brute-force credential stuffing.
- **Onboarding Funnels:**
  - The `host-onboarding` and `login` pages were already built with the dark-mode glassmorphism styling, linking correctly from the Landing Page.
- **Login Redirect Matrix & UI Polish:**
  - Rebuilt the login form state to parse the authenticated `user.role` from the API response payload.
  - Built a dynamic redirect map:
    - `HOST` | `ADMIN` ➡️ `/admin`
    - `DIRECTOR` ➡️ `/director`
    - `REFEREE` ➡️ `/referee`
    - `MARSHALL` ➡️ `/marshal`
    - `PLAYER` ➡️ `/team`
    - Default ➡️ `/tournaments`
  - Replaced the standard loading state with a premium glassmorphism spinner (using Framer Motion) and success state that gracefully informs the user they are being routed before executing the redirect.

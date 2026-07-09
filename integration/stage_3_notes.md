# Integration Stage 3 Notes

## Objectives
- Integrate Court Dispatching logic by utilizing the existing `/api/tournaments/[id]/dispatch` endpoint.
- Ensure collision avoidance logic is functioning correctly.
- Build the **Marshal Grid** component for assigning scheduled matches to open courts.

## Technical Decisions
- **API Discovery:** The API `POST /api/tournaments/[id]/dispatch` already exists. It correctly checks that a court isn't occupied by any match in the `IN_PROGRESS`, `WARMUP`, or `READY` states, throwing a 400 error if collision occurs. It updates the target match's `courtId` and changes its status from `SCHEDULED` to `READY`.
- **Seeding Data:** Modified `seed.ts` to insert a `SCHEDULED` match into the local database, giving us data to interact with on the UI.
- **Frontend Architecture:** 
  - Created the Marshal Dashboard at `src/app/(dashboards)/marshal/[tournamentId]/page.tsx`.
  - Built a hybrid architecture: the Server Component (`page.tsx`) performs the initial secure database query to fetch `courts` and `scheduledMatches`. It passes this data to the interactive Client Component (`MarshalClient.tsx`), which handles selection state and dispatch API calls. 
  - Designed the UI to have a highly premium, sleek appearance with immediate visual feedback on court status (AVAILABLE vs OCCUPIED).

# Integration Stage 10 Notes

## Objectives
- Implement real-time Role Morphing for a player receiving umpire duties from a referee.
- Utilize context mutation tokens and SSE to transition the UI seamlessly without a browser refresh.

## Technical Execution
- **Backend Infrastructure:**
  - Designed the `/api/matches/[matchId]/delegate` API endpoint. This acts as the mutation controller, allowing a referee to assign or revoke the `umpireId` on a match.
  - Pushed atomic state updates out via the global `matchUpdated:${matchId}` Server-Sent Events (SSE) channel.
- **The Adaptive Layer (UIs):**
  - **Referee Delegator (`/sandbox/play6ump/referee`)**: Acts as the command center where the match is delegated.
  - **Adaptive Player Dashboard (`/sandbox/play6ump/player`)**: Acts as the dynamic interface. By default, it operates in strict read-only mode with standard dark theming. When the SSE stream confirms their `userId` matches the `umpireId`, Framer Motion handles a hyper-smooth UI transition. The background, borders, and typography shift into a high-contrast "Umpire Yellow", and scoring control blocks instantly slide into view, granting full match-scoring capabilities.
  - Finalizing the match strips the player of umpire privileges, reverting the UI back gracefully.

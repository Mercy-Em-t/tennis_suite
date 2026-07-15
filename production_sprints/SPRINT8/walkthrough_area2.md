# Area 2 Complete: Play6Ump & Live Scoring

I have successfully transitioned the **Play6Ump** (Umpire claiming) and **Score** sandbox scenarios into live interactive features for players and referees. 

## What was built

1. **Umpire Terminal Claim UI (`/app/dashboards/player/umpire`)**:
   - A dedicated PIN-entry portal for players.
   - It prompts for the `Tournament ID` and `6-digit PIN`.
   - On successful verification (via the `/api/player/umpire/claim` endpoint we hardened earlier), the player is instantly redirected to their specific match's live scoring arena.
2. **Live Scoring API (`/api/match/score`)**:
   - Built the backend mutation endpoint to parse the incoming score tap and pass it through our `TennisEngine` (`advanceScore` logic).
   - This handles all edge cases: standard game points (15, 30, 40, AD), tiebreakers, set increments, and match completion logic.
   - Saves the updated `scoreState` back to the database, which automatically triggers the SSE events for all listening clients!
3. **Live Undo API (`/api/match/undo`)**:
   - Built a rudimentary rollback endpoint that resets the current game's points to 0 if an umpire accidentally double-taps.

## Verification
- We verified the `TennisEngine` is fully functional and hooked up to the Next.js API endpoints.
- The scoring keypad UI now successfully mutates the true database state rather than a simulated sandbox!

> [!TIP]
> **Ready for Area 3: Dispute Resolution (Delegate Dashboard)?**
> Let me know if Area 2 is satisfactory or if you want to make any adjustments before we proceed!

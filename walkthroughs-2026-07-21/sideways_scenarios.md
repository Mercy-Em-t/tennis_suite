# Walkthrough: Sideways Scenarios & Exceptions

I have fully implemented the architecture for handling exceptions when the tournament deviates from the "happy path." Here is how the system now handles global, match, and player-level exceptions.

## 1. Global Tournament Emergencies
- **The Emergency Override Panel**: In the During-Tournament view (Action Center), you now have a dropdown to forcibly set the Tournament state to `NORMAL`, `SUSPENDED`, `POSTPONED`, or `CANCELLED`.
- **Global Lockout**: If you change the state to `CANCELLED` or `POSTPONED`, a massive red alert banner appears across the top of the main Dashboard. All operations are visually frozen, communicating to the entire team that the event is on ice.

## 2. Match Abandonment & Walkovers
- **Umpire Override Menu**: Inside the Umpire Match Scoring terminal, there is a new "Exceptions & Overrides" panel at the bottom.
- **Awarding Walkovers**: Referees can now instantly click "Award Walkover to Team A/B". This automatically bypasses the score entry and forces a perfect straight-sets win (`2 Sets, 12 Games`) behind the scenes into the `scoreState`.
  - *Result*: The pool standings calculator processes this walkover identically to a dominant win, ensuring the player is fully rewarded and not penalized on tie-breaker metrics.
  - *UI Display*: The UI detects the hidden `walkover: true` flag and renders the score result as "via Walkover" rather than displaying a fake 6-0 scoreline.
- **Match Abandonment**: You can permanently Abandon a match. It will register as `CANCELLED` and neither team will receive points.

## 3. The Withdrawal Cascade Effect
- **Participant Management**: In `Tournament Settings`, there is a new "Participant Management" panel at the very bottom. You can view all registered active teams and mark them as `WITHDRAWN` or `DISQUALIFIED` with a single click.
- **The Automation**: Hitting that button triggers a massive backend cascade via the new `/api/tournaments/[id]/teams/[teamId]/status` API route:
  1. It hunts down every `PENDING` or `SCHEDULED` Pool match involving that player, automatically awards a Walkover to their opponents, and locks the points in.
  2. It hunts down every `PENDING` or `SCHEDULED` Knockout/Finals match involving that player and automatically flags them as `REQUIRES_INTERVENTION`. This locks the bracket and immediately summons the Referee to the Match Override Workspace to draft an eligible replacement from the original pool!

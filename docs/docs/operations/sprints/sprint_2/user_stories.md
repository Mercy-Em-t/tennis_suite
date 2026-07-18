# User Stories

## Matchmaking & Play (Players)
- **Story 1 (Matchmaking)**: As a competitive amateur player, I want to use the LFG Drafter to find similarly skilled opponents, so that I can play challenging and fair matches.
  - **Conditions of Satisfaction**: 
    - The matchmaking engine must group players within a defined 10% Elo/XP threshold.
    - The system must notify both players within 5 seconds when a match is successfully found.
- **Story 2 (Scoring)**: As a player, I want to log my match scores using the scoring engine, so that my global ranking and XP progress automatically.
  - **Conditions of Satisfaction**: 
    - Scores must be cryptographically verified by both parties or a designated referee.
    - The engine must respect specific rulesets (e.g., Tiebreaks, Ad/No-Ad scoring) configured before the match.

## Management & Organization (Club Owners/Admins)
- **Story 3 (Court Allocation)**: As a facility manager, I want to use the Scheduler to automatically allocate courts based on match duration predictions, so that we maximize court utilization and minimize double bookings.
  - **Conditions of Satisfaction**: 
    - The Scheduler must rigidly prevent overlapping bookings on the same court.
    - The system must automatically insert configurable buffer times (e.g., 10 minutes) between matches for court transition.
- **Story 4 (Bracket Generation)**: As a tournament director, I want the bracket engine to automatically seed players, so that I do not have to manually calculate draw positions or handle byes.
  - **Conditions of Satisfaction**: 
    - Must support both round-robin and single-elimination formats.
    - Must automatically distribute byes to top seeds if the player count is not a power of 2.

## Broadcasting & Refereeing (Broadcasters/Referees)
- **Story 5 (Telemetry)**: As a broadcaster, I want a sub-200ms real-time scoreboard overlay, so that my audience gets live point-by-point updates without noticeable delay.
  - **Conditions of Satisfaction**: 
    - The overlay must update via SSE automatically when points are committed to the scoring engine.
    - The payload must include the current server, set scores, and game scores.
- **Story 6 (Time-Triggered Dispute)**: As a referee, I want to receive alerts if a match exceeds its allocated time block by 15 minutes, so that I can intervene, resolve disputes, or adjust the master schedule.
  - **Include/Extend**: 
    - *Includes* checking the current match score state via the scoring engine. 
    - *Extends* automatic rescheduling or shortening of subsequent matches on that court if the delay is deemed severe (e.g., moving to a third-set tiebreak instead of a full set).

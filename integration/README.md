# Integration Phase Documentation

stage 1:verification of ground truth--databases and prisma

1. do we hve an instance of database? if no begin process of creating it.
   if yes check if it is connected to the application.
   2.is the prisma schema set up? if no begin process of setting it up.
   does the prisma schema have all the required tables(of core entities) and fields?

2. enforce multitenancy immediately on the database. .ensure everything has a corresponding strict tournamnet id column. if not add it immediately.

3. run prisma generate to generate the prisma client. if not exist do it.

4. run prisma db push to create the tables.

5. run seed.ts to seed the database with one fake tournamnet, 4 fake players grouped into teams, two fake courts

this completes phase 1:if ready await further instruction for stage2

# Integration Stage 2 Tasks

backend state machine

1. report on the api endpoint that receives score updates from the UI or any external source that feeds scores into the application.

if !exists: provide the means to create it so that it becomes a reality.

format : POST/api/matches/[matchId]/score or the appropriate format used in this project

2.write aprisma atomic transaction that increments a point
checks if a game is won, checks if a set is won and updates the match state.

3. the line in the middle
   websockets or sse connection. using websockets to push live score updates to all clients connected to the match. use prisma hooks or middleware to detect changes in match state and push updates to the appropriate clients.

4 the refereecreate as implereferee page with 2 buttonsto simulate adding ppoints to the two teams. one for each team ie +1 player a and +1 player b. verify that the websocket pushes the score update to the api

5 the broadcaster. create a page that listens to the websocket connection and displays the live score update.

stage 3:

ensure that a match can now e scored. now we need to get that match on court. we introduce the concept of scheduling. ensure that a schedule can be created. ensure that the schedule is created with a match and a court.

1. the court dispatcher api
   Implement POST /api/tournaments/[id]/dispatch.
   Write the logic that updates a Match record's courtId and switches its status from SCHEDULED to READY or WARMUP.

Collision Avoidance: Program the API to throw an error if someone tries to dispatch a match to a court that already has an IN_PROGRESS match.

The Marshal Grid Component: Build a simple UI grid mapping your seeded courts. Implement the action that hits your dispatch API.

stage 4:
ensure the above 3 stages are properly wired. confirm ability to dispatch and score matches

now we build the pipeline to generate the data dynamically

The Standings & Progression Engine: Write the backend logic (/api/tournaments/[id]/generate-bracket). This code looks at completed matches, updates a pool leaderboard, figures out who finishes Top 2, and programmatically spawns the next knockout match records.

The Creation Wizard Backend: Write the endpoint that accepts a JSON structure of tournament settings (Format: Fast4 vs Traditional, Single vs Doubles, number of pools) and creates the records.

The Host Creation UI: Now you build the Host's setup forms. The form simply gathers the configuration payload and fires it to your Creation Wizard backend.

stage 5:
Only after the engine, the logistics, and the creation pipeline are working should you build the entry points.

RBAC Middleware: Write your authentication layers. Ensure that a user with a Player role trying to hit the POST /api/matches/[matchId]/score endpoint gets a swift 403 Forbidden response.-------->unless they have player ump rights over a match

Onboarding Funnels: Build the Host registration pages, the landing pages, and the redirect logic that sends a user to their specific dashboard environment depending on their role. -------->Ensure that the correct redirect is performed. the login buttons, the host tournament leading to signup

I Polishing: Take your dark-mode glassmorphism designs and apply them to the bare-bones functional layouts you built in Steps 2, 3, and 4.

STAGE 6:
CHECK SCHEMA PRISMA FILE AND acertain the relationship between tournamanet, match and team

a script to hardcode tournament and match

write endpoint to modify that match's cscore
report done if stable

stage 7:
coordination and court deployment
a match can be scored, now we get a match onto the court

Ensure your Match and Court relationships are fully mapped out.

Add a courtId foreign key to your Match model.

Add a status enum to Match containing at least: SCHEDULED, READY (Warmup), IN_PROGRESS, and COMPLETED.
Add a status enum to Court to handle local availability: IDLE, WARMUP, IN_PROGRESS, MAINTENANCE.

2. The Backend Layer (API State Machine)
Create an atomic transaction endpoint at POST /api/tournaments/[id]/dispatch. The logic inside this route must enforce strict Walled Garden boundaries:

Collision Avoidance check: Query the targeted court. If court.status === 'IN_PROGRESS', reject the payload with a explicit conflict error.

Atomic State Mutation: Wrap the database updates in a single Prisma transaction. If the court is free, change Match.courtId to the targeted court, change Match.status to READY, and flag the Court.status as WARMUP.

3. The Line in the Middle (Real-Time Propagation)
Tie this dispatch endpoint into your WebSockets / Server-Sent Events (SSE) server layer.

When the dispatch sequence successfully completes, immediately broadcast a payload containing the updated matchId, courtId, and updated state to all connected client listeners.

The Court Marshal Dispatcher: Create a bare-bones admin panel page featuring a simple table layout of your seeded courts. Provide a button or dropdown list that lets you select a SCHEDULED match and post it to your dispatch endpoint.

The Player Command Center (The Receiver): Create a simple player-facing mock screen. Use a React hook or subscriber that listens to your real-time broadcast channel.

The "Pulse" Test: When the Court Marshal dispatches the match to that player's court, verify that the player's dashboard immediately reacts by animating or flashing a notification banner ("Your match is READY. Report to Court X immediately").

prove that disptching the match is seamless without requiring page refresh sends the alerts to the players

stage 8:
The Standings & Automated Bracket Generation Engine (The "Automaton" Phase)

required: atches can be physically dispatched to courts and live-scored,

next logical milestone is handling match finalization. When a match ends, the platform must automatically calculate table updates and, upon completion of all pool matches, dynamically construct the next stage's knockout bracket without human administration.

Your Pool or Group model must have clear relations to its member Teams and child Matches.
Match model needs explicit indicator keys to handle its lineage within a bracket structure

The Backend Layer (API State Machine & Math Rules)Create a tournament finalization pipeline at POST /api/matches/[matchId]/finalize. This endpoint must be wrapped in a strict database transaction executing two structural phases:Phase A: The Standings Compute EngineWhen a match transitions to COMPLETED, use Prisma aggregations to recalculate pool standings on the fly:Tally total wins per team inside the pool.Compute the cumulative set and game differentials ($\Delta \text{Sets}$ and $\Delta \text{Games}$):$$\Delta \text{Sets} = \text{Sets Won} - \text{Sets Lost}$$$$\Delta \text{Games} = \text{Games Won} - \text{Games Lost}$$Rank the teams deterministically based on these metrics to generate an immutable pool leaderboard payload.Phase B: Knockout Tree GenerationDirectly following the recalculation, execute a check: Are all matches within this pool marked as COMPLETED?If true, look up the top two ranked teams from the computed leaderboard.Programmatically target the upcoming structural bracket rows (e.g., Quarter-finals or Semi-finals) and insert the qualified teamId values into their matching pre-allocated, unplayed knockout match records.

Bind the successful creation/update of knockout brackets to your real-time broadcast socket layer.

Broadcast a structured state update event payload (LEADERBOARD_UPDATED or BRACKET_PROGRESSION) containing the fresh ranking arrays and the newly occupied knockout card entities.

visual interfaces to confirm that math-driven automation is flowing perfectly:

The Standings Grid: Create a basic data table that consumes your real-time leaderboard broadcast channel.

The Visual Draw Layout: Build a minimal visual layout mapping out a bracket pathway (e.g., an SVG or simple Flexbox tree architecture).

The "Automaton" Pulse Test: Open the scoreboard, the standings page, and the bracket layout side-by-side. Score the final point of the last remaining pool match. Verify that within 200ms, the standings table updates, the pool locks itself down, and the winning team's name instantly animates into the correct knockout block on the bracket layout—all without a single manual browser refresh.

stage 9:

treasury and financial ledger

required : match engine that progresses players from pools to brackets based on score data

this stage focus transactional lifecycle: registration checkouts, webhook consumption, and atomic multi-tenant ledger distributions.

To prevent financial discrepancies or unverified tournament entry, split registration into a split state object. Update your schema.prisma:

Team Extensions: Add fields for paymentStatus (Enum: PENDING, PAID, REFUNDED) and an optional stripeSessionId.also mpesa payments and verification

LedgerEntry / FinancialDistribution Table: Create an auditing table to record individual fee allocations:

id (UUID)

tournamentId (Strict multi-tenancy enforcement)

teamId (Foreign key)

grossAmount (Int - always track currency in cents/lowest denomination, e.g., $30.00 = 3000)

platformFee (Int - Rainmaker cut)

hostPayout (Int - Net to organizer)

createdAt (DateTime)

Route A: The Checkout Initiator (POST /api/tournaments/[id]/checkout)
Accepts the payload of the player(s) attempting to form a team for tournament [id].

Generates a unique idempotencyKey composed of a deterministic hash of the user IDs and the tournament ID to block twin-submission charges.

Instantiates a Stripe Checkout Session with metadata tagging tournamentId and the pairing player IDs, returning the direct payment redirect link.

Route B: The Immutable Webhook (POST /api/webhooks/stripe)
Hardens the intake route by verifying the inbound Stripe-Signature header against your local webhook signing secret.

Extracts the payload on checkout.session.completed.

The Atomic Transaction: Wraps the database execution inside a single prisma.$transaction:

Flips Team.paymentStatus to PAID.

Calculates and inserts the split rows into LedgerEntry, logging the exact platform fees and host net gains cleanly.

Adds the team ID directly to the unstarted pool or registration pool table.

If any step faults, the whole operation aborts to ensure the system ledger never unbalances.

Tie the database mutation inside your webhook to your live SSE/WebSocket server layer.

Upon processing a successful checkout transaction, broadcast a payload event (SLOT_OCCUPIED) carrying the new registration card details to the tournament room channel.

The Registration Gateway View: A bare-bones public portal displaying a tournament card with a single prominent CTA button: [ Register Team & Pay ].

The Host Team Matrix Grid: Open the Host dashboard view in a second browser window showing the registered team slot count (e.g., Registered Teams: 3 / 16).

The "Rainmaker" Pulse Test: Click the payment CTA button, fulfill the payment on Stripe's pre-built hosted checkout screen using a mock credit card (4242...), and submit. Confirm that Stripe safely routes back to your app while the Host dashboard in your adjacent window instantly animates the registration counter from 3 / 16 to 4 / 16 inside 200ms of the webhook hitting your endpoint, without refreshing the admin panel.

flow : team can register and doesnt have to pay immediately. they can have it at pending but no match for that team until their status changes to paid----> does this make sense or it compleicates what we ahve above. if it complicates dont implement this flow stick to the one above

stage 10:
The Adaptive Layer & Player-Umpire Handoff (The "Play6ump" Phase)
Objective: Allow a player's interface to dynamically morph when assigned a new role.

Core Logic: When a referee delegates a match to a player to umpire themselves, the system must securely push a context mutation token. The player’s standard read-only view must instantly transform into a high-contrast "Umpire Yellow" scoring interface (inheriting scoring sections buttons from slice 1 and 3) and revert immediately to a player dashboard once the match is finalized.

stage 11:
God-Mode Controls & Redundant Verification (The "Delegate" Phase)
Objective: Give the Tournament Delegate the power to override data while enforcing strict accountability.

Core Logic: Write the /api/delegate/override endpoint. This introduces a double-confirmation transaction layer where mutations to game logs or match results must be submitted alongside a text-based justification string. It records the action into an immutable audit trail and cascades live recalculations across every connected client screen.

ensure to obtain the logic for overriding. THIS IS CRITICAL.

stage 12:
Infrastructure Pulse & Telemetry Surveillance (The "Monitor" Phase)
Objective: Provide the Technical Director (System Monitor) with real-time hardware and stream analytics.

Core Logic: Implement client-side WebSocket/SSE heartbeat signals that pulse every 3 seconds. Create the /monitor server layer that aggregates packet delivery speeds and connection status indicators. If a court's connection flags or latency exceeds 500ms, it automatically triggers high-contrast alert states on the technical dashboard.

stage 13:
Production Unification & Disaster Recovery (The "Launch" Phase)
Objective: Take the localized architecture and deploy it safely to the live edge ecosystem.

Core Logic: Migrate local schemas to cloud databases, execute remote Infrastructure as Code (IaC) configuration runs, and apply strict token rotation variables. Implement local client browser fallback cache layers (IndexedDB/SQLite outbox drains) to verify that if network connectivity drops entirely during a physical match, data is safely rehydrated upon reconnection without conflict.

stage 14:
The Daily Cadence: Technical Surveillance & Shift Transitions
Once the code is stable, daily operations focus on event-day execution.

The Guard Rails Check: Running automated morning health diagnostics across all physical court endpoints before tournament matches begin.

The Active Session Clean: Programmatically forcing the logout or expiration of stagnant websocket session tokens from the previous day's events to prevent device auth drift.

The Shift Handover: Seamlessly delegating the system-level state view from a morning Technical Director (System Monitor) to an afternoon shift lead without terminating live, sub-200ms broadcast socket streams.

stage15:
2. The Monthly Cadence: Financial Auditing & Pipeline Reconciliations
Every 30 days, the platform balances its transaction layers and host distributions.

Ledger Invariant Verification: Cross-referencing Stripe payout receipts against the internal, immutable LedgerEntry table rows. If a single cent mismatch occurs between calculated gross payouts and settled cash, the system triggers an emergency engineering audit flag.

Multi-Tenant Isolation Scans: Running database security scripts to strictly guarantee that no cross-tournament data leakage occurred (proving that a Host from "Tournament A" could never intercept analytics or entry fees belonging to "Tournament B").

3. The Annual Cadence: Regulatory Archival & Database Defragmentation
Once a year, the system cleans its historical data footprint to maintain optimized edge latency.

Immutable Historical Snapshots: Offloading completed brackets, raw point logs, and match histories from the active transactional relational database into flat, cold-storage JSON arrays (e.g., AWS S3 or Supabase Storage).

Active Table Pruning: Deleting deep point logs from older, finalized tournaments to ensure the active indexing trees inside PostgreSQL remain incredibly lightweight, preserving rapid search and load speeds for upcoming seasons.

Tax and Compliance Exports: Compiling and formatting the structural revenue distribution files (platformFee cuts vs. host payouts) for legal financial auditing.
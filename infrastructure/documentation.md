# Infrastructure Documentation: Master Architecture v1.0

This document maintains a living record of the technical details, architecture, and structural components of the Elite Tournament Organizer digital infrastructure.

## 1. System Architecture & Infrastructure
The foundational hosting and routing that keeps the suite online and secure.
- **A. Core Database Design:** Entity relationship mapping (Match -> Tournament -> Player) using Prisma ORM. Database security rules.
- **B. Domain Routing:** Unified traffic controller (`middleware.ts`). Subdomain isolation for distinct dashboards.
- **C. Environment Management:** Development, testing, and production environments.

## 2. Identity & Role-Based Access Control (RBAC)
The digital permissions that define what different users can see and do.
- **A. Authentication Gateway:** Single sign-on for the entire suite.
- **B. Internal Application Roles:** Tournament Host (oversight), Court Marshall (physical flow), Referee (mutate live scores).
- **C. External Application Roles:** Franchise Owner/Player (edit rosters, view schedules), Public Viewer (read-only broadcaster feed).

## 3. Tournament Engine & Event Logic
The algorithms that prevent manual bracket management.
- **A. Format Configurations:** Pure Doubles constraints. Team-based cumulative point tracking.
- **B. Progression Algorithms:** Round-robin pool generation and tie-break math. Knockout tree automated progression.
- **C. Registration Logic:** Team creation vs. random pairing ("Blind Draw").

## 4. Match State Machine & Scoring
The core logic handling the atomic unit of the sport.
- **A. Match Status Tracking:** Strict linear state flow: `SCHEDULED → WARMUP → IN_PROGRESS → COMPLETED`. Score inputs are hardware-locked unless the match is explicitly `IN_PROGRESS`. Dispute and override transitions handled by the Dispute Engine.
- **B. Dynamic Scoring Engine:** `advanceScore()` state machine handles `0 → 15 → 30 → 40 → AD → Game` transitions, Set accumulation (first to 6, win by 2), and Tiebreaker logic at 6-6. All state persisted as a stringified `TennisScoreState` JSON object.
- **C. Referee Mobile PWA (`app/(dashboards)/referee/page.tsx`):** Mobile-first input layer. JWT (`role: REFEREE`) injected on every `/api/match/score` mutation (Gate 2 RBAC). Offline mutations queued via `useOfflineQueue.ts` hook into `localStorage` and auto-reconciled to `/api/sync/offline` on reconnect (Gate 3 resilience). PWA manifest (`public/manifest.json`) enables home-screen installation with standalone display mode.

## 5. The Broadcaster & Cinematic Interface
The visual output layer that creates the "pro experience."
- **A. Real-Time Telemetry (SSE):** Live scoring data is pushed via Server-Sent Events (`/api/broadcast/sse/route.ts`). The endpoint polls the database at 400ms intervals and emits `score_update` events only when `scoreState` changes, achieving sub-200ms client latency without WebSocket infrastructure overhead.
- **B. Client Hook (`hooks/useLiveMatch.ts`):** Wraps the native `EventSource` API. On mount, performs REST hydration from `/api/broadcast/latest` for instant rendering, then applies SSE deltas atomically. Native auto-reconnect handles network drops.
- **C. Visual Asset Integration (`components/BroadcasterOverlay.tsx`):** Full-Screen Slate (default) and Scorebug toggle view. Framer Motion animates point flips and set transitions. Broadcast-safe dark palette. Real-time latency meter and connection status indicator on bottom telemetry bar.

## 6. The Public Gateway & Intake
The storefront that captures leads and funnels users.
- **A. Suite Landing Page:** Value propositions for different services.
- **B. Automated Lead Pipeline:** Form capture routing directly to internal notifications.

## 7. On-Court Logistics & Operations
Bridging the digital software with physical reality.
- **A. Venue Management:** Real-time court assignment and time-block enforcement.
- **B. Support Staffing:** Ball boy / ball girl scheduling. Equipment concierge dispatches.

## 8. Payment & Financial Architecture
Handling the money without manual invoices.
- **A. Inflow (Collection):** Team registration fee processing. Premium upsells (highlight videos).
- **B. Outflow (Distribution):** Automated prize pool tracking. Platform revenue splits / organizer fees.

## 9. Media & Asset Pipeline
Managing the heavy files that players want to see.
- **A. Content Storage:** Architecture for handling player-uploaded assets.
- **B. Highlight Distribution:** Pipeline for sharing cinematic video clips securely.

## 10. Communications & Notifications
Keeping everyone informed automatically.
- **A. Participant Alerts:** Automated "Report to Court X" push notifications. Schedule delay broadcasts.
- **B. Staff Coordination:** Internal pinging between Marshalls and Referees.

## 11. Edge-Case Match Resolution (The Dispute Engine)
The logic handling what happens when physical reality doesn't match the digital system.
- **A. Mid-Match Interruptions:** Weather delay protocol (pausing state machine, saving exact score/server data). Injury retirement handling.
- **B. Score Correction Override:** Multi-tier audit log allowing a Tournament Host to retroactively edit a score submitted by a referee.

## 12. Automated Scheduling & Conflict Resolution
The algorithmic scheduling grid that completely eliminates manual spreadsheet planning.
- **A. Time-Block Optimizers:** Logic to calculate minimum rest windows between matches. Double-booking preventers for multi-division players.
- **B. Availability Matrix:** Player-submitted "blackout hours" parsed automatically during bracket generation.

## 13. Advanced Player Analytics & Performance Engine
The data tracking that makes amateur players feel like seasoned touring professionals.
- **A. Historical Indexing:** Dynamic player "Form Index" calculated using point margins. Head-to-head historical matrix.
- **B. On-Court Statistics (Referee Input):** Micro-data capture capabilities (e.g., tracking unforced errors or aces via simple tap gestures).

## 14. White-Label & Multi-Tenant Architecture
Structuring the codebase so you can sell this entire suite as software to other clubs globally.
- **A. Tenant Isolation:** Separation of styling, branding, and tournament data assets per club organization.
- **B. Customizable Subdomains:** Dynamic routing allowing custom domains (e.g., `tournaments.countryclub.com`) to point securely to your platform.

## 15. The "Ball Boy/Girl" Rotation Logic
The resource management engine handling physical staff distribution on the court.
- **A. Shift Management:** Automated rotation scheduler based on match lengths to avoid fatigue. Check-in/Check-out validation linked directly to the Court Marshall dashboard.
- **B. Performance Incentives:** Rating system where players or referees can tip or rate their court staff.

## 16. Sponsorship & Ad-Insertion Engine
How you turn the real estate on your Broadcaster Channel and physical courts into serious revenue.
- **A. Digital Dynamic Overlays:** Scheduled sponsor logo rotations on the broadcaster lower-thirds. "Match sponsored by..." programmatic text triggers on live point displays.
- **B. Physical Assets Placement Mapping:** Tracking banner inventory across specific physical courts for court marshalls to verify.

## 17. Multi-Sport Adaptability Layer
Ensuring your underlying data structures can effortlessly expand from tennis to padel, pickleball, or squash.
- **A. Scoring Rules Abstraction:** Decoupling the tennis scoring module so the engine can accept custom scoring limits.
- **B. Venue Object Flexibility:** Court dimensions and sub-type tags (e.g., Clay vs. Hard vs. Padel Cage) built into the database layer.

## 18. Localized Compliance & Legal Architecture
Protecting the business from liability regarding physical events, multimedia distribution, and data privacy.
- **A. Digital Waiver Pipeline:** Mandatory digital liability waivers and media release forms embedded directly into the registration flow.
- **B. Minor/Junior Protections:** Privacy toggles to automatically hide last names or headshots of minor players on the public broadcaster page.

## 19. Hardware & IoT Integration Layer (Future-Proofing)
Preparing the system to eventually plug directly into physical court hardware.
- **A. Scoreboard Sync:** API webhooks designed to transmit referee score updates to Bluetooth-enabled physical court scoreboards.
- **B. Video Feed Capture:** Automated pairing with automated court cameras to link video segments to specific match objects.

## 20. Offline-First Resilience (Courtside Network Failures)
Ensuring the tournament doesn't grind to a halt if the local court's cell signal or Wi-Fi completely drops.
- **A. Local State Synchronization:** Service workers that cache the referee's inputs locally on their device browser during network drops.
- **B. Conflict Reconciliation Engine:** Automatic database syncing and timestamps resolution the moment the device re-establishes a internet connection.

## 21. Merchandising & Team Kit Outfitting
Tapping into the team-based identity market by selling physical merchandise directly through the app.
- **A. Pre-Order Automation:** Direct connection between team registration and custom uniform/t-shirt size intake.
- **B. Swag Pack Logistics:** Auto-generated fulfillment lists for tournament hosts to prep player packs before day one.

## 22. Interactive Fan Engagement & Gamification
Creating a reason for people who aren't even playing to tune into the Broadcaster Channel.
- **A. Fan Prediction Matrix:** Zero-stakes "Pick 'Em" bracket predictions for the public or club members.
- **B. Real-Time Chat & Reaction Streams:** Moderated live comment feeds tied to specific high-profile broadcast streams.

## 23. Post-Event Archive & Legacy Engine
What happens when the tournament ends, keeping users hooked until the next one.
- **A. "Hall of Fame" Metrics:** Persistent archive of past tournament brackets, champions, and team rosters.
- **B. Automated Wrap-Up Summaries:** Scripted data aggregators that auto-generate top-line tournament stats for email newsletters or social media posts.

## 24. Autonomous Agent Orchestration (The "Agent OS")
Replacing human operational tasks with autonomous loops and recursive state machines.
- **A. Player Support Bots:** AI agents that ingest tournament rules and automatically answer player questions via a chat interface.
- **B. Dynamic Match Rescheduling:** Agents that monitor court delays and recursively propose new schedules to affected players.

## 25. Generative AI Cinematic Content Pipeline
Automating the high-end video production that amateur players crave.
- **A. Script & Prompt Generation:** System that takes match metadata and auto-generates structured visual prompts for hype reels.
- **B. Dynamic Match Storytelling:** Auto-generating post-match narrative summaries featuring specific lighting cues and camera angle notes.

## 26. Calculated Fabric Engineering & Pattern Making
Taking the bespoke gear idea to a mathematical level for elite custom team apparel.
- **A. Parametric Yardage Calculators:** Algorithms that automatically calculate precise fabric width and yardage requirements for custom gear.
- **B. Automated Pattern Generation:** Digital outputs for customized team uniform patterns sent directly to local manufacturers.

## 27. Internal Revenue Splits & Co-op Distribution
Handling complex financial agreements automatically.
- **A. The "Rainmaker" Fee Engine:** Automated percentage routing that instantly cuts a commission to deal closers.
- **B. Partner Payouts:** Transparent ledger for distributing revenue to external service providers within your tech co-op.

## 28. High-Intent Lead Generation Infrastructure
Building the pipeline to ensure the tournaments actually sell out.
- **A. Automated Funnel Routing:** Forms that instantly pipe high-intent leads into connected Google accounts and internal channels.
- **B. Subdomain Service Isolation:** Dedicated landing pages for different target markets.

## 29. Automated Social Media Syndication
Acting as a full social media management branch for the tournament brand.
- **A. Live-Match API Hooks:** Scripts that automatically post score updates to Twitter/X and Instagram.
- **B. Automated Graphic Generation:** System that pushes branded templates with live scores to social feeds.

## 30. The "Looking for Group" (LFG) Matchmaking Engine
Solving the problem of solo players who want to join the team formats.
- **A. Free-Agent Draft Board:** A dashboard where team captains can view available solo players.
- **B. Automated "Blind Draw" Generator:** Algorithm that pairs solo players based on complementary skills.

## 31. Anti-Sandbagging & Skill Verification
Protecting the integrity of the "Social" and "Novice" divisions from ringers.
- **A. Algorithmic Outlier Detection:** System that flags players winning with mathematically suspicious margins.
- **B. Peer Review System:** Anonymous post-match surveys where opponents rate skill brackets.

## 32. VIP & Sponsor Concierge Portal
Treating the people who fund the tournament like absolute royalty.
- **A. Dedicated Sponsor Dashboards:** A private view where sponsors can see real-time ROI metrics.
- **B. VIP Hospitality Ticketing:** Digital access passes for exclusive viewing areas or food/beverage tabs.

## 33. Equipment Inventory & Asset Tracking
Managing the physical gear required to run the operation.
- **A. Ball Lifecycle Tracking:** Database logs automating when balls need to be retired to the practice bin.
- **B. Broadcast Equipment Manifests:** Checkout/Check-in system for the expensive cameras and microphones.

## 34. Match Video Clipping & Tagging Logic
Making the video assets easily searchable for players.
- **A. Timestamp Syncing:** Linking the referee's live scoring inputs to the raw video feed timestamp.

## 35. Multi-Language & Localization Architecture
Preparing the suite for international adoption.
- **A. String Externalization:** Ensuring all Gateway and Broadcaster text is stored in translation files.

## 36. Gamified Loyalty & Progression System
Keeping players engaged across multiple different tournaments.
- **A. Global Player XP:** Awarding experience points unlocking digital badges on their Broadcaster profile.

## 37. Incident & Emergency Protocol Engine
Handling worst-case scenarios cleanly.
- **A. Medical Timeout Logic:** Specific timer protocols for referees to trigger when a physio is needed on court.
- **B. Incident Logging:** Digital paper trails for disputes, code violations, or injuries for liability protection.

## 38. Dynamic Load Balancing (Infrastructure Scaling)
Ensuring the system doesn't crash when everyone checks the scores at once.
- **A. Server-less Architecture Preparations:** Designing database reads to handle massive spikes in traffic during a live final.

## 39. Third-Party CRM & Ecosystem Integrations
Playing nice with the tools clubs already use.
- **A. Club Management Software API:** Connecting to a club's existing membership database for SSO login.

## 40. Custom Tournament Types & Rule Injection
Allowing ultimate flexibility for formats without rewriting the code.
- **A. Rule "JSON" Configurations:** A master settings file where a host can invent completely arbitrary rules and the engine adapts instantly.

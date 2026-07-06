# Sprint 2 Documentation

This document tracks all changes made during Sprint 2. For each change, we document:
- **What is being done**
- **What is changing (from what and to what)**
- **How it is being done**
- **Why it is being done (Justification)**

## Changes

### 1. Initialize Sprint 2 Tracking
- **What is being done:** Creating a new `sprint_2` directory with tracking files.
- **What is changing:** Added `documentation.md`, `task_list.md`, and `immutable_log.md`.
- **How it is being done:** Using the `write_to_file` tool to initialize these files with markdown templates.
- **Why it is being done:** To maintain strict traceability and documentation for all work performed during this sprint.

### 2. Execute Gate 1: Market & Problem Definition + Stakeholder & Persona Definition
- **What is being done:** Generating Lean Canvases, Stakeholder Maps, and User Stories for typical tennis facility/player archetypes.
- **What is changing:** Added `lean_canvases.md`, `stakeholder_map.md`, and `user_stories.md`.
- **How it is being done:** Drafted documents in the `sprint_2` folder based on "Get out of the building" methodologies.
- **Why it is being done (Justification):** To map external solutions, categorize stakeholders, and write user stories as part of Gate 1 deliverables before advancing to Requirements Engineering.

### 3. Execute Gate 2: Requirements Engineering
- **What is being done:** Drafting Vision & Scope, User Requirements, and the Software Requirement Specification (SRS).
- **What is changing:** Added `vision_and_scope.md`, `user_requirements.md`, and `srs.md`.
- **How it is being done:** Consolidating business goals, stakeholder maps, and non-functional metrics into formal specification documents.
- **Why it is being done (Justification):** To lock in functional constraints, performance metrics, and external interfaces before writing any further code.

### 4. Execute Gate 3: Workflow Modeling & Verification/Validation
- **What is being done:** Generating Activity/Dataflow UML diagrams and compiling the V&V report based on Monte Carlo simulations and manual case studies.
- **What is changing:** Added `uml_dataflow.md` and `v_and_v_report.md`.
- **How it is being done:** Modeling system states via Mermaid syntax and documenting statistical fit criteria tests.
- **Why it is being done (Justification):** To validate the requirements mathematically and logically before implementation, preventing architectural dead ends.

### 5. Execute Phase 2: The Automaton Backend
- **What is being done:** Implementing strict validation logic on tournament backend endpoints.
- **What is changing:** Modified `generate-bracket/route.ts` to block bracket generation if uncompleted matches exist. Modified `dispatch/route.ts` to prevent double-booking on courts by adding `WARMUP` and `READY` status checks.
- **How it is being done:** Refined Prisma query filters directly inside the POST handlers. The Server-Sent Events (SSE) stream automatically broadcasts the `READY` state since it polls the latest `updatedAt` database change.
- **Why it is being done (Justification):** To ensure a bulletproof Knockout Tree state and guarantee the Court Marshall cannot accidentally double-book a physical court.

### 6. Execute Phase 3: The Treasury (Commercial Capture)
- **What is being done:** Integrating Stripe to capture tournament entry fees and upsells, routing funds to ledger tables.
- **What is changing:** Installed `stripe` SDK. Added `paymentStatus` and `stripeSessionId` to the `Team` model in `schema.prisma`. Created `/api/checkout/session/route.ts` for session generation and `/api/webhooks/stripe/route.ts` for asynchronous payment confirmation and split calculation.
- **How it is being done:** Constructed API routes that safely initialize Stripe, build line items for base entry and premium upsells (High-Res Telemetry, Customized Gear). A secure webhook listener updates the team to `REGISTERED` and logs standard split percentages (10% broker fee, 5% partner payout) into the Prisma ledgers within an atomic transaction.
- **Why it is being done (Justification):** To ensure the system generates revenue and automatically distributes funds without manual accounting overhead.

### 7. Execute Phase 4.1: Player Support Bot (Agent OS)
- **What is being done:** Implementing the first AI agent endpoint (`/api/ai/agent/query`) to answer player inquiries regarding scheduling.
- **What is changing:** Added the new `ai/agent/query/route.ts` API route which handles natural language schedule inquiries.
- **How it is being done:** The endpoint reads the player's `teamId` from the session payload alongside the raw string `query`. It identifies scheduling intent and executes a `findFirst` Prisma lookup against the `Match` table for `SCHEDULED` matches linked to that team. It returns a formatted string detailing the opponent and court.
- **Why it is being done (Justification):** To automate the human overhead of the Host answering routine "when do I play next?" questions, reducing host inquiry volume.

### 8. Execute Phase 4.2: Conflict Resolution Agent
- **What is being done:** Built a backend worker endpoint (`/api/ai/agent/reschedule`) to autonomously resolve tournament bottlenecks.
- **What is changing:** Added `ai/agent/reschedule/route.ts` that calculates delayed matches.
- **How it is being done:** The endpoint queries for `IN_PROGRESS` or `WARMUP` matches where `updatedAt` is older than 90 minutes. It cross-references this with a query for idle courts (Courts with zero active matches). It compiles a `Reschedule Proposal Object` combining stuck matches with available courts and outputs it to the Host for manual approval, adhering to the "propose only" safety lock.
- **Why it is being done (Justification):** To prevent "Tournament Gridlock" by catching delayed matches before they domino into the rest of the bracket.

### 9. Execute Phase 4.3: Automated Alerts
- **What is being done:** Established a proactive push notification loop for Referees.
- **What is changing:** Created `/api/notifications/push/route.ts` and modified the Court Marshall dispatch endpoint (`dispatch/route.ts`) to fire a webhook upon state transition.
- **How it is being done:** When the Court Marshall moves a match to `READY`, the server fires a secondary `fetch` payload (`{ matchId, courtName, action: "REPORT_TO_COURT" }`) to the push notification listener.
- **Why it is being done (Justification):** To eliminate the communication gap between the Marshall assigning a court and the Referee/Players arriving at it.

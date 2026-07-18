# Testing Protocol - Sprint 6

## Objective
To rigorously test the implemented features of the Tennis Suite platform across all active User Types (HOST, REFEREE, PLAYER, MARSHALL). The goal is to identify bugs, UX friction points, and architecture bottlenecks related to our "Team-of-One/Many" decoupling and the new Referee Command Center logic.

## Scope of Testing
1. **Player/User Flow**: Authentication, Profile Onboarding, Dashboard Access.
2. **Host/Organizer Flow**: Tournament Creation, Registration configuration.
3. **Referee/Command Center Flow**: Match dispatcher, Medical Timeouts, Forfeits, and Code Violations.

## Methodology
- **Automated Agent Browsing**: We will use a headless browser subagent to navigate the UI, click through workflows, and take screenshots of the results.
- **Data Validation**: After UI actions, we will verify the database state via `prisma` queries to ensure the UI correctly updates the backend.
- **Log Review**: Monitoring the Next.js development server logs for any unhandled exceptions or connection errors (like the `EMAXCONNSESSION` we fixed).

## Procedure
1. Provision test accounts for each role (`PLAYER`, `HOST`, `REFEREE`).
2. Run end-to-end user journeys for each role.
3. Document each step, failure, and observation in `testing_log.md`.
4. Add non-critical bugs or feature requests to `backlog.md`.
5. Check off items in `testing_tasks.md`.

## Deliverables
- Comprehensive Test Results.
- Recommendations for UX and architectural improvements.
- Prioritized Backlog.

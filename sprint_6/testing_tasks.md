# Sprint 6 - Testing Tasks

- [ ] **Preparation**
  - [ ] Verify dev server is running without connection pool errors.
  - [ ] Provision/Identify test accounts for `PLAYER`, `HOST`, `REFEREE`, and `MARSHALL` roles.

- [x] **Player Flow Testing**
  - [x] Login as `PLAYER`.
  - [x] Verify Dashboard access and Passport visualization.
  - [x] Test navigating to an active tournament registration (if available).

- [ ] **Host Flow Testing** (BLOCKED by Supabase connection crash)
  - [x] Login as `HOST`.
  - [ ] Navigate to Organizer Dashboard.
  - [ ] Verify tournament creation capabilities.

- [ ] **Referee Flow Testing**
  - [ ] Login as `REFEREE`.
  - [ ] Navigate to Referee Hub (`/referee`).
  - [ ] Enter a match in the Scoring Arena.
  - [ ] Test "Match Options" overlay.
  - [ ] Test Pausing a Match (Medical Timeout).
  - [ ] Test Forfeiting a Team.
  - [ ] Test Reporting an Incident.

- [ ] **Finalization**
  - [ ] Compile recommendations.
  - [ ] Update `backlog.md` with identified issues.

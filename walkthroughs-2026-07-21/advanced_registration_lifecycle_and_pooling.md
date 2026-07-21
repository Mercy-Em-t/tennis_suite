# Walkthrough: Advanced Registration Lifecycle & Grace Periods

I have implemented the advanced registration logic, the "ball-in-the-air" grace period, and the new tabulated Roster Bucket exactly as requested.

## 1. Registration Phase State Machine
- Added robust guardrails: You can only "Open Early Registration" once. If the tournament already has teams registered, the button is disabled and reads "Early Registration Was Opened".
- I added browser `window.confirm` dialogs for both the transition to Late Registration and the permanent Closure of registrations, to prevent misclicks.
- I updated Stage 3 (Pool Manager) so it is fully unlocked and accessible the moment the tournament hits the `LATE` registration phase, allowing you to pool and seed teams while late arrivals trickle in.

## 2. 15-Minute Grace Period
I updated the backend registration API endpoint `/api/tournaments/[id]/register/route.ts` to natively support the "basketball whistle" scenario:
- When a checkout occurs, the server checks if the tournament is `CLOSED`.
- If it is closed, it evaluates the exact millisecond it was closed (`updatedAt`). 
- If less than 15 minutes have passed, the backend **accepts** the registration and flags the team with `isLateRegistration = true`. If more than 15 minutes have passed, it permanently rejects the request.

## 3. The Tabulated Roster Bucket & Rejections
I completely overhauled the "Roster Bucket" UI in Stage 2:
- I kept the original Card Grid layout but added a new **Data Table** view. You can toggle between them using the "Switch to Table View" button.
- **CSV Support**: I added a "View CSV Template Guide" link next to the CSV upload button. I also built a fully functional "Export to CSV" button on the data table that generates a spreadsheet containing all teams, categories, statuses, and late registration flags.
- **Handling Rejections**: In the table view, every `ACTIVE` team now has a "Reject" button. Clicking this triggers a backend API call that updates the team's status to `DISQUALIFIED` (rendering them slightly grayed out in the grid, but maintaining their record). They can be restored using the "Restore" button if needed.

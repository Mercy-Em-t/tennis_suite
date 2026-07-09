# Integration Stage 15 Notes

## Objectives
- Finalize the system's ability to maintain absolute financial integrity and data longevity through Monthly and Annual Cadences.
- Prove that the system can mathematically audit itself, detect cross-tenant leakage, and safely archive older tournaments to preserve edge database speeds.

## Technical Execution
- **The Sandbox API (`/api/sandbox/compliance`)**:
  - Seeds a "Compliance Archive" tournament with two paid teams and clean ledger entries.
  - Exposes an `injectErrors` boolean parameter. When `true`, it intentionally creates a mathematical cent mismatch in `LedgerEntry` and purposefully cross-links a `Match` record with a Team belonging to a different `tournamentId` to simulate a cross-tenant data leak.
- **Monthly Cadence APIs**:
  - **Ledger Verification (`/api/compliance/ledger-verify`)**: Iterates through the financial ledger. Verifies the invariant: `Gross == PlatformFee + HostPayout`.
  - **Isolation Scan (`/api/compliance/isolation-scan`)**: Verifies that every nested record belonging to a Match inherently traces back to the exact same `tournamentId`, ensuring absolute strict multi-tenancy.
- **Annual Cadence APIs**:
  - **Tax Export (`/api/compliance/tax-export`)**: A simple GET endpoint that aggregates the Ledger and outputs a structured CSV for compliance filing.
  - **Archive & Prune (`/api/compliance/archive-and-prune`)**: Wraps a destructive sequence in an atomic transaction. It selects all `Matches`, `Teams`, and `Ledgers` for a finalized tournament, maps them into a static JSON Object, and calls `deleteMany` to clear the relational footprint, keeping the PostgreSQL indexing lightweight.
- **The Compliance Control Center UI (`/sandbox/compliance`)**:
  - A dashboard featuring toggles to inject sandbox errors, panels to run the mathematical and security invariants, and one-click triggers to download the Tax CSV and JSON Cold-Storage Snapshots.

# The Tournament Object: Implementation Plan

We are shifting focus in Sprint 20 from building UI sandboxes to designing the foundational data architecture of the Tennis Suite: **The Tournament Object**. 

Since we have already mapped out the roles (Host, Delegate, Marshall, Umpire, Broadcaster, Network), the Tournament Object must act as the single source of truth that all these personas interact with.

## Goal Description
Design a robust, scalable data schema (likely Prisma/SQL or TypeScript interfaces) for the `Tournament` entity. It must encapsulate tournament metadata, financials, staffing roles, courts, matches, and the global audit/state flags.

## Proposed Data Architecture (High-Level)

I propose breaking the Tournament Object down into several related sub-models:

### 1. `Tournament` (The Root Object)
- **ID & Metadata**: `name`, `startDate`, `endDate`, `location`, `status` (DRAFT, REGISTRATION, LIVE, SUSPENDED, COMPLETED).
- **Financials (For Host & Delegate)**: `entryFee`, `totalPrizePool`, `collectedRevenue`.
- **Global State**: `systemSuspended` (The Kill Switch flag), `activeOverrides`.

### 2. Relationships (One-to-Many)
- **`Courts`**: Array of court objects (`name`, `status`, `assignedMarshallId`).
- **`Matches`**: Array of match objects (`category`, `round`, `team1`, `team2`, `score`, `status`, `assignedUmpireId`).
- **`Staff` (Personas)**: Array of user/staff assignments linking to the `User` table (`role`: HOST, DELEGATE, MARSHALL, UMPIRE, BROADCASTER, NETWORK).
- **`AuditLogs`**: The immutable ledger of actions taken by the Delegate or Host.
- **`BroadcastAlerts`**: Global messages pushed to specific roles.

### 3. "Fail-Safe" Sync Data (For Network Admin)
- The object will need a `lastSynced` timestamp and a mechanism for edge nodes/local devices to cache this object offline and resolve conflicts when reconnecting.

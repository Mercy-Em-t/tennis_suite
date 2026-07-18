# Tennis Suite: System Access & Role Branches

## Overview
Tennis Suite implements a strict **Walled Garden** architecture. When a user authenticates, a JWT is issued containing their assigned `role`. The Edge Middleware intercepts all requests and enforces role-based routing—meaning a user is automatically redirected to the dashboard meant for them, and completely blocked from accessing unauthorized sections.

## System Map

```mermaid
graph TD
    %% Public Access
    User((User)) --> Entry[Tennis Suite Web App]
    Entry --> AuthCheck{Authenticated?}
    AuthCheck -- "No" --> Public[Public Routes]
    
    %% Public Routes
    Public --> Login[/login]
    Public --> Register[/register]
    Public --> Checkout[/checkout]
    
    %% Authentication Layer
    AuthCheck -- "Yes (Has JWT)" --> Middleware[Edge Middleware Guard]
    Middleware --> RoleCheck{Decode 'role'}
    
    %% Walled Gardens
    RoleCheck -- "ADMIN / HOST" --> AdminG[Admin / Host Garden]
    RoleCheck -- "REFEREE" --> RefG[Referee Garden]
    RoleCheck -- "BROADCASTER" --> BroadG[Broadcaster Garden]
    RoleCheck -- "PLAYER" --> PlayerG[Player Garden]
    RoleCheck -- "MARSHALL" --> MarshallG[Marshall Garden]
    
    %% Garden Capabilities
    AdminG -->|Path: /admin| A_Perms[Global Config, Manage Teams, Override Status]
    RefG -->|Path: /referee| R_Perms[Live Score Entry, Sync Points, Trigger Tiebreaks]
    BroadG -->|Path: /broadcast| B_Perms[Live Feed, Score Overlays, Real-time Stats]
    PlayerG -->|Path: /team| P_Perms[View Schedule, Agent OS Chat, Next Match]
    MarshallG -->|Path: /tournaments| M_Perms[Dispute Resolution, Master Schedule]
    
    %% API Protection
    A_Perms -.-> API[API Layer / requireAuth Guard]
    R_Perms -.-> API
    B_Perms -.-> API
    P_Perms -.-> API
    M_Perms -.-> API
    
    style User fill:#f9f9f9,stroke:#333,stroke-width:2px,color:#000
    style Middleware fill:#238636,stroke:#333,stroke-width:2px
    style RoleCheck fill:#1f6feb,stroke:#333,stroke-width:2px
    style API fill:#a371f7,stroke:#333,stroke-width:2px
```

## Role Details & Boundaries

### 1. ADMIN / HOST
* **Path**: `/admin`
* **Visibility**: Complete system access.
* **Capabilities**: Can create/publish tournaments, manage all teams, override live match status, and view raw telemetry (Validation Sandbox).
* **Restrictions**: None.

### 2. REFEREE
* **Path**: `/referee`
* **Visibility**: Only sees matches they are actively assigned to officiate.
* **Capabilities**: Live score mutation (`/api/match/score`), offline queue syncing, marking warmups/completion.
* **Restrictions**: Blocked from modifying tournament rules or accessing other referees' match data.

### 3. BROADCASTER
* **Path**: `/broadcast`
* **Visibility**: Real-time read-only view of active match states.
* **Capabilities**: Subscribes to Server-Sent Events (SSE) for overlay updates.
* **Restrictions**: Blocked from modifying any match states.

### 4. PLAYER
* **Path**: `/team`
* **Visibility**: Only sees their team's schedule and head-to-head records.
* **Capabilities**: Interacting with Agent OS (AI Player Support) and viewing upcoming matches.
* **Restrictions**: Completely blocked from seeing other teams' private strategies or mutating any match scores.

### 5. MARSHALL
* **Path**: `/tournaments`
* **Visibility**: Master view of all courts and matches.
* **Capabilities**: Dispute resolution and assigning referees to courts.
* **Restrictions**: Cannot act as a referee for a specific match or override live scores directly.

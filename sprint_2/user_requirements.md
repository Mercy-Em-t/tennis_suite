# User Requirements Document

This document defines the specific user requirements derived from the User Stories (Gate 1).

## 1. Player Requirements
- **UR-1.1 (Matchmaking)**: The system shall allow a player to join a matchmaking queue and be matched with opponents within a 10% skill differential based on XP/Elo.
- **UR-1.2 (Score Logging)**: The system shall permit players to input match scores point-by-point or post-match.
- **UR-1.3 (Progression)**: The system shall automatically update a player's global ranking and XP upon the verified conclusion of a match.

## 2. Facility Manager / Club Owner Requirements
- **UR-2.1 (Court Booking)**: The system shall automatically allocate available courts to scheduled matches without overlaps.
- **UR-2.2 (Buffer Times)**: The system shall enforce a minimum configurable buffer time (e.g., 10 minutes) between bookings on the same court.
- **UR-2.3 (Financial Ledger)**: The system shall log all transaction events (e.g., court fees, tournament entry) into an immutable financial ledger.

## 3. Tournament Director Requirements
- **UR-3.1 (Bracket Generation)**: The system shall automatically generate tournament brackets (single-elimination or round-robin) based on player entries and seedings.
- **UR-3.2 (Byes)**: The system shall automatically assign byes to the highest seeds if the total participant count is not a power of 2.

## 4. Broadcaster & Referee Requirements
- **UR-4.1 (Live Overlay)**: The system shall provide a real-time (sub-200ms delay) scoreboard overlay accessible via a dedicated URL for broadcasting.
- **UR-4.2 (Time Alerts)**: The system shall automatically alert designated Referees if a match exceeds its scheduled duration by more than 15 minutes.

# Player & Spectator Module Documentation

This document outlines the architecture, routing, and gamification implementation for the **Player Module** and the **Public Spectator Portals** developed during Sprint 5. 

The goal of this module is to abstract the player experience into a scalable multi-tournament hub while introducing automated gamification loops (XP) and transparent public data (Leaderboards, Live Brackets).

## 1. Gamification Engine (Global XP)

To incentivize engagement, we implemented an automated baseline XP calculation tightly integrated with the Referee Match Engine.

### Workflow
1. **Match Completion:** When a Referee marks a match as `COMPLETED` (`PATCH /api/tournaments/[id]/matches/[matchId]/score`), the API intercepts the `winnerId`.
2. **XP Distribution:** A Prisma Transaction loops over all `User` players within the winning and losing teams.
3. **Baseline Awards:**
   - **Winners:** Automatically awarded `+10 XP`.
   - **Losers:** Automatically awarded `+2 XP` for participation.
4. **Ranking Algorithm:** XP is cumulative and persists perpetually on the `User` model, dictating their Global Rank and Level threshold.

## 2. Global Leaderboards (`/leaderboards`)

A sleek, public-facing leaderboard accessible to anyone without authentication.
- **API Endpoint:** `GET /api/public/leaderboards` safely fetches the top 100 `PLAYER` accounts sorted by `globalXp` descending.
- **UI Presentation:** Displays Rank (#1 gets Gold styling, #2 Silver, #3 Bronze), total XP, dynamically calculated Player Level, and any earned Badges.

## 3. The Player Dashboard Architecture

We completely abstracted the Player Dashboard from a "Single-Tournament MVP" to a scalable, two-layered Hub designed to handle players participating in dozens of concurrent tournaments.

### Layer 1: The Global Player Hub (`/team`)
This is the primary routing destination upon logging in as a `PLAYER`.
- **Global Gamification Stats:** Displays current Global XP, next Level threshold, and earned Badges.
- **My Tournaments Grid:** Renders a list of all active and historic tournaments the player is attached to. Clicking a card routes them to Layer 2.
- **Discover Tournaments Grid:** An automated marketplace. It dynamically queries `isActive: true` tournaments where the `registrationPhase` is not `CLOSED`, allowing players to easily find new events.
- **API Endpoint:** `GET /api/player/dashboard` fetches the high-level macro data (all teams attached to the user).

### Layer 2: Tournament-Specific Dashboard (`/team/tournaments/[id]`)
A micro-dashboard focused strictly on a single event, designed as a "Pro Experience" Command Center.
- **The Match Hub (Logistics & Readiness):** Displays the exact schedule. If a match is set to `READY` by the Court Marshal, the UI emits a glowing, infinite pulse (via `framer-motion`), signaling the player to report to the court immediately. Contextual iconography (`lucide-react`) is used to surface Court and Opponent data.
- **Intra-Pool Leaderboard:** A specialized component that fetches the specific pool the player belongs to. It automatically isolates and highlights the active player's row using a distinct neon accent, making their standing instantly scannable.
- **Social & Performance Stubs:** Establishes visual domains for a future "Highlights Library" (auto-generated video clips) and a "Player Ledger" (financial wallet for registration fees and prize money).
- **API Endpoint:** `GET /api/player/tournaments/[id]` guarantees isolation by strictly querying matches linked to that specific `tournamentId`, along with a nested query fetching their specific `Pool` assignments.

## 4. Public Live Portals (`/live/[id]`)

A beautifully designed, read-only "Spectator View" intended for players, families, and fans to monitor the tournament in real-time from the stands.
- **API Security:** Powered by `GET /api/public/tournaments/[id]`, which bypasses the strict `HOST/REFEREE` RBAC checks while purposefully omitting sensitive host configuration data.
- **Standings Tab:** Reads from `PoolTeam.stats` to dynamically generate W/L records for the Pool stages.
- **Interactive Knockout Canvas:** We replaced static DOM brackets with a sprawling `framer-motion` SVG Canvas. Spectators on mobile or desktop can physically grab, drag, and pan around the Knockout Draw in a free-roaming environment to explore potential pathways.
- **Order of Play Tab:** Isolates matches that are strictly `SCHEDULED` or `IN_PROGRESS`, showing exactly who is playing on which `Court`.

## 5. Digital Tennis Passport & Onboarding

To fully realize the player as a permanent entity across tournaments, we expanded the `User` schema into a comprehensive "Digital Tennis Passport."

### Database Schema Evolution
The `User` model was enhanced with new profile clusters:
- **Identity & Social:** Added `avatarUrl`, `socialHandle`, and a `trustScore` (baseline 100%, designed to track reliability like no-shows).
- **Performance & Skill Matrix:** Added `skillLevel` (e.g., NTRP 4.5), `playstyle` (e.g., "Aggressive Baseliner"), and `winRate`.
- **Tournament Context:** Added `availability` (JSON) and `emergencyContact` for physical safety at events.

### The Onboarding Wizard (`/register`)
We completely revamped the player registration flow into a frictionless, multi-step Framer Motion wizard:
- Eliminates the previous "tournament-first" friction by letting players create their standalone global account seamlessly.
- Incorporates secure password hashing (`bcrypt`) at the `/api/auth/register` endpoint, fixing a previous issue where passwords were not correctly established.
- Progressively collects the new Passport data (skill level, playstyle, social handle) without overwhelming the user on the first screen.

### The Player Passport View (`/team/profile`)
A dedicated, highly visual "ID Card" that aggregates the player's global standing.
- **Performance Matrix:** Displays a dynamic `recharts` Radar Chart visualizing the player's attributes (Power, Speed, Stamina, etc.).
- **Public vs. Private View:** Players can toggle to edit their private settings (Emergency Contact, Availability) or view their public facing stats.
- **Styling Standards:** This component serves as the flagship implementation of our **Vanilla CSS Modules** architecture (`PlayerPassport.module.css`). We strictly eschewed Tailwind utility classes to ensure structural integrity and maximum layout control, producing a beautiful, premium glassmorphism aesthetic that is entirely responsive.

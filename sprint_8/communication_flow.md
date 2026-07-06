# Essential Communication Flow

This document details the critical communication pathways across the Tennis Suite project, specifically mapped to the newly implemented OSI architecture.

## 1. Client to Server (Agent Support Chat)
**Who:** `AgentChat.tsx` (Client UI) → `ServerApplicationModule.ts` (Backend)
**How:** 
1. **L7 (App):** UI calls `applicationLayer.sendMessage()`.
2. **L5 (Session):** Attaches `session_id` and metadata.
3. **L4 (Transport):** Sends POST request via `fetch` to `/api/osi/message`.
4. **Backend L4 → L5 → L7:** Server receives, validates token via `verifyToken`, and routes to AI logic.
**Why:** To provide players with AI-assisted answers regarding schedules, formats, and rules.
**When:** Triggered on-demand when a user types a query and clicks "Send" in the support widget.

## 2. Server to Client (Live Score Broadcasting)
**Who:** Database/Backend → Broadcaster Clients (Live views)
**How:** 
1. **Connection:** Clients establish a persistent HTTP connection to `/api/broadcast/sse`.
2. **Transport:** Server-Sent Events (SSE) push `text/event-stream` packets.
3. **Trigger:** The server polls the database continuously and pushes deltas when `scoreState` changes.
**Why:** To ensure sub-200ms latency for live match score updates on public-facing screens without the overhead of full WebSocket state management.
**When:** Automatically, whenever an umpire or system updates a match score in the database.

## 3. Client to Database (Session Validation)
**Who:** `ServerSessionModule.ts` (Backend L5) → `auth.ts` / Prisma DB
**How:** 
1. The backend L5 intercepts incoming OSI messages.
2. Extracts the `session_id` (JWT) from the message header.
3. Uses `jwtVerify` (jose) and checks the signature.
**Why:** To enforce strict Role-Based Access Control and ensure that injected payloads (like chat requests) are tied to a verified `playerId`.
**When:** On every single incoming OSI message transmission.

## Summary
By enforcing the OSI structure, communication logic is decoupled:
- **UI Components** only care about L7 payloads.
- **Security Logic** only cares about L5 tokens.
- **Network Routing** only cares about L4 delivery mechanics (fetch/SSE).

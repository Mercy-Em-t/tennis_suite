# Software Requirement Specification (SRS)

## 1. Introduction
This SRS details the functional and non-functional requirements for the Tennis Suite application.

## 2. Functional Requirements
- **FR-1**: The system shall implement a Role-Based Access Control (RBAC) middleware supporting roles: HOST, ADMIN, REFEREE, BROADCASTER, PLAYER, MARSHALL.
- **FR-2**: The scoring engine shall calculate game states deterministically (Love, 15, 30, 40, Deuce, Ad) and handle tiebreak edge cases.
- **FR-3**: The system shall utilize Server-Sent Events (SSE) to broadcast match state changes to subscribed clients.
- **FR-4**: The Outlier Detection engine shall flag matches where score input frequency deviates from historical norms by more than 3 standard deviations (anti-smurfing/botting).

## 3. External Interface Requirements
- **EI-1**: The application shall interface with a Supabase PostgreSQL database via Prisma ORM using connection pooling (Session and Transaction modes).
- **EI-2**: The frontend shall communicate with the backend exclusively via Next.js App Router API endpoints and Server Actions.

## 4. Non-Functional Requirements (Quality Attributes)
### 4.1 Performance & Reliability
- **NFR-1**: API routes handling scoring telemetry must respond within 100ms at the edge.
- **NFR-2**: The SSE connection must support up to 5,000 concurrent listeners per tenant without dropping the stream.
### 4.2 Security
- **NFR-3**: All role-based access must be enforced at the Edge Middleware level via stateless JWT verification.
- **NFR-4**: Database queries must be executed via Prisma ORM to prevent SQL injection.
### 4.3 Scalability
- **NFR-5**: The architecture must support multi-tenant deployments via subdomain routing (e.g., `club1.tennissuite.dev`).

## 5. Process & Design Constraints
- **C-1**: The system must be hosted on Vercel and utilize Turbopack for local development.
- **C-2**: Styling must be implemented strictly via Vanilla CSS Modules to ensure lightweight payload and strict encapsulation.

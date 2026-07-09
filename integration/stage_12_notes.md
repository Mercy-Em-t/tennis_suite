# Integration Stage 12 Notes

## Objectives
- Provide real-time hardware telemetry and connection surveillance for tournament operations.
- Monitor court network latencies and disconnects to prevent silent operational failures.

## Technical Execution
- **The Telemetry Aggregator (`src/lib/telemetry.ts`)**:
  - Implemented an in-memory `TelemetryStore` running on the Next.js Node server.
  - Using memory over PostgreSQL avoids writing thousands of rows per minute for ephemeral heartbeat data.
  - Emits an internal `update` event via `EventEmitter` every time a ping is processed or when the background cleanup interval detects a timeout.
- **The Telemetry Endpoints**:
  - `POST /api/monitor/ping`: Consumes `{ courtId, clientTimestamp }` payloads from the client. Calculates precise latency using `serverTimestamp - clientTimestamp`.
  - `GET /api/monitor/stream`: Exposes the entire aggregator state via SSE to the Technical Dashboard, ensuring immediate visual feedback.
- **The Interfaces**:
  - **Court Client (`/sandbox/monitor/court`)**: A simulator that pings the aggregator every 3 seconds. Features controls to artificially inflate latency (simulate weak WiFi) or sever the connection completely.
  - **Technical Dashboard (`/sandbox/monitor/dashboard`)**: A master control interface that consumes the SSE stream. Courts are displayed as grid cards that instantly flash yellow (`LATENCY_WARNING`) if ping response exceeds 500ms, or flash red (`OFFLINE`) if 5 seconds pass without a heartbeat.

# Daily Telemetry Pulse

## Overview
This document outlines the Daily Live-Telemetry (The Tournament Engine) loop. The telemetry system ingests real-time score mutations and broadcasts them to the host overlay via WebSockets (Server-Sent Events). 

## Verification Agents
- **`loop1_telemetry.test.ts`**: Simulates the heartbeat of the tournament engine.
  - Validates **Offline-State Outbox Validation**, verifying that network-dropped offline payloads are chronologically sorted and replayed.
  - Benchmarks **WebSocket Ingestion Health Check**, ensuring the event emitter latency for point mutation remains strictly under the 200ms threshold.

## Status
- **Tests Passing**: Verified
- **Latency**: < 200ms
- **State**: ACTIVE

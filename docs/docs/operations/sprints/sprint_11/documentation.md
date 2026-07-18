# Sprint 11: System Monitor Documentation

## Overview
The System Monitor (Technical Director) is a specialized "human-in-the-loop" role designed to ensure the technological "heartbeat" of a live event remains stable. This role monitors stream health, network reliability, and executes emergency interventions to prevent the public broadcast from failing during high-traffic matches.

## Telemetry Architecture
- **Heartbeat Ingestion (`SystemHealthService`)**: Receives a periodic pulse from all active clients (Referee PWAs, Broadcaster overlays). 
- **Metrics Tracked**: `latencyMs`, `packetLossPercent`, and `timeSincePulse`.
- **Status Thresholds**:
  - **GREEN**: Latency < 500ms, Packet Loss < 10%, Heartbeat within 2 seconds.
  - **AMBER**: Latency > 500ms, or Heartbeat older than 2 seconds (Degraded).
  - **RED**: Heartbeat older than 5 seconds, or Packet Loss > 10% (Critical/Disconnected).

## Intervention Protocols
- **Hot-Swap Routing (`hotSwapStream`)**: Instantly reroutes a degraded broadcast stream to a backup encoder IP without interrupting the frontend.
- **Connection Reset (`forceConnectionReset`)**: Forces a specific node (e.g., a frozen Referee PWA) to cleanly sever and re-handshake its WebSocket.
- **Technical Audit Trail**: All interventions are immutably logged with the Monitor's `adminId` and timestamp to ensure accountability for system overrides.

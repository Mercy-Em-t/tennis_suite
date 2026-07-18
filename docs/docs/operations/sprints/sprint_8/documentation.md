# OSI Architecture Specification

## Technical Specification

### Layer Mappings

- **Layer 7 (Application):** User interface, message content, payload identification.
  - *Current Locations:* Chat logic in `src/components/AgentChat.tsx`, Game logic in `src/lib/engine/` (e.g., `scoring.ts`, `progression.ts`).
- **Layer 5 (Session):** Session token validity, user-to-user association.
  - *Current Locations:* `src/middleware.ts`, `src/lib/auth/`, `src/app/api/auth/`.
- **Layer 4 (Transport):** Packet loss, flow control, TCP/socket error handling.
  - *Current Locations:* Server-Sent Events (SSE) streams in `src/app/api/broadcast/sse/route.ts`, Notification endpoints in `src/app/api/notifications/route.ts`.
- **Layer 3 (Network):** Routing and logical addressing (IPs).
  - *Current Locations:* Underlying Next.js routing and standard HTTPS/TCP handled by the host environment.

## Layer-Specific State Definitions
*(To be defined during Phase 2)*

## Verification Test Strategy
At the end of the sprint, the team must perform the "Layer Check" exercise:
1. **Scenario:** "User reports messages show 'sent' in UI but are never received."
2. **Evaluation:** Require the team to classify the root cause based on the OSI layer.
3. **Success Metric:** Team identifies the specific layer (e.g., L4 for transport loss vs. L5 for session timeout) rather than stating "the app is broken."

## Inter-Layer API Contract Template
```json
// API Contract: SessionToTransport_Interface
{
  "interface_version": "1.0",
  "source_layer": "Layer 5 (Session)",
  "target_layer": "Layer 4 (Transport)",
  "method": "transmit_message",
  "parameters": {
    "session_id": "string (unique identifier for active user session)",
    "payload": "object (the actual message content)",
    "priority": "integer (QoS level)",
    "metadata": {
      "sender_id": "string",
      "recipient_id": "string",
      "timestamp": "ISO-8601"
    }
  },
  "callback_handlers": {
    "on_success": "acknowledgment_received",
    "on_failure": "retry_or_alert"
  }
}
```

## Standardized Inter-Layer Error Codes

| Error Code | Layer Origin | Description | Troubleshooting Focus |
| --- | --- | --- | --- |
| `ERR_SESSION_EXPIRED` | Layer 5 | User session token is invalid or timed out. | Check Auth/Session database. |
| `ERR_SESSION_MISMATCH` | Layer 5 | Sender/Recipient ID association is incorrect. | Check User-Session mapping. |
| `ERR_TRANSPORT_TIMEOUT` | Layer 4 | The network path is unreachable or slow. | Check Network latency/routing. |
| `ERR_TRANSPORT_LOST` | Layer 4 | Packet loss encountered during transmission. | Check Flow control/TCP health. |
| `ERR_PAYLOAD_MALFORMED` | Layer 7 | Data format does not meet API requirements. | Check Application serialization. |

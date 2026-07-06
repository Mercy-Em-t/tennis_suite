// Layer 5: Session Module
import { transportLayer } from './TransportModule';
import { MessageObject, OsiError, OsiErrorCode } from './types';

export class SessionModule {
  /**
   * validateAndTransmit checks the session state and delegates to L4.
   * It DOES NOT handle TCP/WebSocket logic; it relies entirely on TransportModule.
   */
  public transmit(
    message: MessageObject,
    callbacks: { on_success: (data?: any) => void; on_failure: (err: OsiError) => void }
  ) {
    // 1. Session validation logic
    if (!message.header.session_id) {
      return callbacks.on_failure({
        status: 'failure',
        error_code: OsiErrorCode.ERR_SESSION_EXPIRED,
        message: 'User session token is invalid or timed out.',
        suggested_action: 'Check Auth/Session database.',
      });
    }

    if (!message.header.sender_id || !message.header.recipient_id) {
      return callbacks.on_failure({
        status: 'failure',
        error_code: OsiErrorCode.ERR_SESSION_MISMATCH,
        message: 'Sender/Recipient ID association is incorrect.',
        suggested_action: 'Check User-Session mapping.',
      });
    }

    // 2. Prepare payload for Transport Layer (Standardized API Contract)
    const transportParams = {
      session_id: message.header.session_id,
      payload: message.payload,
      priority: 1,
      metadata: {
        sender_id: message.header.sender_id,
        recipient_id: message.header.recipient_id,
        timestamp: message.header.timestamp,
      },
    };

    // 3. Hand off to L4 (Strict Layering)
    transportLayer.transmit_message(transportParams, callbacks);
  }
}

export const sessionLayer = new SessionModule();

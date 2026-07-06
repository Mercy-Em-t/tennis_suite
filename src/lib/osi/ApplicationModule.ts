// Layer 7: Application Module
import { sessionLayer } from './SessionModule';
import { MessageObject, OsiError, OsiErrorCode } from './types';

export class ApplicationModule {
  /**
   * sendMessage formats data and sends it down to L5.
   * It handles UI-facing error bubbling from the lower layers.
   */
  public sendMessage(
    payload: any, 
    senderId: string, 
    recipientId: string, 
    sessionId: string,
    callbacks: { on_success: (responsePayload?: any) => void; on_failure: (error: OsiError) => void }
  ) {
    if (!payload) {
      console.error('[L7] Payload Malformed');
      return;
    }

    const message: MessageObject = {
      header: {
        session_id: sessionId,
        sender_id: senderId,
        recipient_id: recipientId,
        timestamp: new Date().toISOString(),
      },
      payload,
    };

    // Application Layer talks exclusively to Session Layer (L5)
    sessionLayer.transmit(message, {
      on_success: (data?: any) => {
        console.log(`[L7] UI Update: Message sent successfully!`);
        callbacks.on_success(data);
      },
      on_failure: (error: OsiError) => {
        // Error Bubbling: Lower layer errors trigger specific user alerts in L7
        console.error(`[L7] UI Alert Triggered: ${error.message} (Code: ${error.error_code})`);
        
        switch (error.error_code) {
          case OsiErrorCode.ERR_TRANSPORT_TIMEOUT:
          case OsiErrorCode.ERR_TRANSPORT_LOST:
            console.log('[L7] UI Notification: "Connection Issue. Please check your network."');
            break;
          case OsiErrorCode.ERR_SESSION_EXPIRED:
            console.log('[L7] UI Notification: "Session Expired. Please log in again."');
            break;
          case OsiErrorCode.ERR_SESSION_MISMATCH:
            console.log('[L7] UI Notification: "Internal Error. Recipient cannot be reached."');
            break;
          case OsiErrorCode.ERR_PAYLOAD_MALFORMED:
            console.log('[L7] UI Notification: "Failed to send: data format error."');
            break;
          default:
            console.log('[L7] UI Notification: "Message Failed."');
            break;
        }
        callbacks.on_failure(error);
      },
    });
  }
}

export const applicationLayer = new ApplicationModule();

import { MessageObject, OsiError, OsiErrorCode } from '../osi/types';
import { edgeClientLayer } from './EdgeClientModule';
import { transportLayer } from '../osi/TransportModule';

/**
 * SyncReconciliationModule: The "Outbox" Pattern
 * Manages the background syncing of the `sync_buffer` when network drops.
 */
export class SyncReconciliationModule {
  private isSyncing = false;

  /**
   * Attempts to flush the locally cached outbox to the server.
   */
  public async sync_buffer(onProgress?: (left: number) => void): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const outbox = edgeClientLayer.getOutbox();
    if (outbox.length === 0) {
      this.isSyncing = false;
      return;
    }

    console.log(`[SyncModule] Attempting to flush ${outbox.length} messages...`);

    for (const msg of outbox) {
      try {
        await this.transmitSingle(msg);
        edgeClientLayer.clearMessage(msg.header.timestamp);
        if (onProgress) onProgress(edgeClientLayer.getOutbox().length);
      } catch (err: any) {
        console.warn(`[SyncModule] Sync failed. Network still unreachable.`);
        break; // Stop syncing, wait for next heartbeat
      }
    }

    this.isSyncing = false;
  }

  /**
   * Helper to wrap Transport transmit in a Promise
   */
  private transmitSingle(message: MessageObject): Promise<void> {
    return new Promise((resolve, reject) => {
      // In a real OSI flow, we'd go up to Session, but here we are bypassing
      // specifically for raw payload resyncing via Transport.
      // Alternatively, we use `fetch` directly or refactor transportLayer.
      // Since transportLayer is a singleton that accepts parameters, we can call it.
      
      const transportLayerInstance = new (require('../osi/TransportModule').TransportModule)();
      
      transportLayerInstance.transmit_message(
        {
          session_id: message.header.session_id,
          payload: message.payload,
          priority: 1,
          metadata: {
            sender_id: message.header.sender_id,
            recipient_id: message.header.recipient_id,
            timestamp: message.header.timestamp
          }
        },
        {
          on_success: () => resolve(),
          on_failure: (error: OsiError) => {
            if (error.error_code === OsiErrorCode.ERR_TRANSPORT_TIMEOUT || error.error_code === OsiErrorCode.ERR_TRANSPORT_LOST) {
              reject(error);
            } else {
              // Non-network errors (like Session Expired) mean we shouldn't retry silently
              resolve(); 
            }
          }
        }
      );
    });
  }
}

export const syncReconciliationLayer = new SyncReconciliationModule();

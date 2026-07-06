// Layer 4: Transport Module
import { OsiError, OsiErrorCode, SessionToTransportInterface } from './types';

export class TransportModule {
  /**
   * transmit_message is called by Layer 5 to send a message over the network.
   * This module is purely responsible for reliable message delivery via HTTP.
   */
  public async transmit_message(
    params: SessionToTransportInterface['parameters'],
    callbacks: SessionToTransportInterface['callback_handlers']
  ) {
    try {
      // Execute the real network transport
      const response = await fetch('/api/osi/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw { code: OsiErrorCode.ERR_TRANSPORT_TIMEOUT };
      }

      const data = await response.json();
      
      // If the server-side OSI stack returns an encapsulated failure (e.g. Session Expired)
      if (data.status === 'failure') {
        return callbacks.on_failure(data as OsiError);
      }

      // We expect the server to return the payload in a standard structure
      callbacks.on_success(data.payload);
    } catch (e: any) {
      // Catch transport-level HTTP/Network errors and bubble them up
      if (e.code === OsiErrorCode.ERR_TRANSPORT_TIMEOUT || e.name === 'TypeError') { // TypeError usually means fetch network fail
        callbacks.on_failure({
          status: 'failure',
          error_code: OsiErrorCode.ERR_TRANSPORT_TIMEOUT,
          message: 'The network path is unreachable or slow.',
          suggested_action: 'Check Network latency/routing.',
        });
      } else {
        callbacks.on_failure({
          status: 'failure',
          error_code: OsiErrorCode.ERR_TRANSPORT_LOST,
          message: 'Packet loss encountered during transmission.',
          suggested_action: 'Retry after backoff or check connection status.',
        });
      }
    }
  }
}

export const transportLayer = new TransportModule();

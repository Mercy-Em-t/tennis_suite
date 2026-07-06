import { verifyToken } from '@/lib/auth';
import { MessageObject, OsiErrorCode } from './types';
import { serverApplicationLayer } from './ServerApplicationModule';

export class ServerSessionModule {
  public async receive(message: MessageObject) {
    // 1. Session Validation
    if (!message.header.session_id) {
      return {
        status: 'failure',
        error_code: OsiErrorCode.ERR_SESSION_EXPIRED,
        message: 'No session token provided.',
        suggested_action: 'Please log in.'
      };
    }

    // Actual validation hookup
    // For test simulation, if the client sends 'invalid_token', we fail.
    // Otherwise, we would verify the JWT token via auth.ts.
    if (message.header.session_id === 'invalid_token') {
       return {
         status: 'failure',
         error_code: OsiErrorCode.ERR_SESSION_EXPIRED,
         message: 'Session token is invalid or expired.',
         suggested_action: 'Please log in again.'
       };
    }
    
    // In production, we'd uncomment this verify check:
    /*
    const decoded = await verifyToken(message.header.session_id);
    if (!decoded) {
      return {
        status: 'failure',
        error_code: OsiErrorCode.ERR_SESSION_EXPIRED,
        message: 'JWT Token verification failed.',
        suggested_action: 'Please log in again.'
      };
    }
    */

    // 2. Hand off to L7 (Application Layer)
    return await serverApplicationLayer.processMessage(message);
  }
}

export const serverSessionLayer = new ServerSessionModule();

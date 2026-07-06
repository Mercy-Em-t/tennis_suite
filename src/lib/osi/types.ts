// Standardized Error Codes for Inter-Layer Communication
export enum OsiErrorCode {
  ERR_SESSION_EXPIRED = 'ERR_SESSION_EXPIRED',
  ERR_SESSION_MISMATCH = 'ERR_SESSION_MISMATCH',
  ERR_TRANSPORT_TIMEOUT = 'ERR_TRANSPORT_TIMEOUT',
  ERR_TRANSPORT_LOST = 'ERR_TRANSPORT_LOST',
  ERR_PAYLOAD_MALFORMED = 'ERR_PAYLOAD_MALFORMED',
  ERR_RETRY = 'ERR_RETRY',
  ERR_SYNC_CONFLICT = 'ERR_SYNC_CONFLICT',
  ERR_CRITICAL_DISCONNECT = 'ERR_CRITICAL_DISCONNECT',
}

export interface OsiError {
  status: 'failure';
  error_code: OsiErrorCode;
  message: string;
  suggested_action: string;
}

export interface MessageMetadata {
  sender_id: string;
  recipient_id: string;
  timestamp: string; // ISO-8601
}

// Encapsulated Message Object
export interface MessageObject<T = any> {
  header: {
    session_id: string;
  } & MessageMetadata;
  payload: T;
}

// Session-to-Transport Interface API Contract
export interface SessionToTransportInterface {
  interface_version: '1.0';
  source_layer: 'Layer 5 (Session)';
  target_layer: 'Layer 4 (Transport)';
  method: 'transmit_message';
  parameters: {
    session_id: string;
    payload: any;
    priority: number;
    metadata: MessageMetadata;
  };
  callback_handlers: {
    on_success: (data?: any) => void;
    on_failure: (error: OsiError) => void;
  };
}

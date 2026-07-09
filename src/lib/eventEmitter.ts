import { EventEmitter } from 'events';

// Create a global singleton event emitter to survive Next.js HMR in development
// and provide a simple in-memory pub/sub mechanism.
const globalForEvents = global as unknown as { matchEventEmitter: EventEmitter };

export const matchEventEmitter =
  globalForEvents.matchEventEmitter || new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.matchEventEmitter = matchEventEmitter;
}

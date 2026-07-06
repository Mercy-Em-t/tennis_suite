import { MessageObject } from '../osi/types';

/**
 * EdgeClientModule: Offline-First Logic
 * Intercepts outgoing messages, caching them locally before network transmission.
 */
export class EdgeClientModule {
  private STORAGE_KEY = 'tennis_suite_outbox';

  public async cacheMessage(message: MessageObject): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const existing = this.getOutbox();
      existing.push(message);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing));
      console.log(`[EdgeClient] Cached message locally: ${message.header.session_id}`);
    } catch (e) {
      console.error('[EdgeClient] Failed to cache message locally', e);
    }
  }

  public getOutbox(): MessageObject[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public clearMessage(timestamp: string): void {
    if (typeof window === 'undefined') return;
    const existing = this.getOutbox();
    const updated = existing.filter(msg => msg.header.timestamp !== timestamp);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }
}

export const edgeClientLayer = new EdgeClientModule();

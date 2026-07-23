export interface SyncAction {
  eventId: string;
  matchId: string;
  action: string;
  timestamp: number;
  sequence: number;
}

export type ConflictResolutionHandler = (
  serverScore: any,
  localScore: any,
  resolve: (choice: 'SERVER' | 'LOCAL') => void
) => void;

class OfflineSyncManagerClass {
  private queueKey = 'tennis_suite_sync_queue';
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private isSyncing = false;
  private conflictHandler: ConflictResolutionHandler | null = null;
  private currentSequence = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const q = this.getQueue();
      if (q.length > 0) {
        this.currentSequence = Math.max(...q.map(a => a.sequence)) + 1;
      }
    }
  }

  public registerConflictHandler(handler: ConflictResolutionHandler) {
    this.conflictHandler = handler;
  }

  public startSyncLoop(intervalMs = 3000) {
    if (typeof window === 'undefined') return;
    if (this.syncInterval) clearInterval(this.syncInterval);
    
    this.syncInterval = setInterval(() => this.syncNow(), intervalMs);
    window.addEventListener('online', () => this.syncNow());
  }

  public stopSyncLoop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private getQueue(): SyncAction[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(this.queueKey) || '[]');
    } catch {
      return [];
    }
  }

  private setQueue(queue: SyncAction[]) {
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
  }

  public pushAction(matchId: string, action: string) {
    const q = this.getQueue();
    const eventId = crypto.randomUUID();
    const syncAction: SyncAction = {
      eventId,
      matchId,
      action,
      timestamp: Date.now(),
      sequence: this.currentSequence++,
    };
    q.push(syncAction);
    this.setQueue(q);
    
    // Attempt immediate sync
    if (navigator.onLine) {
      this.syncNow();
    }
  }

  public async syncNow() {
    if (this.isSyncing || typeof window === 'undefined' || !navigator.onLine) return;
    const queue = this.getQueue();
    if (queue.length === 0) return;

    this.isSyncing = true;

    // Group by matchId
    const byMatch = queue.reduce((acc, act) => {
      if (!acc[act.matchId]) acc[act.matchId] = [];
      acc[act.matchId].push(act);
      return acc;
    }, {} as Record<string, SyncAction[]>);

    let itemsToRemove: string[] = [];

    for (const [matchId, events] of Object.entries(byMatch)) {
      try {
        // We use the watch/score endpoint, updated to handle batch events
        const res = await fetch('/api/watch/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matchId,
            events, // Pass the entire stream
            isBatch: true,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          itemsToRemove.push(...events.map(e => e.eventId));
        } else if (res.status === 409 && data.errorCode === 'SPLIT_BRAIN_CONFLICT') {
          // Pause sync on this match, trigger conflict handler
          if (this.conflictHandler) {
            this.conflictHandler(data.serverScore, data.localScore, async (choice) => {
              if (choice === 'LOCAL') {
                // Force overwrite server
                await fetch('/api/watch/score', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ matchId, forceOverride: true, score: data.localScore })
                });
                // Remove from queue after forcing
                this.removeEvents(events.map(e => e.eventId));
              } else {
                // Accept server, wipe queue for this match
                this.removeEvents(events.map(e => e.eventId));
              }
            });
          }
        } else if (res.status === 400 || res.status === 403) {
          // Hard reject, abort and rollback
          console.error('Server rejected offline sync stream. Rolling back.', data);
          itemsToRemove.push(...events.map(e => e.eventId));
          // Dispatch a custom event to tell SWR to revalidate
          window.dispatchEvent(new CustomEvent(`sync-rollback-${matchId}`));
        }

      } catch (err) {
        console.warn('Offline sync failed, will retry later:', err);
      }
    }

    if (itemsToRemove.length > 0) {
      this.removeEvents(itemsToRemove);
    }

    this.isSyncing = false;
  }

  private removeEvents(eventIds: string[]) {
    const q = this.getQueue();
    this.setQueue(q.filter(act => !eventIds.includes(act.eventId)));
  }
}

export const OfflineSyncManager = new OfflineSyncManagerClass();

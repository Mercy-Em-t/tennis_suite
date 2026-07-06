import { useState, useEffect, useCallback, useRef } from 'react';

interface QueuedAction {
  id: string;
  matchId: string;
  teamScored: 'A' | 'B';
  offlineVersion: number;
  timestamp: number;
}

const QUEUE_KEY = 'referee_offline_queue';

function readQueue(): QueuedAction[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
}

function writeQueue(q: QueuedAction[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

/**
 * useOfflineQueue
 *
 * Gate 3 integration: When the browser goes offline, point mutations are
 * pushed to a localStorage queue instead of hitting the API. The moment
 * the connection is restored, the queue is drained sequentially into
 * /api/sync/offline, preserving strict temporal ordering.
 */
export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState<boolean>(
    () => typeof window !== 'undefined' ? navigator.onLine : true
  );
  const [queue, setQueue] = useState<QueuedAction[]>(
    () => typeof window !== 'undefined' ? readQueue() : []
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);
  const syncCalled = useRef(false);

  // Track online/offline events
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const enqueue = useCallback((matchId: string, teamScored: 'A' | 'B') => {
    const action: QueuedAction = {
      id: crypto.randomUUID(),
      matchId,
      teamScored,
      offlineVersion: Date.now(),
      timestamp: Date.now(),
    };
    setQueue(prev => {
      const next = [...prev, action];
      writeQueue(next);
      return next;
    });
    return action;
  }, []);

  // Declare syncQueue before the effect that references it
  const syncQueue = useCallback(async () => {
    const pending = readQueue();
    if (pending.length === 0 || isSyncing) return;

    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ syncPayloads: pending }),
      });
      const data = await res.json();
      if (res.ok) {
        setLastSyncResult(`✓ Synced ${data.synced} actions`);
        setQueue([]);
        writeQueue([]);
      } else {
        setLastSyncResult(`✗ Sync failed: ${data.error}`);
      }
    } catch {
      setLastSyncResult('✗ Sync error — will retry on next connection');
    } finally {
      setIsSyncing(false);
      syncCalled.current = false;
    }
  }, [isSyncing]);

  // Auto-sync when connection is restored — declared after syncQueue
  useEffect(() => {
    if (isOnline && queue.length > 0 && !syncCalled.current) {
      syncCalled.current = true;
      syncQueue();
    }
    if (!isOnline) syncCalled.current = false;
  }, [isOnline, queue.length, syncQueue]);

  return { isOnline, queue, queueLength: queue.length, enqueue, syncQueue, isSyncing, lastSyncResult };
}

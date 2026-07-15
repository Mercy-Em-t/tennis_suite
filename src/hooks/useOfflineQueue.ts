import { useState, useEffect, useCallback, useRef } from 'react';

interface QueuedAction {
  id: string;
  matchId: string;
  teamScored: 'A' | 'B';
  offlineVersion: number;
  timestamp: number;
}

const DB_NAME = 'TennisSuiteDB';
const STORE_NAME = 'offline_queue';

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject('No window');
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readQueue(): Promise<QueuedAction[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

async function clearQueue(): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {}
}

async function appendToQueue(action: QueuedAction): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(action);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {}
}

/**
 * useOfflineQueue
 *
 * Gate 3 integration: When the browser goes offline, point mutations are
 * pushed to an IndexedDB queue instead of hitting the API. The moment
 * the connection is restored, the queue is drained sequentially into
 * /api/sync/offline, preserving strict temporal ordering.
 */
export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState<boolean>(
    () => typeof window !== 'undefined' ? navigator.onLine : true
  );
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);
  const syncCalled = useRef(false);

  // Load initial queue from IDB
  useEffect(() => {
    if (typeof window !== 'undefined') {
      readQueue().then(q => setQueue(q));
    }
  }, []);

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
    
    // Optimistically update UI queue, then persist to IDB asynchronously
    setQueue(prev => [...prev, action]);
    appendToQueue(action);
    
    return action;
  }, []);

  // Declare syncQueue before the effect that references it
  const syncQueue = useCallback(async () => {
    const pending = await readQueue();
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
        await clearQueue();
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

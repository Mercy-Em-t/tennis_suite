'use client';

import { useEffect } from 'react';

import { OfflineSyncManager } from '@/lib/resilience/OfflineSyncManager';

export function PwaRegistry() {
  useEffect(() => {
    // Start background sync loop
    OfflineSyncManager.startSyncLoop(3000);

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('PWA ServiceWorker registration successful with scope: ', registration.scope);
          },
          (err) => {
            console.log('PWA ServiceWorker registration failed: ', err);
          }
        );
      });
    }
    
    return () => OfflineSyncManager.stopSyncLoop();
  }, []);

  return null;
}

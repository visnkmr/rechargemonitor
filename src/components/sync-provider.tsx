'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

function SyncProviderInner() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const initializeSync = async () => {
      try {
        const { syncService } = await import('@/lib/sync-service');
        await syncService.syncAllFromLocalStorage();
        await syncService.syncAllToLocalStorage();
        syncService.setupLocalStorageInterceptor();
        
        const remoteUrl = process.env.NEXT_PUBLIC_COUCHDB_URL;
        if (remoteUrl) {
          await syncService.initializeSync(remoteUrl);
        }
      } catch (error) {
        console.error('Failed to initialize sync:', error);
      }
    };

    initializeSync();

    return () => {
      if (isClient) {
        import('@/lib/sync-service').then(({ syncService }) => {
          syncService.stopSync();
        });
      }
    };
  }, [isClient]);

  return null;
}

export default dynamic(() => Promise.resolve(SyncProviderInner), {
  ssr: false
});
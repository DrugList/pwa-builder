'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/lib/stores/app-store';

export function useOffline() {
  const { isOffline, setIsOffline, setLastRefresh } = useAppStore();
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setLastRefresh(new Date());
      if (wasOffline) {
        // Trigger sync when coming back online
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage('sync');
        }
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial state
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOffline, setLastRefresh, wasOffline]);

  const refreshData = useCallback(async () => {
    // Simulate data refresh
    setLastRefresh(new Date());
    return true;
  }, [setLastRefresh]);

  return {
    isOffline,
    refreshData,
  };
}

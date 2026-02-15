'use client';

import { useSyncExternalStore } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

// Online status store using sync external store pattern
function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true; // Assume online on server
}

export function OfflineIndicator() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isOffline = !isOnline;

  // Only show when offline - the "back online" message adds complexity
  // that the React Compiler linter doesn't like
  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] py-2 px-4 text-center text-sm font-medium bg-red-500 text-white">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span>You are offline. Some features may be limited.</span>
      </div>
    </div>
  );
}

'use client';
import { useEffect } from 'react';
import { startSync } from '@/lib/sync';

// Mounted once in the root layout: starts background sync and registers the offline service worker.
export default function SyncOnLoad() {
  useEffect(() => {
    startSync();
    // Offline use: the service worker is only built for production, so it is skipped in development.
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) void navigator.serviceWorker.register('/sw.js');
  }, []);
  return null;
}

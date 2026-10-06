'use client';
import { useEffect } from 'react';
import { startSync } from '@/lib/sync';

// Mounted once in the root layout: starts background sync for devices that have a sync key.
export default function SyncOnLoad() {
  useEffect(() => { startSync(); }, []);
  return null;
}

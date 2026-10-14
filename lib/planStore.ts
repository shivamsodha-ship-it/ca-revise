'use client';
import { useEffect, useState } from 'react';
import { BOARD_KEY, FOCUS_KEY, type Board, type Focus } from './plan';
import { SYNCED_EVENT, notifyChanged } from './sync';

// The running timer is per device (not synced): { end, s, c, m }.
export const TIMER_KEY = 'ca-revise:timer';

export function read<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}
export function write(key: string, v: unknown) {
  try { if (v === null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(v)); } catch {}
  if (key !== TIMER_KEY) notifyChanged();
}

// Board and focus log, read after mount and re-read when another device's changes arrive.
export function usePlan() {
  const [board, setBoard] = useState<Board>({ items: {} });
  const [focus, setFocus] = useState<Focus>({ log: {} });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const load = () => { setBoard(read(BOARD_KEY, { items: {} })); setFocus(read(FOCUS_KEY, { log: {} })); setReady(true); };
    load();
    window.addEventListener(SYNCED_EVENT, load);
    return () => window.removeEventListener(SYNCED_EVENT, load);
  }, []);
  const saveBoard = (b: Board) => { setBoard(b); write(BOARD_KEY, b); };
  const saveFocus = (f: Focus) => { setFocus(f); write(FOCUS_KEY, f); };
  return { board, focus, ready, saveBoard, saveFocus };
}

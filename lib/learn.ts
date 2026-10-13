'use client';
// Client hook for the mastery layer's progress. Shapes live in learnData.ts.
import { useCallback, useEffect, useState } from 'react';
import { notifyChanged, SYNCED_EVENT } from './sync';
import { EMPTY_LEARN, type LearnState } from './learnData';
export * from './learnData';

const key = (id: string) => `ca-revise:v1:learn:${id}`;

export function loadLearn(id: string): LearnState {
  try { const raw = localStorage.getItem(key(id)); return raw ? { ...EMPTY_LEARN, ...JSON.parse(raw) } : EMPTY_LEARN; } catch { return EMPTY_LEARN; }
}

export function useLearnState(chapterId: string) {
  const [L, setL] = useState<LearnState>(EMPTY_LEARN);
  useEffect(() => {
    const load = () => setL(loadLearn(chapterId));
    load();
    window.addEventListener(SYNCED_EVENT, load);
    return () => window.removeEventListener(SYNCED_EVENT, load);
  }, [chapterId]);
  // Keeps the best score; a lower score never overwrites a higher one.
  const bump = useCallback((bucket: 'lv' | 'gm' | 'sv', id: string, pct: number) => {
    setL(prev => {
      const old = prev[bucket][id];
      if (old && old.best >= pct) return prev;
      const next: LearnState = { ...prev, [bucket]: { ...prev[bucket], [id]: { best: pct, at: Date.now() } }, u: Date.now() };
      try { localStorage.setItem(key(chapterId), JSON.stringify(next)); } catch {}
      notifyChanged();
      return next;
    });
  }, [chapterId]);
  return { L, bump };
}


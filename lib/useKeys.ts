'use client';
import { useEffect, useRef } from 'react';

// Single-key shortcuts for a view. Ignored while typing, with modifier keys held,
// or while the provision drawer / More sheet is open (those own the keyboard).
export function useKeys(map: Record<string, () => void>) {
  const ref = useRef(map);
  ref.current = map;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (document.querySelector('.drawer, .sheet-wrap')) return;
      const fn = ref.current[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (!fn) return;
      // Enter/Space on a focused control already activate it; don't fire twice.
      if ((e.key === 'Enter' || e.key === ' ') && t.closest('button, a, [role="button"]')) return;
      e.preventDefault();
      fn();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
}

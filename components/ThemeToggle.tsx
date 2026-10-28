'use client';
import { useEffect, useState } from 'react';
import { THEME_KEY } from '@/lib/theme';

// Light / dark / auto switch for the top bar. "Auto" follows the device; see lib/theme.ts.
type Mode = 'auto' | 'light' | 'dark';
const NEXT: Record<Mode, Mode> = { auto: 'light', light: 'dark', dark: 'auto' };
const LABEL: Record<Mode, string> = { auto: 'Theme: auto (follows device)', light: 'Theme: light', dark: 'Theme: dark' };

function apply(m: Mode) {
  const el = document.documentElement;
  if (m === 'auto') delete el.dataset.theme; else el.dataset.theme = m;
  try { if (m === 'auto') localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, m); } catch {}
}

const ICON: Record<Mode, JSX.Element> = {
  auto: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" /></svg>,
  light: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>,
  dark: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>,
};

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode | null>(null);
  // Re-apply the saved choice on mount: a client re-render of the root can drop the attribute THEME_SCRIPT set.
  useEffect(() => {
    let t: string | null = null;
    try { t = localStorage.getItem(THEME_KEY); } catch {}
    const m: Mode = t === 'light' || t === 'dark' ? t : 'auto';
    if (m !== 'auto') document.documentElement.dataset.theme = m;
    setMode(m);
  }, []);
  if (!mode) return <span className="theme-btn" aria-hidden="true" />;
  const next = NEXT[mode];
  return (
    <button type="button" className="theme-btn" title={`${LABEL[mode]}. Tap for ${next}.`} aria-label={`${LABEL[mode]}. Switch to ${next}.`}
      onClick={() => { apply(next); setMode(next); }}>{ICON[mode]}</button>
  );
}

// Browser side of sync. Signed-in devices push every synced key to /api/sync and merge what comes back into
// local storage, then tell the open chapter to reload. Signed-out devices keep working locally and sync
// once someone signs in (the first sync merges that device's progress into the account).
import { isSyncKey, mergeValue } from './syncMerge';

export const SYNCED_EVENT = 'ca-revise:synced';
const STATUS_KEY = 'ca-revise:v1:sync-status';

export interface SyncStatus { at: number; ok: boolean; message: string }

// null = not checked yet, false = signed out, true = signed in.
let signedIn: boolean | null = null;
let accountEmail: string | null = null;

const readLocal = (key: string): unknown => {
  try { const raw = localStorage.getItem(key); return raw === null ? undefined : JSON.parse(raw); } catch { return undefined; }
};
const writeLocal = (key: string, v: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
};
export function getStatus(): SyncStatus | null {
  try { const raw = localStorage.getItem(STATUS_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function setStatus(s: SyncStatus) {
  try { localStorage.setItem(STATUS_KEY, JSON.stringify(s)); } catch {}
}
export function account(): { signedIn: boolean | null; email: string | null } {
  return { signedIn, email: accountEmail };
}
export function setAccount(email: string | null) {
  accountEmail = email;
  signedIn = !!email;
}

// Called after any local write. Waits a moment so a burst of answers goes up as one request.
let timer: ReturnType<typeof setTimeout> | undefined;
export function notifyChanged() {
  if (signedIn === false) return;
  clearTimeout(timer);
  timer = setTimeout(() => { void syncNow(); }, 1500);
}

let running: Promise<SyncStatus> | null = null;
export function syncNow(): Promise<SyncStatus> {
  if (running) return running;
  running = doSync().finally(() => { running = null; });
  return running;
}

async function doSync(): Promise<SyncStatus> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const s = { at: Date.now(), ok: false, message: 'Offline. Changes will sync when you are back online.' };
    setStatus(s); return s;
  }
  const docs: Record<string, unknown> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && isSyncKey(k)) { const v = readLocal(k); if (v !== undefined) docs[k] = v; }
    }
    const res = await fetch('/api/sync', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ docs }),
    });
    if (res.status === 401) {
      signedIn = false; accountEmail = null;
      const s = { at: Date.now(), ok: false, message: 'Sign in to sync this device.' };
      setStatus(s); return s;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    signedIn = true;
    const body = (await res.json()) as { docs: Record<string, unknown> };
    let changed = false;
    for (const [k, remote] of Object.entries(body.docs)) {
      if (!isSyncKey(k)) continue;
      const local = readLocal(k);
      const merged = mergeValue(k, local, remote);
      if (JSON.stringify(merged) !== JSON.stringify(local)) { writeLocal(k, merged); changed = true; }
    }
    const s = { at: Date.now(), ok: true, message: 'Synced.' };
    setStatus(s);
    if (changed) window.dispatchEvent(new Event(SYNCED_EVENT));
    return s;
  } catch {
    const s = { at: Date.now(), ok: false, message: 'Could not reach the server. Your changes are kept and will sync later.' };
    setStatus(s); return s;
  }
}

// Removes synced progress from this device. Used on sign-out so the next person on a shared phone sees nothing.
export function clearSyncedLocal() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && isSyncKey(k)) keys.push(k); }
    keys.forEach(k => localStorage.removeItem(k));
    localStorage.removeItem(STATUS_KEY);
  } catch {}
}

let started = false;
// Once per page load: check the session, sync now, and sync again when the app comes back to the foreground
// (phones switch apps a lot) or the network returns.
export function startSync() {
  if (started || typeof window === 'undefined') return;
  started = true;
  const again = () => { if (document.visibilityState === 'visible' && signedIn !== false) void syncNow(); };
  document.addEventListener('visibilitychange', again);
  window.addEventListener('online', again);
  void (async () => {
    try {
      const r = await fetch('/api/auth/me', { credentials: 'same-origin' });
      const j = r.ok ? await r.json() : { email: null };
      if (j.email) { setAccount(j.email); await syncNow(); } else { signedIn = false; }
    } catch { signedIn = false; }
  })();
}

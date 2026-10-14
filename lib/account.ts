// Sign-up, sign-in, recovery, sign-out, account deletion and connector keys, called from the account page.
import { clearSyncedLocal, setAccount, syncNow } from './sync';

export interface AuthResult { ok: boolean; error?: string; username?: string; recoveryCode?: string }

async function call(url: string, body: unknown, method = 'POST'): Promise<{ ok: boolean; json: any }> {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  let json: any = {};
  try { json = await res.json(); } catch {}
  return { ok: res.ok, json };
}

// After signing in, this device's progress merges into the account on the first sync.
async function afterAuth(r: { username: string; recoveryCode?: string }): Promise<AuthResult> {
  setAccount(r.username);
  await syncNow();
  return { ok: true, username: r.username, recoveryCode: r.recoveryCode };
}

export async function signUp(username: string, pin: string): Promise<AuthResult> {
  const r = await call('/api/auth/signup', { username, pin });
  return r.ok ? afterAuth(r.json) : { ok: false, error: r.json.error ?? 'Could not create the account.' };
}

export async function signIn(username: string, pin: string): Promise<AuthResult> {
  const r = await call('/api/auth/login', { username, pin });
  return r.ok ? afterAuth(r.json) : { ok: false, error: r.json.error ?? 'Could not sign in.' };
}

export async function recover(username: string, code: string, pin: string): Promise<AuthResult> {
  const r = await call('/api/auth/recover', { username, code, pin });
  return r.ok ? afterAuth(r.json) : { ok: false, error: r.json.error ?? 'Could not reset the PIN.' };
}

export async function signOut(): Promise<AuthResult> {
  await syncNow();                 // push anything not yet sent before the session goes
  await call('/api/auth/logout', {});
  setAccount(null);
  clearSyncedLocal();
  return { ok: true };
}

export async function deleteAccount(pin: string): Promise<AuthResult> {
  const r = await call('/api/auth/account', { pin }, 'DELETE');
  if (!r.ok) return { ok: false, error: r.json.error ?? 'Could not delete the account.' };
  setAccount(null);
  clearSyncedLocal();
  return { ok: true };
}

export async function connectorStatus(): Promise<{ connected: boolean; createdAt: string | null; lastUsed: string | null }> {
  const res = await fetch('/api/auth/connector', { credentials: 'same-origin' });
  return res.ok ? res.json() : { connected: false, createdAt: null, lastUsed: null };
}

export async function createConnectorKey(pin: string): Promise<{ ok: boolean; key?: string; error?: string }> {
  const r = await call('/api/auth/connector', { pin });
  return r.ok ? { ok: true, key: r.json.key } : { ok: false, error: r.json.error ?? 'Could not create the key.' };
}

export async function revokeConnectorKey(): Promise<void> {
  await call('/api/auth/connector', {}, 'DELETE');
}

export async function newRecoveryCode(pin: string): Promise<{ ok: boolean; code?: string; error?: string }> {
  const r = await call('/api/auth/recovery-code', { pin });
  return r.ok ? { ok: true, code: r.json.recoveryCode } : { ok: false, error: r.json.error ?? 'Could not create a new recovery code.' };
}

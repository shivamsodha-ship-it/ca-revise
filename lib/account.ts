// Sign-up, sign-in, sign-out and account deletion, called from the account page.
import { clearSyncedLocal, setAccount, syncNow } from './sync';

export interface AuthResult { ok: boolean; error?: string; email?: string }

async function post(url: string, body: unknown, method = 'POST'): Promise<{ ok: boolean; status: number; json: any }> {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  let json: any = {};
  try { json = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, json };
}

// After signing in, this device's progress merges into the account on the first sync.
async function afterAuth(email: string): Promise<AuthResult> {
  setAccount(email);
  await syncNow();
  return { ok: true, email };
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const r = await post('/api/auth/signup', { email, password });
  return r.ok ? afterAuth(r.json.email) : { ok: false, error: r.json.error ?? 'Could not create the account.' };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const r = await post('/api/auth/login', { email, password });
  return r.ok ? afterAuth(r.json.email) : { ok: false, error: r.json.error ?? 'Could not sign in.' };
}

export async function signOut(): Promise<AuthResult> {
  await syncNow();                 // push anything not yet sent before the session goes
  await post('/api/auth/logout', {});
  setAccount(null);
  clearSyncedLocal();
  return { ok: true };
}

export async function deleteAccount(password: string): Promise<AuthResult> {
  const r = await post('/api/auth/account', { password }, 'DELETE');
  if (!r.ok) return { ok: false, error: r.json.error ?? 'Could not delete the account.' };
  setAccount(null);
  clearSyncedLocal();
  return { ok: true };
}

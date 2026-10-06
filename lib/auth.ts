// Accounts and sessions. Passwords are hashed with scrypt (Node built-in). A session is a random token in an
// HttpOnly cookie; the database keeps only its SHA-256 hash, so a leaked table cannot be used to sign in.
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { db, ensureSchema } from './db';

export const SESSION_COOKIE = 'cr_session';
const SESSION_DAYS = 30;
const MAX_ATTEMPTS = 10;               // failed logins per email+IP within the window
const WINDOW_MS = 15 * 60 * 1000;

export const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
export function validEmail(e: unknown): e is string { return typeof e === 'string' && e.length <= 254 && EMAIL.test(e); }
export function validPassword(p: unknown): p is string { return typeof p === 'string' && p.length >= 10 && p.length <= 200; }

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltB64, keyB64] = stored.split('$');
  if (scheme !== 'scrypt' || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, 'base64');
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, 'base64'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

const sha = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export async function createSession(userId: string): Promise<string> {
  await ensureSchema();
  const token = crypto.randomBytes(32).toString('base64url');
  await db().query(
    `INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + make_interval(days => $3))`,
    [sha(token), userId, SESSION_DAYS],
  );
  return token;
}

export async function userFromToken(token: string | undefined): Promise<string | null> {
  if (!token || token.length > 100) return null;
  await ensureSchema();
  const r = await db().query(`SELECT user_id FROM sessions WHERE token_hash = $1 AND expires_at > now()`, [sha(token)]);
  return r.rows[0]?.user_id ?? null;
}

// The signed-in user for this request, or null.
export async function currentUser(): Promise<string | null> {
  return userFromToken(cookies().get(SESSION_COOKIE)?.value);
}

export async function endSession(token: string | undefined) {
  if (!token) return;
  await ensureSchema();
  await db().query(`DELETE FROM sessions WHERE token_hash = $1`, [sha(token)]);
}

export function sessionCookie(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 3600,
  };
}

// Failed-login throttle: true when this bucket has used up its attempts.
export async function throttled(bucket: string): Promise<boolean> {
  await ensureSchema();
  const r = await db().query(`SELECT count, window_start FROM login_attempts WHERE bucket = $1`, [bucket]);
  const row = r.rows[0];
  if (!row) return false;
  const fresh = Date.now() - new Date(row.window_start).getTime() < WINDOW_MS;
  return fresh && row.count >= MAX_ATTEMPTS;
}

export async function recordFailure(bucket: string) {
  await db().query(
    `INSERT INTO login_attempts (bucket, count, window_start) VALUES ($1, 1, now())
     ON CONFLICT (bucket) DO UPDATE SET
       count = CASE WHEN login_attempts.window_start > now() - make_interval(secs => $2) THEN login_attempts.count + 1 ELSE 1 END,
       window_start = CASE WHEN login_attempts.window_start > now() - make_interval(secs => $2) THEN login_attempts.window_start ELSE now() END`,
    [bucket, WINDOW_MS / 1000],
  );
}

export async function clearFailures(bucket: string) {
  await db().query(`DELETE FROM login_attempts WHERE bucket = $1`, [bucket]);
}

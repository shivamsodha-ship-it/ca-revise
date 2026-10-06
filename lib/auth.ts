// Accounts without email. Sign-in is a username and a 6-digit PIN. At sign-up each account also gets a
// one-time recovery code, which resets the PIN if it is forgotten. PINs and recovery codes are stored as
// scrypt hashes. A session is a random token in an HttpOnly cookie; the database keeps only its SHA-256.
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { database } from './db';

export const SESSION_COOKIE = 'cr_session';
const SESSION_DAYS = 30;
const MAX_FAILURES = 5;                 // wrong PINs or recovery codes per bucket before a lockout
const LOCK_MS = 15 * 60 * 1000;

export const USERNAME = /^[a-z0-9_]{3,32}$/;
export const PIN = /^\d{6}$/;
export function validUsername(u: unknown): u is string { return typeof u === 'string' && USERNAME.test(u); }
export function validPin(p: unknown): p is string { return typeof p === 'string' && PIN.test(p); }

// Recovery codes: 12 characters from an alphabet without look-alikes, shown as XXXX-XXXX-XXXX.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function newRecoveryCode(): string {
  const bytes = crypto.randomBytes(12);
  let out = '';
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return out.replace(/(.{4})(?=.)/g, '$1-');
}
export const normaliseCode = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '');

export function hashSecret(secret: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(secret, salt, 64);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export function verifySecret(secret: string, stored: string): boolean {
  const [scheme, saltB64, keyB64] = stored.split('$');
  if (scheme !== 'scrypt' || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, 'base64');
  const actual = crypto.scryptSync(secret, Buffer.from(saltB64, 'base64'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

export const sha = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export async function createSession(userId: string): Promise<string> {
  const db = await database();
  const token = crypto.randomBytes(32).toString('base64url');
  await db.collection('sessions').insertOne({
    tokenHash: sha(token), userId, expiresAt: new Date(Date.now() + SESSION_DAYS * 86400_000),
  });
  return token;
}

export async function userFromToken(token: string | undefined): Promise<string | null> {
  if (!token || token.length > 100) return null;
  const db = await database();
  const s = await db.collection('sessions').findOne({ tokenHash: sha(token), expiresAt: { $gt: new Date() } });
  return s?.userId ?? null;
}

// The signed-in user for this request, or null.
export async function currentUser(): Promise<string | null> {
  return userFromToken(cookies().get(SESSION_COOKIE)?.value);
}

export async function endSession(token: string | undefined) {
  if (!token) return;
  const db = await database();
  await db.collection('sessions').deleteOne({ tokenHash: sha(token) });
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

// True while this bucket is locked out.
export async function locked(bucket: string): Promise<boolean> {
  const db = await database();
  const row = await db.collection('loginAttempts').findOne({ bucket });
  return !!row && row.count >= MAX_FAILURES && row.expiresAt > new Date();
}

// Counts a failure. A window that has already ended starts again at 1, so one wrong PIN after a lockout
// does not lock the account straight away.
export async function recordFailure(bucket: string) {
  const db = await database();
  const col = db.collection('loginAttempts');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + LOCK_MS);
  const row = await col.findOne({ bucket });
  if (!row || row.expiresAt <= now) await col.updateOne({ bucket }, { $set: { count: 1, expiresAt } }, { upsert: true });
  else await col.updateOne({ bucket }, { $inc: { count: 1 }, $set: { expiresAt } });
}

export async function clearFailures(bucket: string) {
  const db = await database();
  await db.collection('loginAttempts').deleteOne({ bucket });
}

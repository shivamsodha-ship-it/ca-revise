import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createSession, hashPassword, sessionCookie, validEmail, validPassword, throttled, recordFailure } from '@/lib/auth';
import { db, ensureSchema } from '@/lib/db';
import { clientIp, isJsonWrite, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!isJsonWrite(req)) return NextResponse.json({ error: 'bad request' }, { status: 415 });
  const parsed = await readJson(req, 1000);
  if (!parsed.ok) return NextResponse.json({ error: 'bad request' }, { status: parsed.status });
  const email = typeof parsed.body?.email === 'string' ? parsed.body.email.trim().toLowerCase() : '';
  const password = parsed.body?.password;
  if (!validEmail(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (!validPassword(password)) return NextResponse.json({ error: 'Use a password of at least 10 characters.' }, { status: 400 });

  const bucket = 'signup:' + clientIp(req);
  if (await throttled(bucket)) return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  await ensureSchema();
  const exists = await db().query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (exists.rows.length) {
    await recordFailure(bucket);
    return NextResponse.json({ error: 'An account with this email already exists. Sign in instead.' }, { status: 409 });
  }
  const id = crypto.randomUUID();
  await db().query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [id, email, hashPassword(password)]);
  const token = await createSession(id);
  const res = NextResponse.json({ email });
  res.cookies.set(sessionCookie(token));
  return res;
}

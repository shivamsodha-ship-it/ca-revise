import { NextResponse } from 'next/server';
import { clearFailures, createSession, recordFailure, sessionCookie, throttled, verifyPassword } from '@/lib/auth';
import { db, ensureSchema } from '@/lib/db';
import { clientIp, isJsonWrite, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

// A fixed hash so a wrong email takes as long to reject as a wrong password.
const DUMMY = 'scrypt$AAAAAAAAAAAAAAAAAAAAAA==$' + Buffer.alloc(64).toString('base64');

export async function POST(req: Request) {
  if (!isJsonWrite(req)) return NextResponse.json({ error: 'bad request' }, { status: 415 });
  const parsed = await readJson(req, 1000);
  if (!parsed.ok) return NextResponse.json({ error: 'bad request' }, { status: parsed.status });
  const email = typeof parsed.body?.email === 'string' ? parsed.body.email.trim().toLowerCase() : '';
  const password = typeof parsed.body?.password === 'string' ? parsed.body.password : '';
  const bucket = `login:${email}:${clientIp(req)}`;
  if (await throttled(bucket)) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });

  await ensureSchema();
  const r = await db().query<{ id: string; password_hash: string }>('SELECT id, password_hash FROM users WHERE email = $1', [email]);
  const user = r.rows[0];
  const ok = verifyPassword(password, user?.password_hash ?? DUMMY) && !!user;
  if (!ok) {
    await recordFailure(bucket);
    return NextResponse.json({ error: 'Email or password is wrong.' }, { status: 401 });
  }
  await clearFailures(bucket);
  const token = await createSession(user.id);
  const res = NextResponse.json({ email });
  res.cookies.set(sessionCookie(token));
  return res;
}

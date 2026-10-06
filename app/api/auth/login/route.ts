import { NextResponse } from 'next/server';
import { clearFailures, createSession, hashSecret, locked, recordFailure, sessionCookie, verifySecret } from '@/lib/auth';
import { database } from '@/lib/db';
import { clientIp, isJsonWrite, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

// A fixed hash so an unknown username takes as long to reject as a wrong PIN.
const DUMMY = hashSecret('000000');

export async function POST(req: Request) {
  if (!isJsonWrite(req)) return NextResponse.json({ error: 'bad request' }, { status: 415 });
  const parsed = await readJson(req, 1000);
  if (!parsed.ok) return NextResponse.json({ error: 'bad request' }, { status: parsed.status });
  const username = typeof parsed.body?.username === 'string' ? parsed.body.username.trim().toLowerCase() : '';
  const pin = typeof parsed.body?.pin === 'string' ? parsed.body.pin : '';
  const bucket = `login:${username}:${clientIp(req)}`;
  if (await locked(bucket)) return NextResponse.json({ error: 'Too many wrong PINs. Try again in 15 minutes, or use your recovery code.' }, { status: 429 });

  const db = await database();
  const user = await db.collection('users').findOne({ username });
  const ok = verifySecret(pin, user?.pinHash ?? DUMMY) && !!user;
  if (!ok) {
    await recordFailure(bucket);
    return NextResponse.json({ error: 'Username or PIN is wrong.' }, { status: 401 });
  }
  await clearFailures(bucket);
  const token = await createSession(String(user!._id));
  const res = NextResponse.json({ username });
  res.cookies.set(sessionCookie(token));
  return res;
}

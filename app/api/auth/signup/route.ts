import { NextResponse } from 'next/server';
import { createSession, hashSecret, newRecoveryCode, recordFailure, locked, sessionCookie, validPin, validUsername } from '@/lib/auth';
import { database } from '@/lib/db';
import { clientIp, isJsonWrite, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

// Creates an account. The recovery code is returned once; it is only stored as a hash.
export async function POST(req: Request) {
  if (!isJsonWrite(req)) return NextResponse.json({ error: 'bad request' }, { status: 415 });
  const parsed = await readJson(req, 1000);
  if (!parsed.ok) return NextResponse.json({ error: 'bad request' }, { status: parsed.status });
  const username = typeof parsed.body?.username === 'string' ? parsed.body.username.trim().toLowerCase() : '';
  const pin = parsed.body?.pin;
  if (!validUsername(username)) return NextResponse.json({ error: 'Use 3–32 letters, numbers or underscores for the username.' }, { status: 400 });
  if (!validPin(pin)) return NextResponse.json({ error: 'The PIN must be exactly 6 digits.' }, { status: 400 });

  const bucket = 'signup:' + clientIp(req);
  if (await locked(bucket)) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  const db = await database();
  if (await db.collection('users').findOne({ username })) {
    await recordFailure(bucket);
    return NextResponse.json({ error: 'That username is taken.' }, { status: 409 });
  }
  const recoveryCode = newRecoveryCode();
  try {
    const r = await db.collection('users').insertOne({
      username, pinHash: hashSecret(pin), recoveryHash: hashSecret(recoveryCode.replace(/-/g, '')), createdAt: new Date(),
    });
    const token = await createSession(String(r.insertedId));
    const res = NextResponse.json({ username, recoveryCode });
    res.cookies.set(sessionCookie(token));
    return res;
  } catch (e: any) {
    if (e?.code === 11000) return NextResponse.json({ error: 'That username is taken.' }, { status: 409 });
    throw e;
  }
}

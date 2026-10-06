import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { clearFailures, createSession, hashSecret, locked, newRecoveryCode, normaliseCode, recordFailure, sessionCookie, validPin, verifySecret } from '@/lib/auth';
import { database } from '@/lib/db';
import { clientIp, isJsonWrite, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

// Forgotten PIN: the recovery code sets a new PIN and issues a new recovery code (both shown once).
export async function POST(req: Request) {
  if (!isJsonWrite(req)) return NextResponse.json({ error: 'bad request' }, { status: 415 });
  const parsed = await readJson(req, 1000);
  if (!parsed.ok) return NextResponse.json({ error: 'bad request' }, { status: parsed.status });
  const username = typeof parsed.body?.username === 'string' ? parsed.body.username.trim().toLowerCase() : '';
  const code = typeof parsed.body?.code === 'string' ? normaliseCode(parsed.body.code) : '';
  const pin = parsed.body?.pin;
  if (!validPin(pin)) return NextResponse.json({ error: 'The new PIN must be exactly 6 digits.' }, { status: 400 });
  const bucket = `recover:${username}:${clientIp(req)}`;
  if (await locked(bucket)) return NextResponse.json({ error: 'Too many wrong codes. Try again in 15 minutes.' }, { status: 429 });

  const db = await database();
  const user = await db.collection('users').findOne({ username });
  if (!user || !verifySecret(code, user.recoveryHash)) {
    await recordFailure(bucket);
    return NextResponse.json({ error: 'Username or recovery code is wrong.' }, { status: 401 });
  }
  await clearFailures(bucket);
  const recoveryCode = newRecoveryCode();
  await db.collection('users').updateOne({ _id: user._id }, {
    $set: { pinHash: hashSecret(pin), recoveryHash: hashSecret(recoveryCode.replace(/-/g, '')) },
  });
  await db.collection('sessions').deleteMany({ userId: String(user._id) });   // sessions from before the reset end
  const token = await createSession(String(user._id));
  const res = NextResponse.json({ username, recoveryCode });
  res.cookies.set(sessionCookie(token));
  return res;
}

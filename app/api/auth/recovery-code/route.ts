import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { clearFailures, currentUser, hashSecret, locked, newRecoveryCode, recordFailure, verifySecret } from '@/lib/auth';
import { database } from '@/lib/db';
import { isJsonWrite, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

// A signed-in user with the right PIN gets a fresh recovery code (shown once). The old code stops working.
export async function POST(req: Request) {
  if (!isJsonWrite(req)) return NextResponse.json({ error: 'bad request' }, { status: 415 });
  const id = await currentUser();
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: 'signed out' }, { status: 401 });
  const parsed = await readJson(req, 1000);
  if (!parsed.ok) return NextResponse.json({ error: 'bad request' }, { status: parsed.status });
  const bucket = `newcode:${id}`;
  if (await locked(bucket)) return NextResponse.json({ error: 'Too many wrong PINs. Try again in 15 minutes.' }, { status: 429 });

  const db = await database();
  const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
  const pin = typeof parsed.body?.pin === 'string' ? parsed.body.pin : '';
  if (!user || !verifySecret(pin, user.pinHash)) {
    await recordFailure(bucket);
    return NextResponse.json({ error: 'PIN is wrong.' }, { status: 401 });
  }
  await clearFailures(bucket);
  const recoveryCode = newRecoveryCode();
  await db.collection('users').updateOne({ _id: user._id }, { $set: { recoveryHash: hashSecret(recoveryCode.replace(/-/g, '')) } });
  return NextResponse.json({ recoveryCode });
}

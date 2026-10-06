import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { SESSION_COOKIE, currentUser, verifySecret } from '@/lib/auth';
import { database } from '@/lib/db';
import { isJsonWrite, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

// Deletes the account and everything synced with it. Asks for the PIN again, so a stolen session alone cannot do it.
export async function DELETE(req: Request) {
  if (!isJsonWrite(req)) return NextResponse.json({ error: 'bad request' }, { status: 415 });
  const id = await currentUser();
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: 'signed out' }, { status: 401 });
  const parsed = await readJson(req, 1000);
  if (!parsed.ok) return NextResponse.json({ error: 'bad request' }, { status: parsed.status });
  const db = await database();
  const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
  const pin = typeof parsed.body?.pin === 'string' ? parsed.body.pin : '';
  if (!user || !verifySecret(pin, user.pinHash)) return NextResponse.json({ error: 'PIN is wrong.' }, { status: 401 });
  await Promise.all([
    db.collection('docs').deleteMany({ userId: id }),
    db.collection('sessions').deleteMany({ userId: id }),
    db.collection('connectorKeys').deleteMany({ userId: id }),
    db.collection('users').deleteOne({ _id: user._id }),
  ]);
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: SESSION_COOKIE, value: '', path: '/', maxAge: 0 });
  return res;
}

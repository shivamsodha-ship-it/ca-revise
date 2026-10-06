import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { currentUser, sha, verifySecret } from '@/lib/auth';
import { database } from '@/lib/db';
import { isJsonWrite, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

// Connector keys let Claude Desktop, Claude Code or a claude.ai connector read this account's progress through
// /api/mcp. Read-only. One key per account: creating a new one revokes the old one. The PIN is asked again.
export async function GET() {
  const id = await currentUser();
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: 'signed out' }, { status: 401 });
  const db = await database();
  const k = await db.collection('connectorKeys').findOne({ userId: id }, { projection: { createdAt: 1, lastUsed: 1 } });
  return NextResponse.json({ connected: !!k, createdAt: k?.createdAt ?? null, lastUsed: k?.lastUsed ?? null });
}

export async function POST(req: Request) {
  if (!isJsonWrite(req)) return NextResponse.json({ error: 'bad request' }, { status: 415 });
  const id = await currentUser();
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: 'signed out' }, { status: 401 });
  const parsed = await readJson(req, 1000);
  if (!parsed.ok) return NextResponse.json({ error: 'bad request' }, { status: parsed.status });
  const db = await database();
  const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
  const pin = typeof parsed.body?.pin === 'string' ? parsed.body.pin : '';
  if (!user || !verifySecret(pin, user.pinHash)) return NextResponse.json({ error: 'PIN is wrong.' }, { status: 401 });
  const key = crypto.randomBytes(32).toString('base64url');
  await db.collection('connectorKeys').deleteMany({ userId: id });
  await db.collection('connectorKeys').insertOne({ userId: id, keyHash: sha(key), createdAt: new Date(), lastUsed: null });
  return NextResponse.json({ key });
}

export async function DELETE(req: Request) {
  if (!isJsonWrite(req)) return NextResponse.json({ error: 'bad request' }, { status: 415 });
  const id = await currentUser();
  if (!id) return NextResponse.json({ error: 'signed out' }, { status: 401 });
  const db = await database();
  await db.collection('connectorKeys').deleteMany({ userId: id });
  return NextResponse.json({ ok: true });
}

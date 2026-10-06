import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { isJsonWrite, readJson } from '@/lib/http';
import { loadDocs, mergeDocs } from '@/lib/syncDb';
import { isSyncKey, mergeValue, validValue } from '@/lib/syncMerge';

// Each signed-in user reads and writes only their own documents; the user comes from the session cookie.
export const dynamic = 'force-dynamic';

const MAX_BODY = 2_000_000;   // characters

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'signed out' }, { status: 401 });
  return NextResponse.json({ docs: await loadDocs(user) });
}

export async function PUT(req: Request) {
  if (!isJsonWrite(req)) return NextResponse.json({ error: 'bad request' }, { status: 415 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'signed out' }, { status: 401 });
  const parsed = await readJson(req, MAX_BODY);
  if (!parsed.ok) return NextResponse.json({ error: 'bad request' }, { status: parsed.status });
  const docs = parsed.body?.docs && typeof parsed.body.docs === 'object' && !Array.isArray(parsed.body.docs) ? parsed.body.docs as Record<string, unknown> : {};
  const incoming = Object.fromEntries(Object.entries(docs).filter(([k, v]) => isSyncKey(k) && validValue(k, v)));
  return NextResponse.json({ docs: await mergeDocs(user, incoming, mergeValue) });
}

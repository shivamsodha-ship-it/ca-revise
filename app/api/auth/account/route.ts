import { NextResponse } from 'next/server';
import { SESSION_COOKIE, currentUser, verifyPassword } from '@/lib/auth';
import { db, ensureSchema } from '@/lib/db';
import { isJsonWrite, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

// Deletes the account and everything synced with it. Asks for the password again, so a stolen session alone cannot do it.
export async function DELETE(req: Request) {
  if (!isJsonWrite(req)) return NextResponse.json({ error: 'bad request' }, { status: 415 });
  const id = await currentUser();
  if (!id) return NextResponse.json({ error: 'signed out' }, { status: 401 });
  const parsed = await readJson(req, 1000);
  if (!parsed.ok) return NextResponse.json({ error: 'bad request' }, { status: parsed.status });
  await ensureSchema();
  const r = await db().query<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = $1', [id]);
  if (!r.rows[0] || !verifyPassword(typeof parsed.body?.password === 'string' ? parsed.body.password : '', r.rows[0].password_hash)) {
    return NextResponse.json({ error: 'Password is wrong.' }, { status: 401 });
  }
  await db().query('DELETE FROM users WHERE id = $1', [id]);   // sessions and docs cascade
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: SESSION_COOKIE, value: '', path: '/', maxAge: 0 });
  return res;
}

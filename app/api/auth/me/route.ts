import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { db, ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Always 200: signed out is a normal state, and a 401 would show up as an error in every visitor's console.
export async function GET() {
  const id = await currentUser();
  if (!id) return NextResponse.json({ email: null });
  await ensureSchema();
  const r = await db().query<{ email: string }>('SELECT email FROM users WHERE id = $1', [id]);
  return NextResponse.json({ email: r.rows[0]?.email ?? null });
}

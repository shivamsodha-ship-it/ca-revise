import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { currentUser } from '@/lib/auth';
import { database } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Always 200: signed out is a normal state, and a 401 would show up as an error in every visitor's console.
export async function GET() {
  const id = await currentUser();
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ username: null });
  const db = await database();
  const user = await db.collection('users').findOne({ _id: new ObjectId(id) }, { projection: { username: 1 } });
  return NextResponse.json({ username: user?.username ?? null });
}

// Synced progress: one document per (user, key). Each write reads the stored copy, merges it with the incoming
// one, and writes back only if nobody changed it in between (version check), retrying on a clash. This keeps
// two devices syncing at the same moment from losing each other's changes, without needing transactions.
import { database } from './db';

interface Doc { userId: string; key: string; value: unknown; v: number }

export async function loadDocs(userId: string): Promise<Record<string, unknown>> {
  const db = await database();
  const rows = await db.collection<Doc>('docs').find({ userId }).toArray();
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

export async function mergeDocs(
  userId: string,
  incoming: Record<string, unknown>,
  merge: (key: string, stored: unknown, incoming: unknown) => unknown,
): Promise<Record<string, unknown>> {
  const db = await database();
  const col = db.collection<Doc>('docs');
  for (const [key, value] of Object.entries(incoming)) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const cur = await col.findOne({ userId, key });
      if (!cur) {
        try { await col.insertOne({ userId, key, value, v: 1 }); break; }
        catch (e: any) { if (e?.code === 11000) continue; throw e; }   // another device inserted first: merge again
      }
      const merged = merge(key, cur.value, value);
      const res = await col.updateOne({ userId, key, v: cur.v }, { $set: { value: merged as any }, $inc: { v: 1 } });
      if (res.modifiedCount === 1) break;
    }
  }
  return loadDocs(userId);
}

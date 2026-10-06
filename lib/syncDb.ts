// Synced progress, one row per (user, key). Merges run inside a transaction with a row lock, so two devices
// syncing at the same moment cannot lose each other's changes.
import { db, ensureSchema } from './db';

export async function loadDocs(userId: string): Promise<Record<string, unknown>> {
  await ensureSchema();
  const r = await db().query<{ key: string; value: unknown }>('SELECT key, value FROM docs WHERE user_id = $1', [userId]);
  return Object.fromEntries(r.rows.map(row => [row.key, row.value]));
}

export async function mergeDocs(
  userId: string,
  incoming: Record<string, unknown>,
  merge: (key: string, stored: unknown, incoming: unknown) => unknown,
): Promise<Record<string, unknown>> {
  await ensureSchema();
  const client = await db().connect();
  try {
    await client.query('BEGIN');
    for (const [key, value] of Object.entries(incoming)) {
      const cur = await client.query('SELECT value FROM docs WHERE user_id = $1 AND key = $2 FOR UPDATE', [userId, key]);
      const merged = cur.rows[0] ? merge(key, cur.rows[0].value, value) : value;
      await client.query(
        `INSERT INTO docs (user_id, key, value) VALUES ($1, $2, $3::jsonb)
         ON CONFLICT (user_id, key) DO UPDATE SET value = excluded.value, updated_at = now()`,
        [userId, key, JSON.stringify(merged)],
      );
    }
    const all = await client.query<{ key: string; value: unknown }>('SELECT key, value FROM docs WHERE user_id = $1', [userId]);
    await client.query('COMMIT');
    return Object.fromEntries(all.rows.map(row => [row.key, row.value]));
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

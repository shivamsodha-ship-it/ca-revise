// Postgres for accounts, sessions and synced progress. Connects with DATABASE_URL (Railway sets it when you
// add the Postgres plugin). The schema is created on first use; every statement is idempotent.
import { Pool } from 'pg';

let pool: Pool | null = null;
let ready: Promise<void> | null = null;

export function db(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    pool = new Pool({
      connectionString: url,
      max: 10,
      ssl: process.env.DATABASE_SSL === 'false' || /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY,
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash text PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
  CREATE TABLE IF NOT EXISTS docs (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key text NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, key)
  );
  CREATE TABLE IF NOT EXISTS login_attempts (
    bucket text PRIMARY KEY,
    count integer NOT NULL,
    window_start timestamptz NOT NULL
  );
`;

// Called before any query. Runs the schema once per process.
export function ensureSchema(): Promise<void> {
  if (!ready) ready = db().query(SCHEMA).then(() => undefined).catch(e => { ready = null; throw e; });
  return ready;
}

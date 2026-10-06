// MongoDB for accounts, sessions, connector keys and synced progress. Connects with MONGODB_URI (a free
// MongoDB Atlas M0 cluster works). Indexes are created once per server process.
import { MongoClient, type Db } from 'mongodb';

let dbPromise: Promise<Db> | null = null;

export function database(): Promise<Db> {
  if (!dbPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not set');
    const client = new MongoClient(uri, { maxPoolSize: 10 });
    dbPromise = client.connect().then(async c => {
      const db = c.db(process.env.MONGODB_DB || 'carevise');
      await Promise.all([
        db.collection('users').createIndex({ username: 1 }, { unique: true }),
        db.collection('sessions').createIndex({ tokenHash: 1 }, { unique: true }),
        db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
        db.collection('docs').createIndex({ userId: 1, key: 1 }, { unique: true }),
        db.collection('connectorKeys').createIndex({ keyHash: 1 }, { unique: true }),
        db.collection('loginAttempts').createIndex({ bucket: 1 }, { unique: true }),
        db.collection('loginAttempts').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      ]);
      return db;
    }).catch(e => { dbPromise = null; throw e; });
  }
  return dbPromise;
}

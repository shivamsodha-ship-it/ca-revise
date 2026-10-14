'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Shows who is signed in (or a sign-in link) in the top bar, so the username is never hard to find.
let cached: string | null | undefined;

export default function AccountChip() {
  const [name, setName] = useState<string | null | undefined>(cached);
  useEffect(() => {
    if (cached !== undefined) return;
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(r => (r.ok ? r.json() : { username: null }))
      .then(j => { cached = j.username ?? null; setName(cached); })
      .catch(() => setName(null));
  }, []);
  if (name === undefined) return null;
  return <Link href="/account" className="acct-chip" title={name ? 'Account and sync' : 'Sign in to sync progress'}>{name ?? 'Sign in'}</Link>;
}

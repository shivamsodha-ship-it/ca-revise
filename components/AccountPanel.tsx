'use client';
import { useEffect, useState } from 'react';
import { deleteAccount, signIn, signOut, signUp } from '@/lib/account';
import { getStatus, setAccount, syncNow, type SyncStatus } from '@/lib/sync';

type Mode = 'signin' | 'signup';

export default function AccountPanel() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [mode, setMode] = useState<Mode>('signin');
  const [addr, setAddr] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [delPw, setDelPw] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await fetch('/api/auth/me', { credentials: 'same-origin' }).catch(() => null);
      const e = r && r.ok ? ((await r.json()).email as string | null) : null;
      if (!alive) return;
      setAccount(e); setEmail(e); setStatus(getStatus());
    })();
    return () => { alive = false; };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    const r = mode === 'signup' ? await signUp(addr, pw) : await signIn(addr, pw);
    setBusy(false);
    if (r.ok) { setEmail(r.email ?? null); setPw(''); setStatus(getStatus()); } else setError(r.error ?? 'Something went wrong.');
  };
  const sync = async () => { setBusy(true); setStatus(await syncNow()); setBusy(false); };
  const logout = async () => { setBusy(true); await signOut(); setBusy(false); setEmail(null); setStatus(null); };
  const remove = async () => {
    setError(null); setBusy(true);
    const r = await deleteAccount(delPw);
    setBusy(false);
    if (r.ok) { setEmail(null); setConfirmDelete(false); setDelPw(''); } else setError(r.error ?? 'Could not delete the account.');
  };

  if (email === undefined) return <p className="muted">Checking your account…</p>;

  if (!email) return (
    <div className="card" style={{ padding: 18, display: 'grid', gap: 14 }}>
      <div className="seg" role="tablist" aria-label="Account">
        <button role="tab" aria-selected={mode === 'signin'} className={mode === 'signin' ? 'on' : ''} onClick={() => { setMode('signin'); setError(null); }}>Sign in</button>
        <button role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'on' : ''} onClick={() => { setMode('signup'); setError(null); }}>Create account</button>
      </div>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <label className="numrow" style={{ gridTemplateColumns: '1fr' }}><span>Email</span>
          <input type="email" autoComplete="email" autoCapitalize="none" required value={addr} onChange={e => setAddr(e.target.value)} /></label>
        <label className="numrow" style={{ gridTemplateColumns: '1fr' }}><span>Password{mode === 'signup' ? ' (at least 10 characters)' : ''}</span>
          <input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={mode === 'signup' ? 10 : 1} value={pw} onChange={e => setPw(e.target.value)} /></label>
        {error && <p role="alert" className="fb wrong" style={{ margin: 0 }}>{error}</p>}
        <button className="btn pri" disabled={busy}>{busy ? 'Working…' : mode === 'signup' ? 'Create account and sync' : 'Sign in and sync'}</button>
      </form>
      <p className="muted" style={{ margin: 0 }}>You can keep using the app without an account. Your progress on this device joins your account when you sign in.</p>
    </div>
  );

  return (
    <div className="card" style={{ padding: 18, display: 'grid', gap: 14 }}>
      <p style={{ margin: 0 }}><b>Signed in as {email}</b></p>
      <p className="muted" style={{ margin: 0 }} role="status">
        {status ? <>{status.ok ? 'Last synced' : 'Last attempt'} {new Date(status.at).toLocaleString()}. {status.message}</> : 'Not synced yet.'}
      </p>
      <div><button className="btn pri" disabled={busy} onClick={sync}>{busy ? 'Syncing…' : 'Sync now'}</button></div>
      <div><button className="btn" disabled={busy} onClick={logout}>Sign out of this device</button>
        <p className="muted" style={{ margin: '6px 0 0' }}>Signing out clears this device&apos;s progress. Your account keeps it.</p></div>
      <section style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
        {!confirmDelete ? <button className="btn" onClick={() => setConfirmDelete(true)}>Delete account…</button> : <div style={{ display: 'grid', gap: 10 }}>
          <p style={{ margin: 0 }}>This deletes your account and all synced progress. It cannot be undone. Enter your password to confirm.</p>
          <input type="password" autoComplete="current-password" aria-label="Password to confirm" value={delPw} onChange={e => setDelPw(e.target.value)} />
          {error && <p role="alert" className="fb wrong" style={{ margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" style={{ borderColor: 'var(--red, #c00)' }} disabled={busy || !delPw} onClick={remove}>Delete my account</button>
            <button className="btn" onClick={() => { setConfirmDelete(false); setError(null); }}>Keep my account</button>
          </div>
        </div>}
      </section>
    </div>
  );
}

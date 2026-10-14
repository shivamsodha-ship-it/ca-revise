'use client';
import { useEffect, useState } from 'react';
import { connectorStatus, createConnectorKey, deleteAccount, newRecoveryCode, recover, revokeConnectorKey, signIn, signOut, signUp } from '@/lib/account';
import { getStatus, setAccount, syncNow, type SyncStatus } from '@/lib/sync';

type Mode = 'signin' | 'signup' | 'recover';

const PIN_INPUT = { inputMode: 'numeric' as const, pattern: '[0-9]{6}', maxLength: 6, autoComplete: 'one-time-code', required: true };

export default function AccountPanel() {
  const [name, setName] = useState<string | null | undefined>(undefined);
  const [mode, setMode] = useState<Mode>('signin');
  const [user, setUser] = useState('');
  const [pin, setPin] = useState('');
  const [code, setCode] = useState('');
  const [newCode, setNewCode] = useState<string | null>(null);   // recovery code shown once after sign-up or recovery
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [delPin, setDelPin] = useState('');
  const [connected, setConnected] = useState<{ connected: boolean; createdAt: string | null } | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [connPin, setConnPin] = useState('');
  const [copied, setCopied] = useState('');
  const [codePin, setCodePin] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await fetch('/api/auth/me', { credentials: 'same-origin' }).catch(() => null);
      const n = r && r.ok ? ((await r.json()).username as string | null) : null;
      if (!alive) return;
      setAccount(n); setName(n); setStatus(getStatus());
      if (n) setConnected(await connectorStatus());
    })();
    return () => { alive = false; };
  }, []);

  const finish = async (r: { ok: boolean; error?: string; username?: string; recoveryCode?: string }) => {
    setBusy(false);
    if (!r.ok) { setError(r.error ?? 'Something went wrong.'); return; }
    setPin(''); setCode(''); setError(null);
    setName(r.username ?? null); setStatus(getStatus());
    if (r.recoveryCode) { setNewCode(r.recoveryCode); setSaved(false); }
    else setNewCode(null);
    if (r.username) setConnected(await connectorStatus());
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    if (mode === 'signup') await finish(await signUp(user.trim().toLowerCase(), pin));
    else if (mode === 'recover') await finish(await recover(user.trim().toLowerCase(), code, pin));
    else await finish(await signIn(user.trim().toLowerCase(), pin));
  };
  const sync = async () => { setBusy(true); setStatus(await syncNow()); setBusy(false); };
  const logout = async () => { setBusy(true); await signOut(); setBusy(false); setName(null); setStatus(null); setNewCode(null); setKey(null); };
  const remove = async () => {
    setError(null); setBusy(true);
    const r = await deleteAccount(delPin);
    setBusy(false);
    if (r.ok) { setName(null); setConfirmDelete(false); setDelPin(''); } else setError(r.error ?? 'Could not delete the account.');
  };
  const makeKey = async () => {
    setError(null); setBusy(true);
    const r = await createConnectorKey(connPin);
    setBusy(false);
    if (r.ok && r.key) { setKey(r.key); setConnPin(''); setConnected(await connectorStatus()); }
    else setError(r.error ?? 'Could not create the key.');
  };
  const makeCode = async () => {
    setError(null); setBusy(true);
    const r = await newRecoveryCode(codePin);
    setBusy(false);
    if (r.ok && r.code) { setNewCode(r.code); setSaved(false); setCodePin(''); }
    else setError(r.error ?? 'Could not create a new recovery code.');
  };
  const revoke = async () => { setBusy(true); await revokeConnectorKey(); setKey(null); setConnected(await connectorStatus()); setBusy(false); };
  const copy = async (label: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(''), 1500); } catch {}
  };

  if (name === undefined) return <p className="muted">Checking your account…</p>;

  if (name && newCode) return (
    <div className="card" style={{ padding: 18, display: 'grid', gap: 12 }}>
      <p style={{ margin: 0 }}><b>Save your recovery code.</b> If you forget your PIN, this code is the only way back in. It is shown once.</p>
      <code style={{ fontSize: 22, letterSpacing: 2, padding: 12, borderRadius: 10, background: 'var(--card)', border: '1px solid var(--line)', textAlign: 'center' }}>{newCode}</code>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn" onClick={() => copy('code', newCode)}>{copied === 'code' ? 'Copied' : 'Copy code'}</button>
      </div>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="checkbox" checked={saved} onChange={e => setSaved(e.target.checked)} /> I have saved this code somewhere safe
      </label>
      <button className="btn pri" disabled={!saved} onClick={() => setNewCode(null)}>Continue</button>
    </div>
  );

  if (!name) return (
    <div className="card" style={{ padding: 18, display: 'grid', gap: 14 }}>
      <div className="seg" role="tablist" aria-label="Account">
        <button role="tab" aria-selected={mode === 'signin'} className={mode === 'signin' ? 'on' : ''} onClick={() => { setMode('signin'); setError(null); }}>Sign in</button>
        <button role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'on' : ''} onClick={() => { setMode('signup'); setError(null); }}>Create account</button>
      </div>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <label className="numrow" style={{ gridTemplateColumns: '1fr' }}><span>Username</span>
          <input autoComplete="username" autoCapitalize="none" spellCheck={false} required minLength={3} maxLength={32} value={user} onChange={e => setUser(e.target.value)} placeholder="letters, numbers, _" /></label>
        {mode === 'recover' ? <label className="numrow" style={{ gridTemplateColumns: '1fr' }}><span>Recovery code</span>
          <input autoCapitalize="characters" spellCheck={false} required value={code} onChange={e => setCode(e.target.value)} placeholder="XXXX-XXXX-XXXX" /></label> : null}
        <label className="numrow" style={{ gridTemplateColumns: '1fr' }}><span>{mode === 'recover' ? 'New 6-digit PIN' : '6-digit PIN'}</span>
          <input {...PIN_INPUT} type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} /></label>
        {error && <p role="alert" className="fb wrong" style={{ margin: 0 }}>{error}</p>}
        <button className="btn pri" disabled={busy || pin.length !== 6}>{busy ? 'Working…' : mode === 'signup' ? 'Create account and sync' : mode === 'recover' ? 'Set new PIN and sign in' : 'Sign in and sync'}</button>
      </form>
      <button className="btn" style={{ justifySelf: 'start' }} onClick={() => { setMode(mode === 'recover' ? 'signin' : 'recover'); setError(null); }}>
        {mode === 'recover' ? 'Back to sign in' : 'Forgot PIN? Use recovery code'}
      </button>
      <p className="muted" style={{ margin: 0 }}>No email needed. You can keep using the app without an account; your progress on this device joins your account when you sign in.</p>
    </div>
  );

  return (
    <div className="card" style={{ padding: 18, display: 'grid', gap: 16 }}>
      <p style={{ margin: 0 }}><b>Signed in as {name}</b></p>
      <p className="muted" style={{ margin: 0 }} role="status">
        {status ? <>{status.ok ? 'Last synced' : 'Last attempt'} {new Date(status.at).toLocaleString()}. {status.message}</> : 'Not synced yet.'}
      </p>
      <div><button className="btn pri" disabled={busy} onClick={sync}>{busy ? 'Syncing…' : 'Sync now'}</button></div>

      <section style={{ borderTop: '1px solid var(--line)', paddingTop: 14, display: 'grid', gap: 10 }}>
        <h2 style={{ margin: 0 }}>Ask Claude about your progress</h2>
        <p className="muted" style={{ margin: 0 }}>Creates a read-only key for Claude Desktop or Claude Code. Creating a new key replaces the old one.</p>
        {key ? <>
          <code style={{ wordBreak: 'break-all', padding: 10, borderRadius: 10, background: 'var(--card)', border: '1px solid var(--line)' }}>{key}</code>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => copy('key', key)}>{copied === 'key' ? 'Copied' : 'Copy key'}</button>
            <button className="btn" onClick={() => copy('cmd', `claude mcp add --transport http carevise ${window.location.origin}/api/mcp --header "Authorization: Bearer ${key}"`)}>{copied === 'cmd' ? 'Copied' : 'Copy Claude Code command'}</button>
          </div>
          <p className="muted" style={{ margin: 0 }}>Shown once. Keep it private. The Claude Code command adds CA Revise as a tool source.</p>
        </> : connected?.connected ? <p className="muted" style={{ margin: 0 }}>A key exists{connected.createdAt ? `, created ${new Date(connected.createdAt).toLocaleDateString()}` : ''}. Create a new one to see it again.</p> : null}
        <form onSubmit={e => { e.preventDefault(); makeKey(); }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
          <label className="numrow" style={{ gridTemplateColumns: '1fr', flex: '1 1 160px' }}><span>PIN</span>
            <input {...PIN_INPUT} type="password" value={connPin} onChange={e => setConnPin(e.target.value.replace(/\D/g, ''))} /></label>
          <button className="btn" disabled={busy || connPin.length !== 6}>{connected?.connected ? 'Replace key' : 'Create key'}</button>
          {connected?.connected && <button type="button" className="btn" disabled={busy} onClick={revoke}>Revoke key</button>}
        </form>
      </section>

      <section style={{ borderTop: '1px solid var(--line)', paddingTop: 14, display: 'grid', gap: 10 }}>
        <h2 style={{ margin: 0 }}>Recovery code</h2>
        <p className="muted" style={{ margin: 0 }}>Lost your recovery code? Make a new one here. The old code stops working. It is shown once, so save it.</p>
        <form onSubmit={e => { e.preventDefault(); makeCode(); }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
          <label className="numrow" style={{ gridTemplateColumns: '1fr', flex: '1 1 160px' }}><span>PIN</span>
            <input {...PIN_INPUT} type="password" value={codePin} onChange={e => setCodePin(e.target.value.replace(/\D/g, ''))} /></label>
          <button className="btn" disabled={busy || codePin.length !== 6}>Make a new recovery code</button>
        </form>
      </section>

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, display: 'grid', gap: 8 }}>
        <div><button className="btn" disabled={busy} onClick={logout}>Sign out of this device</button></div>
        <p className="muted" style={{ margin: 0 }}>Signing out clears this device&apos;s progress. Your account keeps it.</p>
      </div>
      {error && <p role="alert" className="fb wrong" style={{ margin: 0 }}>{error}</p>}
      <section style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
        {!confirmDelete ? <button className="btn" onClick={() => setConfirmDelete(true)}>Delete account…</button> : <div style={{ display: 'grid', gap: 10 }}>
          <p style={{ margin: 0 }}>This deletes your account and all synced progress. It cannot be undone. Enter your PIN to confirm.</p>
          <input {...PIN_INPUT} type="password" aria-label="PIN to confirm" value={delPin} onChange={e => setDelPin(e.target.value.replace(/\D/g, ''))} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" disabled={busy || delPin.length !== 6} onClick={remove}>Delete my account</button>
            <button className="btn" onClick={() => { setConfirmDelete(false); setError(null); }}>Keep my account</button>
          </div>
        </div>}
      </section>
    </div>
  );
}

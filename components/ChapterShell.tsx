'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { findChapter } from '@/lib/registry';
import type { Casebook, Provision, Question } from '@/lib/casebook';
import type { Chapter, Subject } from '@/lib/types';

// Progress for casebook modes: r = last result per question (1 right, 0 wrong).
export interface CaseState { r: Record<string, 0 | 1>; best: number; streak: number; huntBest: number }
const EMPTY: CaseState = { r: {}, best: 0, streak: 0, huntBest: 0 };
const stateKey = (chapterId: string) => `ca-revise:v1:case:${chapterId}`;

export interface DrillOpts { clause?: string | null; focus?: string }

interface Ctx {
  subject: Subject;
  chapterId: string;
  base: string;
  ch: Chapter;
  cb: Casebook | null;
  P: Record<string, Provision>;
  Q: Record<string, Question>;
  S: CaseState;
  record: (id: string, ok: boolean, keep?: boolean) => void;
  setHuntBest: (n: number) => void;
  provStats: (pid: string) => { n: number; a: number; c: number };
  toast: (t: string) => void;
  openP: (id: string) => void;
  go: (view: string, opts?: DrillOpts) => void;
  drillReq: { n: number; opts?: DrillOpts };
}
const C = createContext<Ctx | null>(null);
export function useChapter() {
  const c = useContext(C);
  if (!c) throw new Error('useChapter outside ChapterShell');
  return c;
}

const FIRE = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c1 3.5-1.5 5-1.5 7.5 0 1.4 1 2.5 2.3 2.5 1.6 0 2.7-1.4 2.2-3.6C17.7 10 19 12.6 19 15a7 7 0 1 1-14 0c0-4.6 4.4-7.1 7-13z" /></svg>
);

export default function ChapterShell({ subject, chapterId, children }: { subject: Subject; chapterId: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const base = `/${subject}/${chapterId}`;
  const [ch, setCh] = useState<Chapter | null>(null);
  const [cb, setCb] = useState<Casebook | null>(null);
  const [missing, setMissing] = useState(false);
  const [S, setS] = useState<CaseState>(EMPTY);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [drillReq, setDrillReq] = useState<{ n: number; opts?: DrillOpts }>({ n: 0 });
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const row = findChapter(chapterId);
      if (!row || row.subject !== subject) { setMissing(true); return; }
      const [c, b] = await Promise.all([row.loader(), row.casebook ? row.casebook() : Promise.resolve(null)]);
      if (cancelled) return;
      setCh(c); setCb(b);
    })();
    try {
      const raw = localStorage.getItem(stateKey(chapterId));
      if (raw) setS({ ...EMPTY, ...JSON.parse(raw) });
    } catch {}
    return () => { cancelled = true; };
  }, [chapterId, subject]);

  const save = (s: CaseState) => { try { localStorage.setItem(stateKey(chapterId), JSON.stringify(s)); } catch {} };

  const toast = useCallback((t: string) => {
    setToastMsg(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  }, []);

  // keep=false is used by Clause Hunt: it moves the streak but does not store a result.
  const record = useCallback((id: string, ok: boolean, keep = true) => {
    setS(prev => {
      const next: CaseState = { ...prev, r: { ...prev.r } };
      if (keep) next.r[id] = ok ? 1 : 0;
      if (ok) {
        next.streak = prev.streak + 1;
        if (next.streak > next.best) next.best = next.streak;
        if (next.streak === 5 || next.streak === 10 || next.streak % 25 === 0) toast(next.streak + ' in a row. Keep going.');
      } else next.streak = 0;
      save(next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, chapterId]);

  const setHuntBest = useCallback((n: number) => {
    setS(prev => { if (n <= prev.huntBest) return prev; const next = { ...prev, huntBest: n }; save(next); return next; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  const P = useMemo(() => Object.fromEntries((cb?.P ?? []).map(p => [p.id, p])), [cb]);
  const Q = useMemo(() => Object.fromEntries((cb?.Q ?? []).map(q => [q.id, q])), [cb]);

  const provStats = useCallback((pid: string) => {
    const qs = P[pid]?.qs ?? [];
    let a = 0, c = 0;
    qs.forEach(id => { if (id in S.r) { a++; if (S.r[id]) c++; } });
    return { n: qs.length, a, c };
  }, [P, S]);

  const go = useCallback((view: string, opts?: DrillOpts) => {
    if (view === 'drill') setDrillReq(r => ({ n: r.n + 1, opts }));
    router.push(view === 'home' ? base : `${base}/${view}`);
    window.scrollTo(0, 0);
  }, [base, router]);

  const openP = useCallback((id: string) => {
    if (!P[id]) return;
    lastFocus.current = document.activeElement as HTMLElement;
    setDrawerId(id);
  }, [P]);
  const closeP = useCallback(() => {
    setDrawerId(null);
    try { lastFocus.current?.focus(); } catch {}
  }, []);

  // Provision links live inside HTML strings from the data (a.xref[data-p]), so clicks are delegated.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('[data-close]')) { closeP(); return; }
      const x = t.closest('a.xref,[data-p]');
      if (x) { e.preventDefault(); openP(x.getAttribute('data-p')!); return; }
      const qn = t.closest('[data-q]');
      if (qn) { closeP(); const id = qn.getAttribute('data-q')!; go(Q[id]?.k === 'mcq' ? 'mcq' : 'drill', { focus: id }); return; }
      const dr = t.closest('[data-drill]');
      if (dr) { closeP(); go('drill', { clause: dr.getAttribute('data-drill') }); }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeP(); };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); };
  }, [openP, closeP, go, Q]);

  useEffect(() => {
    document.body.style.overflow = drawerId ? 'hidden' : '';
    if (drawerId) { if (panelRef.current) panelRef.current.scrollTop = 0; closeRef.current?.focus(); }
  }, [drawerId]);

  // #provision-id deep links open the drawer, as in the artifact
  useEffect(() => {
    const h = location.hash.slice(1);
    if (h && P[h]) openP(h);
  }, [P, openP]);

  if (missing) return <main className="wrap loading">Chapter not found. <Link href="/">Home</Link></main>;
  if (!ch) return <main className="wrap loading">Loading chapter…</main>;

  const tabs: [string, string][] = cb
    ? [['home', 'Home'], ['drill', 'Case Drill'], ['hunt', 'Clause Hunt'], ['mcq', 'MCQ Sprint'], ['library', 'Law Library'], ['cheat', 'Cheat Sheet'], ['notes', 'Notes'], ['flip', 'Flip Cards'], ['practice', 'Practice']]
    : [['home', 'Home'], ['notes', 'Notes'], ['flip', 'Flip Cards'], ['practice', 'Practice']];
  const current = pathname === base ? 'home' : pathname.slice(base.length + 1).split('/')[0];

  const ctx: Ctx = { subject, chapterId, base, ch, cb, P, Q, S, record, setHuntBest, provStats, toast, openP, go, drillReq };

  return (
    <C.Provider value={ctx}>
      <header className="bar"><div className="wrap">
        <Link href={`/${subject}`} className="crumb" aria-label={`All ${subject.toUpperCase()} chapters`}>‹ {subject.toUpperCase()}</Link>
        <Link href={base} className="brand"><span className="seal">CA</span><span className="txt">{cb ? 'Ethics Casebook' : ch.title}</span></Link>
        <nav className="tabs" aria-label="Sections">
          {tabs.map(([v, l]) => (
            <Link key={v} href={v === 'home' ? base : `${base}/${v}`} className={'tab' + (current === v || (v === 'notes' && current === 'read') ? ' on' : '')}>{l}</Link>
          ))}
        </nav>
        {cb && <span className="streak" title="Current streak (best in brackets)">{FIRE} {S.streak} <span style={{ opacity: .7, fontWeight: 600 }}>({S.best})</span></span>}
      </div></header>
      <main className="wrap"><div className="view" key={pathname}>{children}</div></main>

      {drawerId && P[drawerId] && drawer(P[drawerId])}
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </C.Provider>
  );

  function drawer(p: Provision) {
    const s = provStats(p.id);
    return (
      <div className="drawer">
        <div className="scrim" data-close="1" />
        <aside className="panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="dtitle">
          <button className="x" data-close="1" aria-label="Close" ref={closeRef}>×</button>
          <span className="code">{p.label}</span>
          <h2 id="dtitle">{p.title}</h2>
          {p.law && <div className="law" dangerouslySetInnerHTML={{ __html: p.law }} />}
          {p.notes.length > 0 && <>
            <p className="law-h">What you need to know</p>
            <ul className="notes">{p.notes.map((n, i) => <li key={i} dangerouslySetInnerHTML={{ __html: n }} />)}</ul>
          </>}
          {p.upd && <div className="upd"><span className="badge-u">note</span><span dangerouslySetInnerHTML={{ __html: p.upd }} /></div>}
          {p.mem && <div className="memo"><b>Memory hook:</b> {p.mem}</div>}
          {p.qs.length > 0 && <>
            <p className="law-h">Tested in {p.qs.length} question{p.qs.length > 1 ? 's' : ''}{s.a ? ` · you got ${s.c}/${s.a}` : ''}</p>
            <div className="qlist">{p.qs.map(q => (
              <button key={q} className="chip" data-q={q}>{q}{q in S.r ? (S.r[q] ? ' ✓' : ' ✗') : ''}</button>
            ))}</div>
            <div className="nav"><span /><button className="btn pri" data-drill={p.id}>Drill these {p.qs.length} →</button></div>
          </>}
        </aside>
      </div>
    );
  }
}

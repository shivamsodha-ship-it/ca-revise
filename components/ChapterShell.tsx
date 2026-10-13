'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cap, metaOf, type Casebook, type Provision, type Question } from '@/lib/casebook';
import { EMPTY_STATE, loadCaseState, saveCaseState, type CaseState } from '@/lib/progress';
import type { Chapter, Subject } from '@/lib/types';
import { PENDING_DRILL } from '@/lib/weak';
import { SYNCED_EVENT } from '@/lib/sync';
import type { LearnData } from '@/lib/learnData';
import Jotter from '@/components/Jotter';
import { autoGames } from '@/lib/autoGames';

export interface DrillOpts { clause?: string | null; focus?: string; missed?: boolean }

interface Ctx {
  subject: Subject;
  subjectLabel: string;
  chapterId: string;
  base: string;
  ch: Chapter;
  cb: Casebook | null;
  learn: LearnData | null;
  meta: ReturnType<typeof metaOf> | null;
  P: Record<string, Provision>;
  Q: Record<string, Question>;
  S: CaseState;
  record: (id: string, ok: boolean, keep?: boolean) => void;
  setHuntBest: (n: number) => void;
  setLast: (view: string, id?: string) => void;
  provStats: (pid: string) => { n: number; a: number; c: number };
  toast: (t: string) => void;
  openP: (id: string) => void;
  go: (view: string, opts?: DrillOpts) => void;
  drillReq: { n: number; opts?: DrillOpts };
  views: ViewDef[];
}
const C = createContext<Ctx | null>(null);
export function useChapter() {
  const c = useContext(C);
  if (!c) throw new Error('useChapter outside ChapterShell');
  return c;
}

export interface ViewDef { id: string; label: string; group: 'learn' | 'test' | 'revise'; blurb: string }

// Every mode a chapter can have. Casebook modes appear only when the chapter has a casebook.
export function viewsFor(cb: Casebook | null, learn: LearnData | null = null): ViewDef[] {
  const m = cb ? metaOf(cb) : null;
  const all: (ViewDef & { casebook?: boolean })[] = [
    { id: 'vision', label: 'Vision', group: 'learn', blurb: 'The whole chapter on one page' },
    { id: 'path', label: 'Mastery path', group: 'learn', blurb: 'Learn it level by level, then prove it' },
    { id: 'compare', label: learn?.compare?.title ?? 'Compare', group: 'learn', blurb: 'Side by side, so nothing gets mixed up' },
    { id: 'connect', label: 'Connections', group: 'learn', blurb: 'How the ideas link up' },
    { id: 'memory', label: 'Memory', group: 'learn', blurb: 'Mnemonics and number cards', casebook: true },
    { id: 'solve', label: 'Step solver', group: 'test', blurb: 'Numericals in small steps, no calculator' },
    { id: 'games', label: 'Games', group: 'test', blurb: 'Match, sort and order to lock it in', casebook: true },
    { id: 'drill', label: cap(m?.caseNoun ?? 'case') + 's', group: 'test', blurb: m?.verdicts.length ? 'Read the facts and give your ruling' : 'Answer, then check the model answer', casebook: true },
    { id: 'hunt', label: cap(m?.provisionNoun ?? 'provision') + ' hunt', group: 'test', blurb: '10 rounds: spot the provision', casebook: true },
    { id: 'mcq', label: 'MCQs', group: 'test', blurb: 'Quick objective questions', casebook: true },
    { id: 'flip', label: 'Flip cards', group: 'test', blurb: 'Spaced-repetition recall' },
    { id: 'practice', label: 'Written', group: 'test', blurb: 'Write full answers, self-mark' },
    { id: 'notes', label: 'Notes', group: 'revise', blurb: 'Handwritten chapter notes' },
    { id: 'library', label: 'Law library', group: 'revise', blurb: 'Every provision in full', casebook: true },
    { id: 'cheat', label: 'Cheat sheet', group: 'revise', blurb: 'Numbers and fact triggers', casebook: true },
    { id: 'formulas', label: 'Formulas', group: 'revise', blurb: 'Master formulas, how each is derived, and why', casebook: true },
  ];
  const has: Record<string, boolean> = {
    path: !!learn?.levels?.length, compare: !!learn?.compare, solve: !!learn?.solves?.length, games: (learn?.games?.length ?? 0) + autoGames(cb).length > 0,
    vision: !!learn?.vision, connect: !!learn?.connect?.links?.length, memory: !!learn?.memory?.mnemonics?.length || (cb?.numbers.length ?? 0) > 0,
    formulas: (cb?.formulas?.length ?? 0) > 0,
  };
  return all.filter(v => (cb || !v.casebook) && (v.id in has ? has[v.id] : true));
}

const FIRE = (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 2c1 3.5-1.5 5-1.5 7.5 0 1.4 1 2.5 2.3 2.5 1.6 0 2.7-1.4 2.2-3.6C17.7 10 19 12.6 19 15a7 7 0 1 1-14 0c0-4.6 4.4-7.1 7-13z" /></svg>
);
const ICON: Record<string, JSX.Element> = {
  path: <path d="M5 19c0-4 4-3 7-6s0-6 3-8M5 19h.01M17 5h.01" />,
  games: <path d="M4 9h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 12v4M6 14h4M15 13h.01M18 15h.01M9 9l1-4h4l1 4" />,
  home: <path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" />,
  drill: <path d="M5 4h10l4 4v12H5zM14 4v5h5M8 13h8M8 17h6" />,
  notes: <path d="M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4" />,
  library: <path d="M4 5h5v15H4zM10 5h5v15h-5zM16 6l4-1 2 14-4 1z" />,
  flip: <path d="M4 7h12v12H4zM8 4h12v12" />,
  practice: <path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4" />,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
};
const Icon = ({ name }: { name: string }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={name === 'more' ? 3.2 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICON[name]}</svg>
);

export default function ChapterShell({ subject, subjectLabel, chapterId, ch, cb, learn, children }: {
  subject: Subject; subjectLabel: string; chapterId: string; ch: Chapter; cb: Casebook | null; learn: LearnData | null; children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const base = `/${subject}/${chapterId}`;
  const [S, setS] = useState<CaseState>(EMPTY_STATE);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [drillReq, setDrillReq] = useState<{ n: number; opts?: DrillOpts }>({ n: 0 });
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastFocus = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setS(loadCaseState(chapterId)); }, [chapterId]);
  // A sync that brings in another device's answers reloads this chapter's progress.
  useEffect(() => {
    const reload = () => setS(loadCaseState(chapterId));
    window.addEventListener(SYNCED_EVENT, reload);
    return () => window.removeEventListener(SYNCED_EVENT, reload);
  }, [chapterId]);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_DRILL);
      if (!raw) return;
      sessionStorage.removeItem(PENDING_DRILL);
      setDrillReq({ n: Date.now(), opts: JSON.parse(raw) });
    } catch {}
  }, []);
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  const update = useCallback((fn: (s: CaseState) => CaseState) => {
    setS(prev => { const next = fn(prev); if (next !== prev) saveCaseState(chapterId, next); return next; });
  }, [chapterId]);

  const toast = useCallback((t: string) => {
    setToastMsg(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  }, []);

  // keep=false (Provision Hunt) moves the streak without storing a result.
  const record = useCallback((id: string, ok: boolean, keep = true) => {
    update(prev => {
      const next: CaseState = { ...prev, r: { ...prev.r } };
      if (keep) { next.r[id] = ok ? 1 : 0; next.rt = { ...prev.rt, [id]: Date.now() }; }
      next.streak = ok ? prev.streak + 1 : 0;
      next.best = Math.max(prev.best, next.streak);
      return next;
    });
    const n = ok ? S.streak + 1 : 0;
    if (n === 5 || n === 10 || (n > 0 && n % 25 === 0)) toast(`${n} in a row`);
  }, [update, toast, S.streak]);
  const setHuntBest = useCallback((n: number) => update(p => n > p.huntBest ? { ...p, huntBest: n } : p), [update]);
  const setLast = useCallback((view: string, id?: string) => update(p => ({ ...p, last: { view, id } })), [update]);

  const P = useMemo(() => Object.fromEntries((cb?.P ?? []).map(p => [p.id, p])), [cb]);
  const Q = useMemo(() => Object.fromEntries((cb?.Q ?? []).map(q => [q.id, q])), [cb]);
  const meta = useMemo(() => (cb ? metaOf(cb) : null), [cb]);
  const views = useMemo(() => viewsFor(cb, learn), [cb, learn]);

  const provStats = useCallback((pid: string) => {
    const qs = P[pid]?.qs ?? [];
    let a = 0, c = 0;
    qs.forEach(id => { if (id in S.r) { a++; if (S.r[id]) c++; } });
    return { n: qs.length, a, c };
  }, [P, S]);

  const go = useCallback((view: string, opts?: DrillOpts) => {
    if (view === 'drill') setDrillReq(r => ({ n: r.n + 1, opts }));
    router.push(view === 'home' ? base : `${base}/${view}`);
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

  // Provision links also live inside HTML strings from the data (a.xref[data-p]), so clicks are delegated.
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
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { closeP(); setMoreOpen(false); } };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); };
  }, [openP, closeP, go, Q]);

  useEffect(() => {
    document.body.style.overflow = drawerId || moreOpen ? 'hidden' : '';
    if (drawerId) { if (panelRef.current) panelRef.current.scrollTop = 0; closeRef.current?.focus(); }
  }, [drawerId, moreOpen]);

  // #provision-id deep links open the drawer
  useEffect(() => {
    const h = location.hash.slice(1);
    if (h && P[h]) openP(h);
  }, [P, openP]);

  const current = pathname === base ? 'home' : pathname.slice(base.length + 1).split('/')[0].replace(/^read$/, 'notes');
  const href = (v: string) => (v === 'home' ? base : `${base}/${v}`);
  const aria = (v: string) => (current === v ? { 'aria-current': 'page' as const } : {});

  // Phone bottom bar: four direct destinations + More.
  const primary = learn?.levels?.length ? ['home', 'path', 'drill', 'games'] : cb ? ['home', 'drill', 'notes', 'library'] : ['home', 'notes', 'flip', 'practice'];
  const labelOf = (v: string) => (v === 'home' ? 'Home' : views.find(x => x.id === v)?.label ?? v);
  const moreViews = views.filter(v => !primary.includes(v.id));
  const moreActive = moreViews.some(v => v.id === current);

  const ctx: Ctx = { subject, subjectLabel, chapterId, base, ch, cb, learn, meta, P, Q, S, record, setHuntBest, setLast, provStats, toast, openP, go, drillReq, views };

  return (
    <C.Provider value={ctx}>
      <div data-subj={subject} className="subj-wrap">
      <header className="topbar">
        <div className="topbar-in">
          <Link href="/" className="brand" aria-label="CA Revise home"><span className="seal">CA</span></Link>
          <Link href={`/${subject}`} className="crumb">{subjectLabel}</Link>
          <span className="crumb-sep" aria-hidden="true">/</span>
          <Link href={base} className="chapter-name"><span className="chn">Ch {ch.number}</span> {ch.title}</Link>
          {cb && <span className="streak" title={`Current streak · best ${S.best}`}>{FIRE}<b>{S.streak}</b><span className="sr">correct in a row</span></span>}
        </div>
        <nav className="deskbar" aria-label="Chapter sections">
          <div className="deskbar-in">
            <Link href={base} className="dlink" {...aria('home')}>Overview</Link>
            {(['learn', 'test', 'revise'] as const).map(g => views.some(v => v.group === g) && (
              <div key={g} className="dgroup">
                <span className="dgroup-l">{g === 'learn' ? 'Understand' : g === 'test' ? 'Test yourself' : 'Revise'}</span>
                {views.filter(v => v.group === g).map(v => <Link key={v.id} href={href(v.id)} className="dlink" {...aria(v.id)}>{v.label}</Link>)}
              </div>
            ))}
          </div>
        </nav>
      </header>

      <main className="page" key={pathname}>{children}</main>

      <nav className="bottombar" aria-label="Chapter sections">
        {primary.map(v => (
          <Link key={v} href={href(v)} className="bitem" {...aria(v)}><Icon name={v} /><span>{labelOf(v)}</span></Link>
        ))}
        <button className="bitem" aria-expanded={moreOpen} aria-current={moreActive ? 'page' : undefined} onClick={() => setMoreOpen(o => !o)}><Icon name="more" /><span>More</span></button>
      </nav>

      {moreOpen && (
        <div className="sheet-wrap" onClick={e => { if (e.target === e.currentTarget) setMoreOpen(false); }}>
          <div className="sheet" role="dialog" aria-label="More sections">
            {moreViews.map(v => (
              <Link key={v.id} href={href(v.id)} className="sheet-row" {...aria(v.id)}>
                <span><b>{v.label}</b><small>{v.blurb}</small></span><span aria-hidden="true">›</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Jotter chapterId={chapterId} />
      {drawerId && P[drawerId] && drawer(P[drawerId])}
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
      </div>
    </C.Provider>
  );

  function drawer(p: Provision) {
    const s = provStats(p.id);
    return (
      <div className="drawer">
        <div className="scrim" data-close="1" />
        <aside className="dpanel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="dtitle">
          <div className="dpanel-head">
            <span className="code">{p.label}</span>
            <button className="x" data-close="1" aria-label="Close" ref={closeRef}>×</button>
          </div>
          <h2 id="dtitle">{p.title}</h2>
          {p.law && <div className="law" dangerouslySetInnerHTML={{ __html: p.law }} />}
          {p.notes.length > 0 && <>
            <h3 className="label">What you need to know</h3>
            <ul className="notes">{p.notes.map((n, i) => <li key={i} dangerouslySetInnerHTML={{ __html: n }} />)}</ul>
          </>}
          {p.upd && <div className="callout note"><b>Update</b><div dangerouslySetInnerHTML={{ __html: p.upd }} /></div>}
          {p.mem && <div className="callout hook"><b>Memory hook</b><div>{p.mem}</div></div>}
          {p.qs.length > 0 && <>
            <h3 className="label">Tested in {p.qs.length} question{p.qs.length > 1 ? 's' : ''}{s.a ? ` · you got ${s.c}/${s.a}` : ''}</h3>
            <div className="chips">{p.qs.map(q => (
              <button key={q} className={'chip' + (q in S.r ? (S.r[q] ? ' ok' : ' no') : '')} data-q={q}>{q}{q in S.r ? (S.r[q] ? ' ✓' : ' ✗') : ''}</button>
            ))}</div>
            <button className="btn primary block" data-drill={p.id}>Practise these {p.qs.length}</button>
          </>}
        </aside>
      </div>
    );
  }
}

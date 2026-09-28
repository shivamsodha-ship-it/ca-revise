'use client';
import { useEffect, useMemo, useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { cap, toneOf, stripTags } from '@/lib/casebook';
import { useKeys } from '@/lib/useKeys';

// Filters survive switching tabs, like the artifact's module-level DR.
const DR = { kind: 'all', status: 'all', clause: null as string | null, list: false, handled: 0 };

export default function DrillView() {
  const { cb, meta, P, Q, S, record, toast, drillReq } = useChapter();
  const [kind, setKind] = useState(DR.kind);
  const [status, setStatus] = useState(DR.status);
  const [clause, setClause] = useState<string | null>(DR.clause);
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState<Record<string, { pick?: string; ok?: boolean; self?: boolean }>>({});
  const [list, setList] = useState(DR.list);
  const [search, setSearch] = useState('');
  const [focus, setFocus] = useState<string | null>(null);

  // Requests from the drawer ("Drill these", question chips) or home.
  useEffect(() => {
    if (drillReq.n <= DR.handled) return;
    DR.handled = drillReq.n;
    const o = drillReq.opts;
    if (!o) return;
    if (o.focus) { setClause(null); setKind('all'); setStatus('all'); setFocus(o.focus); }
    else if (o.clause !== undefined) { setClause(o.clause); setKind('all'); setStatus('all'); setI(0); }
  }, [drillReq]);

  useEffect(() => { Object.assign(DR, { kind, status, clause, list }); }, [kind, status, clause, list]);

  const pool = useMemo(() => (cb?.Q ?? []).filter(q => {
    if (q.k === 'mcq') return false;
    if (clause && !q.links.includes(clause)) return false;
    if (kind !== 'all' && q.k !== kind) return false;
    if (status === 'new' && q.id in S.r) return false;
    if (status === 'missed' && S.r[q.id] !== 0) return false;
    return true;
  }).map(q => q.id),
  // The pool is fixed when filters change, not on every answer (so "New" doesn't drop the current case).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [cb, kind, status, clause]);

  useEffect(() => {
    if (focus) { setI(Math.max(0, pool.indexOf(focus))); setFocus(null); }
  }, [focus, pool]);

  const cur = pool.length ? Q[pool[Math.min(i, pool.length - 1)]] : null;
  const next = () => { if (i < pool.length - 1) { setI(i + 1); window.scrollTo(0, 0); } else toast(`End of this set. Change the filter for more ${meta?.caseNoun ?? 'case'}s.`); };
  const prev = () => setI(x => Math.max(0, x - 1));
  const keyMap: Record<string, () => void> = { ArrowRight: next, ArrowLeft: prev };
  if (cur && !answered[cur.id] && meta && toneOf(meta, cur.v)) meta.verdicts.forEach((v, n) => { keyMap[String(n + 1)] = () => pick(v.label); });
  useKeys(keyMap);

  if (!cb || !meta) return null;

  const setFilter = (fn: () => void) => { fn(); setI(0); setAnswered({}); };
  const q = pool.length ? Q[pool[Math.min(i, pool.length - 1)]] : null;
  const done = q ? answered[q.id] : undefined;
  const tone = q ? toneOf(meta, q.v) : null;
  const noun = meta.caseNoun;
  const kinds: [string, string][] = [['all', 'All'], ...meta.sources];

  function pick(v: string) { const q = cur; if (!q) return; const ok = v === q.v; setAnswered(a => ({ ...a, [q.id]: { pick: v, ok } })); record(q.id, ok); }
  const selfMark = (ok: boolean) => { if (!q) return; setAnswered(a => ({ ...a, [q.id]: { ...a[q.id], self: ok } })); record(q.id, ok); };

  const t = search.toLowerCase();
  return (
    <div className="drill">
      <h1 className="sr">{cap(noun)} drill</h1>
      <div className="dtop">
        <div className="seg scroll" role="group" aria-label="Source">{kinds.map(([k, l]) => <button key={k} className={kind === k ? 'on' : ''} aria-pressed={kind === k} onClick={() => setFilter(() => { setKind(k); setClause(null); })}>{l}</button>)}</div>
        <div className="seg" role="group" aria-label="Status">{[['all', 'All'], ['new', 'New'], ['missed', 'Missed']].map(([k, l]) => <button key={k} className={status === k ? 'on' : ''} aria-pressed={status === k} onClick={() => setFilter(() => setStatus(k))}>{l}</button>)}</div>
      </div>
      {clause && P[clause] && (
        <p className="muted" style={{ margin: '0 0 10px' }}>Drilling <button className="chip" data-p={clause}>{P[clause].label}</button> · <button className="chip" onClick={() => setFilter(() => setClause(null))}>Show all {meta.provisionNoun}s</button></p>
      )}
      <div className="track"><i style={{ transform: `scaleX(${pool.length ? (i + 1) / pool.length : 0})` }} /></div>

      {!q ? (
        <div className="card empty">No {noun}s match this filter.{status === 'missed' ? ` You have no missed ${noun}s here.` : ''}</div>
      ) : (
        <article className="card case" key={q.id}>
          <div className="chead"><span className="qid">{q.id}</span><span className={'src ' + q.k}>{q.src}</span><span className="count">{i + 1} / {pool.length}</span></div>
          <div className="facts" dangerouslySetInnerHTML={{ __html: q.q }} />
          {!done ? (tone ? <>
            <p className="ask">Your ruling?</p>
            <div className="vbtns" style={{ gridTemplateColumns: `repeat(${meta.verdicts.length}, minmax(0, 1fr))` }}>
              {meta.verdicts.map((v, n) => <button key={v.label} className={'vb ' + v.tone} onClick={() => pick(v.label)}>{v.label}{v.hint && <small>{v.hint}</small>}<kbd aria-hidden="true">{n + 1}</kbd></button>)}
            </div>
          </> : <>
            <p className="ask">Frame your answer in your head, then check it.</p>
            <button className="btn pri" onClick={() => setAnswered(a => ({ ...a, [q.id]: {} }))}>Reveal model answer</button>
          </>) : <>
            {tone && <>
              <div className={'stamp ' + tone} aria-hidden="true">{q.v.toUpperCase()}</div>
              <div className={'fb ' + (done.ok ? 'right' : 'wrong')} role="status">{done.ok ? 'Correct ruling.' : `You said ${done.pick}. The correct ruling is ${q.v}.`}</div>
            </>}
            <div className="answer">
              <div dangerouslySetInnerHTML={{ __html: q.a ?? '' }} />
              {q.trap && <div className="trap"><b>Examiner&apos;s trap</b><span dangerouslySetInnerHTML={{ __html: q.trap }} /></div>}
            </div>
            <p className="links"><span>Decided by</span>{q.links.map(l => P[l] && <button key={l} className="chip" data-p={l}>{P[l].label}</button>)}</p>
            {!tone && done.self === undefined && (
              <div className="self"><button className="btn" onClick={() => selfMark(true)}>✓ I had it</button><button className="btn" onClick={() => selfMark(false)}>✗ I missed points</button></div>
            )}
          </>}
        </article>
      )}

      <div className="nav">
        <button className="btn" disabled={i === 0} onClick={prev} aria-keyshortcuts="ArrowLeft">← Previous</button>
        <button className="btn" onClick={() => setList(l => !l)}>{list ? 'Hide list' : 'Browse all'}</button>
        <button className="btn pri" onClick={next} aria-keyshortcuts="ArrowRight">Next {noun} →</button>
      </div>

      {list && <>
        <input className="search" placeholder={`Search facts, names or ${meta.provisionNoun}s…`} aria-label={`Search ${noun}s`} style={{ marginTop: 18 }} value={search} onChange={e => setSearch(e.target.value)} />
        <div className="list">
          {pool.map((id, ix) => {
            const qq = Q[id]; const txt = stripTags(qq.q);
            if (t && (txt + ' ' + qq.src + ' ' + qq.links.map(l => P[l]?.label).join(' ')).toLowerCase().indexOf(t) === -1) return null;
            const st = id in S.r ? (S.r[id] ? 'ok' : 'no') : '';
            return <button key={id} className="row" onClick={() => { setI(ix); window.scrollTo(0, 0); }}><span className="qid">{id}</span><span className="snip">{txt}</span><span className={'st ' + st} /></button>;
          })}
        </div>
      </>}
    </div>
  );
}

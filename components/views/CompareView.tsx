'use client';
import { useEffect, useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { shuffle } from '@/lib/casebook';
import { useLearnState } from '@/lib/learn';
import { H, RunHead } from '@/components/learn/ui';

export default function CompareView() {
  const { learn, chapterId, P } = useChapter();
  const { L, bump } = useLearnState(chapterId);
  const [mode, setMode] = useState<'table' | 'quiz'>('table');
  const [diffOnly, setDiffOnly] = useState(false);
  const cmp = learn?.compare;
  const [order, setOrder] = useState<number[] | null>(null);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  useEffect(() => { if (cmp) setOrder(shuffle(cmp.sorter.map((_, n) => n))); }, [cmp]);
  if (!cmp) return null;
  const [A, B] = cmp.cols;
  const rows = cmp.rows.filter(r => !diffOnly || !r.same);
  const labels = [A, B, 'Both', 'Neither'];
  const cur = order && i < order.length ? cmp.sorter[order[i]] : null;
  const total = cmp.sorter.length;
  const answer = (n: number) => { if (pick !== null || !cur) return; setPick(n); if (n === cur.ans) setScore(s => s + 1); };
  const next = () => { if (i === total - 1) bump('lv', 'cmp', Math.round(score / total * 100)); setI(i + 1); setPick(null); };
  const restart = () => { setOrder(shuffle(cmp.sorter.map((_, n) => n))); setI(0); setPick(null); setScore(0); };

  return (
    <div className="lm">
      <header className="lm-head">
        <p className="eyebrow">Side by side</p>
        <h1>{A} or {B}? Know which is which</h1>
        <p className="lede">The same word means different limits in each world. Read the table once, then play the sorter until every statement lands in the right place first time.</p>
        <div className="seg" role="group" aria-label="Mode">
          <button className={mode === 'table' ? 'on' : ''} aria-pressed={mode === 'table'} onClick={() => setMode('table')}>Table</button>
          <button className={mode === 'quiz' ? 'on' : ''} aria-pressed={mode === 'quiz'} onClick={() => setMode('quiz')}>Which is which?{L.lv.cmp ? ` · best ${L.lv.cmp.best}%` : ''}</button>
        </div>
      </header>

      {mode === 'table' && <>
        <label className="lm-toggle"><input type="checkbox" checked={diffOnly} onChange={e => setDiffOnly(e.target.checked)} /> Show only what differs</label>
        <div className="lm-cmp" role="table" aria-label={`${A} compared with ${B}`}>
          <div className="lm-cmp-h" role="row"><span role="columnheader">Topic</span><span role="columnheader">{A}</span><span role="columnheader">{B}</span></div>
          {rows.map((r, n) => (
            <div key={n} className={'lm-cmp-r' + (r.same ? ' same' : '')} role="row">
              <span className="d" role="rowheader">{r.d}{r.same && <em>same in both</em>}{r.p && P[r.p] && <button className="chip" data-p={r.p}>{P[r.p].label}</button>}</span>
              <span className="a" role="cell" data-l={A}><H html={r.a} /></span>
              <span className="b" role="cell" data-l={B}><H html={r.b} /></span>
            </div>
          ))}
        </div>
      </>}

      {mode === 'quiz' && (
        <div className="card lm-card">
          {cur ? <>
            <RunHead left={`Statement ${i + 1} of ${total}`} right={`${score} right`} frac={i / total} />
            <p className="lm-q"><H html={cur.s} /></p>
            <div className="lm-four">{labels.map((l, n) => {
              const cls = pick === null ? '' : n === cur.ans ? 'right' : n === pick ? 'wrong' : '';
              return <button key={n} className={'lm-opt ' + cls} disabled={pick !== null} onClick={() => answer(n)}><span style={{ fontWeight: 700 }}>{l}</span></button>;
            })}</div>
            {pick !== null && <>
              <div className={'fb ' + (pick === cur.ans ? 'right' : 'wrong')} role="status">{pick === cur.ans ? 'Correct. ' : `It belongs to: ${labels[cur.ans]}. `}<H html={cur.why} /></div>
              <div className="lm-act"><button className="btn pri" autoFocus onClick={next}>{i === total - 1 ? 'See my score' : 'Next'}</button></div>
            </>}
          </> : (
            <div className="lm-done"><div className="lm-big">{score}<small>/{total}</small></div><p>{score === total ? 'Perfect sort.' : 'Check the table for the ones you missed, then go again.'}</p>
              <button className="btn pri" onClick={restart}>Shuffle and replay</button></div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { shuffle } from '@/lib/casebook';
import { checkNum, fmtNum } from '@/lib/numcheck';
import type { Recall } from '@/lib/learnData';

const H = ({ html }: { html: string }) => <span dangerouslySetInnerHTML={{ __html: html }} />;

// One recall question. Calls onDone(ok) when the learner presses Continue.
export function RecallCard({ r, onDone, last }: { r: Recall; onDone: (ok: boolean) => void; last?: boolean }) {
  const [pick, setPick] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [res, setRes] = useState<boolean | null>(null);
  const [mix, setMix] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);

  useEffect(() => { if (r.k === 'order') setMix(shuffle(r.items)); }, [r]);

  const done = res !== null;
  const finish = (ok: boolean) => setRes(ok);

  return (
    <div className="lm-rc">
      <p className="lm-q"><H html={r.q} /></p>

      {r.k === 'mc' && <div className="lm-opts">{r.opts.map((o, i) => {
        const cls = !done ? '' : i === r.ans ? 'right' : i === pick ? 'wrong' : '';
        return <button key={i} className={'lm-opt ' + cls} disabled={done} onClick={() => { setPick(i); finish(i === r.ans); }}><b>{'abcd'[i]}</b><span>{o}</span></button>;
      })}</div>}

      {r.k === 'tf' && <div className="lm-tf">{[true, false].map(v => {
        const cls = !done ? '' : v === r.ans ? 'right' : (pick === (v ? 1 : 0)) ? 'wrong' : '';
        return <button key={String(v)} className={'lm-opt ' + cls} disabled={done} onClick={() => { setPick(v ? 1 : 0); finish(v === r.ans); }}><span style={{ fontWeight: 700 }}>{v ? 'True' : 'False'}</span></button>;
      })}</div>}

      {r.k === 'num' && !done && (
        <form className="lm-num" onSubmit={e => { e.preventDefault(); const c = checkNum(typed, ['', r.ans, r.unit ?? '', r.tol]); if (c !== null) finish(c); }}>
          <input id="lm-num-in" aria-label="Your answer" inputMode="decimal" autoComplete="off" value={typed} onChange={e => setTyped(e.target.value)} placeholder={r.unit ? `Answer in ${r.unit}` : 'Your answer'} />
          <button className="btn pri" type="submit" disabled={!typed.trim()}>Check</button>
        </form>
      )}

      {r.k === 'order' && (
        <div>
          <ol className="lm-ord">{chosen.map((c, i) => <li key={i} className={done ? (c === r.items[i] ? 'right' : 'wrong') : ''}>{c}</li>)}</ol>
          {!done && <>
            <div className="lm-pool">{mix.filter(m => !chosen.includes(m)).map(m => <button key={m} className="lm-tok" onClick={() => setChosen(c => [...c, m])}>{m}</button>)}</div>
            <div className="lm-act">
              <button className="btn" disabled={!chosen.length} onClick={() => setChosen(c => c.slice(0, -1))}>Undo</button>
              <button className="btn pri" disabled={chosen.length !== r.items.length} onClick={() => finish(chosen.every((c, i) => c === r.items[i]))}>Check order</button>
            </div></>}
          {done && !res && <p className="lm-fix"><b>Correct order:</b> {r.items.join(' → ')}</p>}
        </div>
      )}

      {done && <>
        <div className={'fb ' + (res ? 'right' : 'wrong')} role="status">
          {res ? 'Correct. ' : r.k === 'num' ? `Not quite. The answer is ${fmtNum(['', r.ans, r.unit ?? ''])}. ` : 'Not quite. '}<H html={r.why} />
        </div>
        <div className="lm-act"><button className="btn pri" autoFocus onClick={() => onDone(!!res)}>{last ? 'See my score' : 'Continue'}</button></div>
      </>}
    </div>
  );
}

// A run of recall questions with a running tally and a score at the end.
export function RecallRun({ items, onFinish, label = 'Check' }: { items: Recall[]; onFinish: (pct: number) => void; label?: string }) {
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(0);
  const [fin, setFin] = useState(false);
  const [round, setRound] = useState(0);
  if (!items.length) return null;
  const pct = Math.round(ok / items.length * 100);

  if (fin) return (
    <div className="lm-done">
      <div className="lm-big">{ok}<small>/{items.length}</small></div>
      <p>{pct === 100 ? 'Clean sweep.' : pct >= 80 ? 'Level cleared.' : 'Almost. Read the lesson again, then retry.'}</p>
      <button className="btn" onClick={() => { setI(0); setOk(0); setFin(false); setRound(x => x + 1); }}>Try again</button>
    </div>
  );
  return (
    <div>
      <div className="lm-prog"><span>{label} {i + 1} of {items.length}</span><span>{ok} right</span></div>
      <div className="track"><i style={{ transform: `scaleX(${i / items.length})` }} /></div>
      <RecallCard key={round + ':' + i} r={items[i]} last={i === items.length - 1} onDone={good => {
        const n = ok + (good ? 1 : 0);
        setOk(n);
        if (i === items.length - 1) { setFin(true); onFinish(Math.round(n / items.length * 100)); } else setI(i + 1);
      }} />
    </div>
  );
}

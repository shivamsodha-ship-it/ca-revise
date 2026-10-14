'use client';
import { useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { checkNum, fmtNum } from '@/lib/numcheck';
import { useLearnState, type Solve } from '@/lib/learn';
import { HBlock as H, RunHead } from '@/components/learn/ui';


export default function SolveView() {
  const { learn, chapterId, P } = useChapter();
  const { L, bump } = useLearnState(chapterId);
  const [openId, setOpenId] = useState<string | null>(null);
  if (!learn?.solves) return null;
  const s = learn.solves.find(x => x.id === openId);
  if (s) return <Solver s={s} onBack={() => setOpenId(null)} bump={bump} L={L} P={P} />;

  return (
    <div className="lm">
      <header className="lm-head">
        <p className="eyebrow">Step solver</p>
        <h1>Numericals without a calculator</h1>
        <p className="lede">Every problem is cut into small steps with round numbers. Do each step in your head, type it, and see the working. The twisted versions change one fact, the way an examiner would.</p>
      </header>
      <ul className="rows">
        {learn.solves.map(x => {
          const done = x.variants.filter((_, i) => (L.sv[`${x.id}|${i}`]?.best ?? 0) >= 100).length;
          return (
            <li key={x.id}><button className="row" style={{ width: '100%', textAlign: 'left', background: 'none', border: 0 }} onClick={() => { setOpenId(x.id); window.scrollTo(0, 0); }}>
              <span className="row-t">{x.title}</span><span className="row-d">{x.tip}</span>
              <span className="row-n">{done}/{x.variants.length} perfect</span></button></li>
          );
        })}
      </ul>
    </div>
  );
}

function Solver({ s, onBack, bump, L, P }: { s: Solve; onBack: () => void; bump: (b: 'lv' | 'gm' | 'sv', id: string, pct: number) => void; L: ReturnType<typeof useLearnState>['L']; P: Record<string, { label: string }> }) {
  const [v, setV] = useState(0);
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState('');
  const [res, setRes] = useState<boolean | null>(null);
  const [right, setRight] = useState(0);
  const [log, setLog] = useState<{ note: string; ok: boolean }[]>([]);
  const variant = s.variants[v];
  const total = variant.steps.length;
  const cur = step < total ? variant.steps[step] : null;

  const reset = (nv: number) => { setV(nv); setStep(0); setTyped(''); setRes(null); setRight(0); setLog([]); window.scrollTo(0, 0); };
  const verdict = (ok: boolean) => { setRes(ok); if (ok) setRight(r => r + 1); };
  const advance = () => {
    if (!cur) return;
    setLog(l => [...l, { note: cur.note ?? cur.ask, ok: !!res }]);
    if (step === total - 1) bump('sv', `${s.id}|${v}`, Math.round((right) / total * 100));
    setStep(step + 1); setTyped(''); setRes(null);
  };
  const submit = () => { if (!cur || cur.kind !== 'num' || cur.ans === undefined) return; const c = checkNum(typed, ['', cur.ans, cur.unit ?? '', cur.tol]); if (c !== null) verdict(c); };

  return (
    <div className="lm">
      <button className="lm-back" onClick={onBack}>← All problems</button>
      <header className="lm-head">
        <p className="eyebrow">Step solver</p>
        <h1>{s.title}</h1>
        {s.p && P[s.p] && <p className="links" style={{ margin: '4px 0 0' }}><span>Rule</span><button className="chip" data-p={s.p}>{P[s.p].label}</button></p>}
      </header>

      <div className="seg" role="tablist" aria-label="Versions">
        {s.variants.map((x, i) => {
          const b = L.sv[`${s.id}|${i}`]?.best;
          return <button key={i} role="tab" aria-selected={v === i} className={v === i ? 'on' : ''} onClick={() => reset(i)}>{x.label}{b !== undefined ? ` · ${b}%` : ''}</button>;
        })}
      </div>

      <div className="callout hook lm-tip"><b>Mental-maths move</b><div>{s.tip}</div></div>

      {step === 0 ? (
        <div className="card lm-card"><H html={variant.q} className="facts" /></div>
      ) : (
        <details className="card lm-card lm-q-d"><summary>Show the question</summary><H html={variant.q} className="facts" /></details>
      )}

      {cur ? (
        <div className="card lm-card">
          <RunHead left={`Step ${step + 1} of ${total}`} right={`${right} right`} frac={step / total} />
          <p className="lm-q"><H html={cur.ask} className="inl" /></p>
          {cur.kind === 'num' && res === null && (
            <form className="lm-num" onSubmit={e => { e.preventDefault(); submit(); }}>
              <input id="solve-in" aria-label="Your answer" inputMode="decimal" autoComplete="off" autoFocus value={typed} onChange={e => setTyped(e.target.value)} placeholder={cur.unit ? `In ${cur.unit}` : 'Your answer'} />
              <button className="btn pri" type="submit" disabled={!typed.trim()}>Check</button>
              <button className="btn" type="button" onClick={() => verdict(false)}>Show me</button>
            </form>
          )}
          {cur.kind === 'pick' && <div className="lm-opts">{(cur.opts ?? []).map((o, i) => {
            const cls = res === null ? '' : i === cur.pickIx ? 'right' : '';
            return <button key={i} className={'lm-opt ' + cls} disabled={res !== null} onClick={() => verdict(i === cur.pickIx)}><b>{'abcd'[i]}</b><span>{o}</span></button>;
          })}</div>}
          {res !== null && <>
            <div className={'fb ' + (res ? 'right' : 'wrong')} role="status">
              {res ? 'Correct. ' : cur.kind === 'num' && cur.ans !== undefined ? `The figure here is ${fmtNum(['', cur.ans, cur.unit ?? ''])}. ` : 'Not this one. '}
              <span dangerouslySetInnerHTML={{ __html: cur.say }} />
            </div>
            <div className="lm-act"><button className="btn pri" autoFocus onClick={advance}>{step === total - 1 ? 'Finish' : 'Next step'}</button></div>
          </>}
        </div>
      ) : (
        <div className="card lm-card lm-done">
          <div className="lm-big">{right}<small>/{total}</small></div>
          <p>{right === total ? 'Every step right.' : 'Look at the steps marked ✗ above, then run it again.'}</p>
          <div className="lm-act">
            <button className="btn" onClick={() => reset(v)}>Retry this version</button>
            {v < s.variants.length - 1 && <button className="btn pri" onClick={() => reset(v + 1)}>Next: {s.variants[v + 1].label}</button>}
          </div>
        </div>
      )}
      <div className="lm-work card">
        <h2>Your working</h2>
        {log.length === 0 && <p className="muted">Each step you finish is written here, so you never need paper.</p>}
        <ol>{log.map((l, i) => <li key={i} className={l.ok ? 'ok' : 'no'}><span>{l.ok ? '✓' : '✗'}</span> <H html={l.note} className="inl" /></li>)}</ol>
      </div>

    </div>
  );
}

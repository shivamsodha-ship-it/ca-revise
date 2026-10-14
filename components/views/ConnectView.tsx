'use client';
import { useEffect, useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { shuffle } from '@/lib/casebook';
import { useLearnState, type ConnectLink, type LinkKind } from '@/lib/learn';
import { H, RunHead } from '@/components/learn/ui';

const KIND: Record<LinkKind, { sym: string; label: string; verb: string }> = {
  contrast: { sym: '⇄', label: 'Contrast', verb: 'is the opposite or counterpart of' },
  same: { sym: '=', label: 'Same rule', verb: 'follows the same rule as' },
  leads: { sym: '→', label: 'Leads to', verb: 'leads on to' },
  cross: { sym: '⟷', label: 'Across chapters', verb: 'connects with' },
};

export default function ConnectView() {
  const { learn, chapterId, P } = useChapter();
  const { L, bump } = useLearnState(chapterId);
  const links = learn?.connect?.links ?? [];
  const [mode, setMode] = useState<'map' | 'quiz'>('map');
  const [kind, setKind] = useState<'all' | LinkKind>('all');
  const [qs, setQs] = useState<{ l: ConnectLink; opts: string[] }[]>([]);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const deal = () => {
    const pool = shuffle(links).slice(0, 10);
    setQs(pool.map(l => ({ l, opts: shuffle([l.b, ...shuffle(links.filter(x => x.b !== l.b).map(x => x.b)).slice(0, 3)]) })));
    setI(0); setPick(null); setScore(0);
  };
  useEffect(deal, [learn]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!links.length) return null;
  const cur = qs[i];
  const shown = links.filter(l => kind === 'all' || l.kind === kind);
  const answer = (o: string) => { if (pick !== null || !cur) return; setPick(o); if (o === cur.l.b) setScore(s => s + 1); };
  const next = () => { if (i === qs.length - 1) bump('lv', 'connect', Math.round(score / qs.length * 100)); setI(i + 1); setPick(null); };

  return (
    <div className="lm">
      <header className="lm-head">
        <p className="eyebrow">Stage 5 · Connect</p>
        <h1>How the ideas link up</h1>
        <p className="lede">Facts you can connect are facts you can rebuild under pressure. Read the links, then play link-up until each partner comes without thinking.</p>
        <div className="seg" role="group" aria-label="Mode">
          <button className={mode === 'map' ? 'on' : ''} aria-pressed={mode === 'map'} onClick={() => setMode('map')}>The links ({links.length})</button>
          <button className={mode === 'quiz' ? 'on' : ''} aria-pressed={mode === 'quiz'} onClick={() => setMode('quiz')}>Link-up{L.lv.connect ? ` · best ${L.lv.connect.best}%` : ''}</button>
        </div>
      </header>

      {mode === 'map' && <>
        <div className="seg scroll" role="group" aria-label="Kind of link" style={{ marginBottom: 12 }}>
          <button className={kind === 'all' ? 'on' : ''} onClick={() => setKind('all')}>All</button>
          {(Object.keys(KIND) as LinkKind[]).filter(k => links.some(l => l.kind === k)).map(k => <button key={k} className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>{KIND[k].sym} {KIND[k].label}</button>)}
        </div>
        <ul className="cn-list">{shown.map((l, n) => (
          <li key={n} className={'cn-row ' + l.kind}>
            <div className="cn-pair"><b>{l.a}</b><span className="cn-sym" title={KIND[l.kind].label} aria-label={KIND[l.kind].label}>{KIND[l.kind].sym}</span><b>{l.b}</b></div>
            <p><H html={l.how} /></p>
            {l.p && P[l.p] && <button className="chip" data-p={l.p}>{P[l.p].label}</button>}
          </li>
        ))}</ul>
      </>}

      {mode === 'quiz' && (
        <div className="card lm-card">
          {cur ? <>
            <RunHead left={`Link ${i + 1} of ${qs.length}`} right={`${score} right`} frac={i / qs.length} />
            <p className="lm-q"><b>{cur.l.a}</b> <span className="muted">{KIND[cur.l.kind].verb}</span> …?</p>
            <div className="lm-opts">{cur.opts.map((o, k) => {
              const cls = pick === null ? '' : o === cur.l.b ? 'right' : o === pick ? 'wrong' : '';
              return <button key={k} className={'lm-opt ' + cls} disabled={pick !== null} onClick={() => answer(o)}><b>{'abcd'[k]}</b><span>{o}</span></button>;
            })}</div>
            {pick !== null && <>
              <div className={'fb ' + (pick === cur.l.b ? 'right' : 'wrong')} role="status">{pick === cur.l.b ? 'Correct. ' : `It is: ${cur.l.b}. `}<H html={cur.l.how} /></div>
              <div className="lm-act"><button className="btn pri" autoFocus onClick={next}>{i === qs.length - 1 ? 'See my score' : 'Next'}</button></div>
            </>}
          </> : <div className="lm-done"><div className="lm-big">{score}<small>/{qs.length}</small></div><button className="btn pri" onClick={deal}>New round</button></div>}
        </div>
      )}
    </div>
  );
}

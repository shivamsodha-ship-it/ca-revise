'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useChapter } from '@/components/ChapterShell';
import { VKEY, shuffle, type Casebook } from '@/lib/casebook';

interface Round { q: string; right: string; opts: string[]; pick: string | null }

const CLAUSEY_RE = /^(fs|ss|g-|s2|s6|s7|s8|s27|kyc|web|adv|noclar)/;

function newGame(cb: Casebook): Round[] {
  const clausey = cb.P.filter(p => CLAUSEY_RE.test(p.id)).map(p => p.id);
  return shuffle(cb.Q.filter(q => q.k !== 'mcq' && clausey.includes(q.links[0]))).slice(0, 10).map(q => {
    const right = q.links[0];
    const wrong = shuffle(clausey.filter(id => !q.links.includes(id))).slice(0, 3);
    return { q: q.id, right, opts: shuffle([right, ...wrong]), pick: null };
  });
}

export default function HuntView() {
  const { cb, P, Q, S, record, setHuntBest, base } = useChapter();
  const [rounds, setRounds] = useState<Round[]>(() => (cb ? newGame(cb) : []));
  const [i, setI] = useState(0);
  if (!cb) return null;

  const score = rounds.filter(r => r.pick && r.pick === r.right).length;
  const r = rounds[i];

  const choose = (id: string) => {
    if (!r || r.pick) return;
    const ok = id === r.right;
    setRounds(rs => rs.map((x, ix) => ix === i ? { ...x, pick: id } : x));
    record('hunt-' + r.q, ok, false);
  };
  const next = () => {
    const n = i + 1;
    if (n >= rounds.length) setHuntBest(score);
    setI(n);
  };
  const restart = () => { setRounds(newGame(cb)); setI(0); };

  const msg = score >= 9 ? 'Examiner-level instincts.' : score >= 7 ? 'Strong. A few clauses to tighten.' : score >= 5 ? 'Halfway there. Open the misses below.' : 'Worth a revision pass in the Law Library.';

  return (
    <div className="drill">
      <div className="dtop">
        <div><p className="eyebrow" style={{ margin: 0 }}>Clause Hunt</p><h2 style={{ fontSize: '1.4rem' }}>Which provision do these facts trigger?</h2></div>
        <div className="score">
          <div className="pips">{rounds.map((x, ix) => <i key={ix} className={x.pick ? (x.pick === x.right ? 'ok' : 'no') : (ix === i ? 'cur' : '')} />)}</div>
          <span>{score}/{rounds.length}</span>
        </div>
      </div>

      {i >= rounds.length ? (
        <div className="card result">
          <p className="eyebrow">Round over</p>
          <div className="bigscore">{score}/{rounds.length}</div>
          <p>{msg} Best: {Math.max(S.huntBest, score)}/10</p>
          <div className="weak" style={{ justifyContent: 'center', margin: '14px 0' }}>
            {rounds.filter(x => x.pick !== x.right).map(x => <button key={x.q} className="chip bad" data-p={x.right}>{P[x.right].label}</button>)}
          </div>
          <button className="btn pri" onClick={restart}>Play again</button>
        </div>
      ) : r && (
        <article className="card case">
          <div className="chead"><span className="qid">Round {i + 1}</span><span className={'src ' + Q[r.q].k}>{Q[r.q].src}</span></div>
          <div className="facts" dangerouslySetInnerHTML={{ __html: Q[r.q].q }} />
          <div className="opts">
            {r.opts.map(id => {
              const cls = r.pick ? (id === r.right ? 'right' : id === r.pick ? 'wrong' : '') : '';
              return <button key={id} className={'opt ' + cls} disabled={!!r.pick} onClick={() => choose(id)}><b>{P[id].label}</b><span>{P[id].short}</span></button>;
            })}
          </div>
          {r.pick && <>
            <div className={'fb ' + (r.pick === r.right ? 'right' : 'wrong')}>
              {r.pick === r.right ? 'Spot on.' : `It turns on ${P[r.right].label}.`}{Q[r.q].v in VKEY ? ` Ruling: ${Q[r.q].v}.` : ''}
            </div>
            <div className="nav"><button className="btn" data-p={r.right}>Read the clause</button><button className="btn pri" onClick={next}>{i === rounds.length - 1 ? 'See score' : 'Next round →'}</button></div>
          </>}
        </article>
      )}
      {rounds.length === 0 && <div className="card empty">No clause questions yet. <Link href={base}>Back</Link></div>}
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { shuffle } from '@/lib/casebook';
import { useLearnState, type Game } from '@/lib/learn';
import { autoGames } from '@/lib/autoGames';

const H = ({ html }: { html: string }) => <span dangerouslySetInnerHTML={{ __html: html }} />;
type Report = (pct: number) => void;

export default function GamesView() {
  const { learn, cb, chapterId } = useChapter();
  const { L, bump } = useLearnState(chapterId);
  const [openId, setOpenId] = useState<string | null>(null);
  const games: Game[] = [...(learn?.games ?? []), ...autoGames(cb)];
  if (!games.length) return null;
  const g = games.find(x => x.id === openId);

  if (g) return (
    <div className="lm">
      <button className="lm-back" onClick={() => setOpenId(null)}>← All games</button>
      <header className="lm-head"><p className="eyebrow">{g.type === 'match' ? 'Match-up' : g.type === 'sort' ? 'Sorter' : 'Sequence'}</p><h1>{g.title}</h1><p className="lede">{g.intro}</p></header>
      {g.type === 'match' && <Match g={g} report={p => bump('gm', g.id, p)} />}
      {g.type === 'sort' && <Sort g={g} report={p => bump('gm', g.id, p)} />}
      {g.type === 'order' && <Order g={g} report={p => bump('gm', g.id, p)} />}
    </div>
  );

  return (
    <div className="lm">
      <header className="lm-head"><p className="eyebrow">Games</p><h1>Lock it in</h1><p className="lede">Two minutes each. Play on the bus, in a queue, anywhere. Scores keep your best.</p></header>
      <ul className="rows">
        {games.map(x => (
          <li key={x.id}><button className="row" style={{ width: '100%', textAlign: 'left', background: 'none', border: 0, borderBottom: 0 }} onClick={() => { setOpenId(x.id); window.scrollTo(0, 0); }}>
            <span className="row-t">{x.title}</span><span className="row-d">{x.intro}</span>
            <span className="row-n">{L.gm[x.id] ? `Best ${L.gm[x.id].best}%` : x.type === 'match' ? 'Match-up' : x.type === 'sort' ? 'Sorter' : 'Sequence'}</span></button></li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Match: tap a left tile, then its partner ----------
function Match({ g, report }: { g: Extract<Game, { type: 'match' }>; report: Report }) {
  const [pairs, setPairs] = useState<[string, string][]>([]);
  const [right, setRight] = useState<string[]>([]);
  const [left, setLeft] = useState<string[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [miss, setMiss] = useState(0);
  const [bad, setBad] = useState<string | null>(null);
  const deal = () => {
    const p = shuffle(g.pairs).slice(0, 6);
    setPairs(p); setLeft(shuffle(p.map(x => x[0]))); setRight(shuffle(p.map(x => x[1]))); setSel(null); setDone([]); setMiss(0);
  };
  useEffect(deal, [g]); // eslint-disable-line react-hooks/exhaustive-deps
  const partner = (l: string) => pairs.find(p => p[0] === l)?.[1];
  const tapRight = (r: string) => {
    if (!sel || done.includes(sel)) return;
    if (partner(sel) === r) {
      const d = [...done, sel]; setDone(d); setSel(null);
      if (d.length === pairs.length) report(Math.round(pairs.length / (pairs.length + miss) * 100));
    } else { setMiss(m => m + 1); setBad(r); setTimeout(() => setBad(null), 450); }
  };
  const finished = pairs.length > 0 && done.length === pairs.length;
  return (
    <div className="card lm-card">
      <div className="lm-prog"><span>{done.length} of {pairs.length} matched</span><span>{miss} slips</span></div>
      <div className="track"><i style={{ transform: `scaleX(${pairs.length ? done.length / pairs.length : 0})` }} /></div>
      <div className="lm-match">
        <div>{left.map(l => <button key={l} className={'lm-tile' + (done.includes(l) ? ' ok' : '') + (sel === l ? ' sel' : '')} disabled={done.includes(l)} onClick={() => setSel(l)}><H html={l} /></button>)}</div>
        <div>{right.map(r => {
          const used = pairs.some(p => p[1] === r && done.includes(p[0]));
          return <button key={r} className={'lm-tile' + (used ? ' ok' : '') + (bad === r ? ' bad' : '')} disabled={used} onClick={() => tapRight(r)}><H html={r} /></button>;
        })}</div>
      </div>
      {!sel && !finished && <p className="muted lm-hint">Tap a tile on the left, then its partner on the right.</p>}
      {finished && <div className="lm-done"><div className="lm-big">{Math.round(pairs.length / (pairs.length + miss) * 100)}<small>%</small></div><p>{miss === 0 ? 'No slips.' : `${miss} slip${miss > 1 ? 's' : ''}. Again for a clean run.`}</p><button className="btn pri" onClick={deal}>New round</button></div>}
    </div>
  );
}

// ---------- Sort: one card at a time into the right bucket ----------
function Sort({ g, report }: { g: Extract<Game, { type: 'sort' }>; report: Report }) {
  const [order, setOrder] = useState<number[]>([]);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [ok, setOk] = useState(0);
  const [missed, setMissed] = useState<number[]>([]);
  const deal = () => { setOrder(shuffle(g.items.map((_, n) => n)).slice(0, 12)); setI(0); setPick(null); setOk(0); setMissed([]); };
  useEffect(deal, [g]); // eslint-disable-line react-hooks/exhaustive-deps
  const cur = i < order.length ? g.items[order[i]] : null;
  const go = (b: number) => { if (pick !== null || !cur) return; setPick(b); if (b === cur.b) setOk(o => o + 1); else setMissed(m => [...m, order[i]]); };
  const next = () => { if (i === order.length - 1) report(Math.round(ok / order.length * 100)); setI(i + 1); setPick(null); };
  return (
    <div className="card lm-card">
      {cur ? <>
        <div className="lm-prog"><span>Card {i + 1} of {order.length}</span><span>{ok} right</span></div>
        <div className="track"><i style={{ transform: `scaleX(${i / order.length})` }} /></div>
        <p className="lm-q lm-sortq"><H html={cur.t} /></p>
        <div className="lm-buckets" style={{ gridTemplateColumns: `repeat(${Math.min(g.buckets.length, 2)}, minmax(0, 1fr))` }}>{g.buckets.map((b, n) => {
          const cls = pick === null ? '' : n === cur.b ? 'right' : n === pick ? 'wrong' : '';
          return <button key={n} className={'lm-opt ' + cls} disabled={pick !== null} onClick={() => go(n)}><span style={{ fontWeight: 700 }}>{b}</span></button>;
        })}</div>
        {pick !== null && <>
          <div className={'fb ' + (pick === cur.b ? 'right' : 'wrong')} role="status">{pick === cur.b ? 'Right. ' : `It goes under: ${g.buckets[cur.b]}. `}{cur.why && <H html={cur.why} />}</div>
          <div className="lm-act"><button className="btn pri" autoFocus onClick={next}>{i === order.length - 1 ? 'See my score' : 'Next'}</button></div>
        </>}
      </> : (
        <div className="lm-done"><div className="lm-big">{ok}<small>/{order.length}</small></div>
          {missed.length > 0 && <div className="lm-miss"><b>Revisit</b><ul>{missed.map(m => <li key={m}><H html={g.items[m].t} /> <em>→ {g.buckets[g.items[m].b]}</em></li>)}</ul></div>}
          <button className="btn pri" onClick={deal}>New round</button></div>
      )}
    </div>
  );
}

// ---------- Order: tap steps in sequence ----------
function Order({ g, report }: { g: Extract<Game, { type: 'order' }>; report: Report }) {
  const [r, setR] = useState(0);
  const [mix, setMix] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [res, setRes] = useState<boolean | null>(null);
  const [ok, setOk] = useState(0);
  const round = g.rounds[r];
  useEffect(() => { if (round) setMix(shuffle(round.items)); setChosen([]); setRes(null); }, [round]);
  if (!round) return (
    <div className="card lm-card lm-done"><div className="lm-big">{ok}<small>/{g.rounds.length}</small></div><button className="btn pri" onClick={() => { setR(0); setOk(0); }}>Play again</button></div>
  );
  const check = () => { const good = chosen.every((c, i) => c === round.items[i]); setRes(good); if (good) setOk(o => o + 1); };
  const next = () => { if (r === g.rounds.length - 1) report(Math.round((ok) / g.rounds.length * 100)); setR(r + 1); };
  return (
    <div className="card lm-card">
      <div className="lm-prog"><span>Puzzle {r + 1} of {g.rounds.length}</span><span>{ok} right</span></div>
      <p className="lm-q"><H html={round.q} /></p>
      <ol className="lm-ord">{chosen.map((c, i) => <li key={i} className={res === null ? '' : c === round.items[i] ? 'right' : 'wrong'}>{c}</li>)}</ol>
      {res === null && <>
        <div className="lm-pool">{mix.filter(m => !chosen.includes(m)).map(m => <button key={m} className="lm-tok" onClick={() => setChosen(c => [...c, m])}>{m}</button>)}</div>
        <div className="lm-act"><button className="btn" disabled={!chosen.length} onClick={() => setChosen(c => c.slice(0, -1))}>Undo</button><button className="btn pri" disabled={chosen.length !== round.items.length} onClick={check}>Check order</button></div>
      </>}
      {res !== null && <>
        <div className={'fb ' + (res ? 'right' : 'wrong')} role="status">{res ? 'In order.' : `Correct order: ${round.items.join(' → ')}`}</div>
        <div className="lm-act"><button className="btn pri" autoFocus onClick={next}>{r === g.rounds.length - 1 ? 'See my score' : 'Next puzzle'}</button></div>
      </>}
    </div>
  );
}

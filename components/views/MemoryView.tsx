'use client';
import { useEffect, useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { shuffle, stripTags } from '@/lib/casebook';
import { useLearnState } from '@/lib/learn';
import { H, RunHead } from '@/components/learn/ui';

type Card = { id: string; front: string; back: React.ReactNode; p?: string };

export default function MemoryView() {
  const { learn, cb, chapterId, P } = useChapter();
  const { L, bump } = useLearnState(chapterId);
  const mem = learn?.memory;
  const [tab, setTab] = useState<'mn' | 'num' | 'story'>(mem?.mnemonics?.length ? 'mn' : 'num');
  const [deck, setDeck] = useState<Card[]>([]);
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const [got, setGot] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);

  const build = (t: 'mn' | 'num') => {
    const cards: Card[] = t === 'mn'
      ? (mem?.mnemonics ?? []).map(m => ({ id: m.id, front: m.for, p: m.p, back: <><div className="mm-hook">{m.m}</div><p>{m.stands}</p>{m.story && <p className="muted"><H html={m.story} /></p>}</> }))
      : (cb?.numbers ?? []).filter(n => stripTags(n[1]).length < 80).map((n, k) => ({ id: 'n' + k, front: stripTags(n[0]), p: n[2], back: <div className="mm-hook">{stripTags(n[1])}</div> }));
    setDeck(shuffle(cards).slice(0, 10)); setI(0); setShow(false); setGot(0); setMissed([]);
  };
  useEffect(() => { if (tab !== 'story') build(tab); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mem && !cb?.numbers.length) return null;
  const cur = deck[i];
  const rate = (ok: boolean) => {
    const g = got + (ok ? 1 : 0);
    if (!ok && cur) setMissed(m => [...m, cur.front]);
    setGot(g);
    if (i === deck.length - 1) {
      const pct = Math.round(g / deck.length * 100);
      if (tab === 'mn') bump('lv', 'memory', pct); else bump('gm', 'numcards', pct);
    }
    setI(i + 1); setShow(false);
  };

  return (
    <div className="lm">
      <header className="lm-head">
        <p className="eyebrow">Stage 4 · Memory</p>
        <h1>Make it stick</h1>
        <p className="lede">Say the answer out loud before you reveal it. A hook you can recall in two seconds is worth ten re-reads.</p>
        <div className="seg" role="tablist" aria-label="Memory tools">
          {!!mem?.mnemonics?.length && <button role="tab" aria-selected={tab === 'mn'} className={tab === 'mn' ? 'on' : ''} onClick={() => setTab('mn')}>Mnemonics{L.lv.memory ? ` · best ${L.lv.memory.best}%` : ''}</button>}
          {!!cb?.numbers.length && <button role="tab" aria-selected={tab === 'num'} className={tab === 'num' ? 'on' : ''} onClick={() => setTab('num')}>Number cards{L.gm.numcards ? ` · best ${L.gm.numcards.best}%` : ''}</button>}
          {!!mem?.hooks?.length && <button role="tab" aria-selected={tab === 'story'} className={tab === 'story' ? 'on' : ''} onClick={() => setTab('story')}>Pictures and stories</button>}
        </div>
      </header>

      {tab === 'story' ? (
        <div className="mm-stories">{mem?.hooks?.map(h => <article key={h.id} className="card lm-card"><h3>{h.h}</h3><div className="lm-body"><H html={h.story} /></div></article>)}</div>
      ) : (
        <div className="card lm-card">
          {cur ? <>
            <RunHead left={`Card ${i + 1} of ${deck.length}`} right={`${got} known`} frac={i / deck.length} />
            <p className="lm-q">{tab === 'mn' ? 'Recall: ' : 'What is the figure for: '}{cur.front}</p>
            {!show ? <button className="btn pri" onClick={() => setShow(true)}>Reveal</button> : <>
              <div className="mm-back">{cur.back}</div>
              {cur.p && P[cur.p] && <p className="links"><span>Rule</span><button className="chip" data-p={cur.p}>{P[cur.p].label}</button></p>}
              <div className="lm-act"><button className="btn" onClick={() => rate(false)}>Missed it</button><button className="btn pri" onClick={() => rate(true)}>Knew it</button></div>
            </>}
          </> : (
            <div className="lm-done"><div className="lm-big">{got}<small>/{deck.length}</small></div>
              {missed.length > 0 && <div className="lm-miss"><b>Say these again</b><ul>{missed.map((m, k) => <li key={k}>{m}</li>)}</ul></div>}
              <button className="btn pri" onClick={() => build(tab as 'mn' | 'num')}>New round</button></div>
          )}
        </div>
      )}

      {tab === 'mn' && !!mem?.mnemonics?.length && (
        <section className="lm-sec"><h2 className="lm-step"><span>All mnemonics</span></h2>
          <ul className="mm-list">{mem.mnemonics.map(m => <li key={m.id}><b>{m.m}</b><span>{m.for}</span><small>{m.stands}</small></li>)}</ul></section>
      )}
    </div>
  );
}

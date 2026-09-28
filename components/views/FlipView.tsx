'use client';
import { useEffect, useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { getProgress, updateCard } from '@/lib/storage';
import { isDue, schedule, type Grade } from '@/lib/spacedRep';
import { shuffle } from '@/lib/casebook';
import type { Card } from '@/lib/types';

export default function FlipView() {
  const { ch } = useChapter();
  const [filter, setFilter] = useState<string>('due');
  const [order, setOrder] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);

  const build = (mode: string) => {
    const all = ch.sections.flatMap(s => s.cards);
    const prog = getProgress(ch.id);
    let pool = all;
    if (mode === 'due') pool = all.filter(x => isDue(prog[x.id]));
    else if (mode !== 'all') pool = ch.sections.find(s => s.id === mode)?.cards ?? [];
    setFilter(mode); setOrder(shuffle(pool)); setIdx(0); setFlipped(false); setDone(0);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => build('due'), [ch.id]);

  const grade = (g: Grade) => {
    const card = order[idx]; if (!card) return;
    updateCard(ch.id, card.id, schedule(getProgress(ch.id)[card.id], g));
    setDone(d => d + 1); setFlipped(false); setIdx(i => i + 1);
  };

  const card = order[idx];
  return (
    <div className="drill">
      <div className="dtop">
        <div><p className="eyebrow">Flip cards</p><h1 className="vh">Recall first, then rate yourself</h1></div>
        <div className="score"><span>{Math.min(idx + 1, order.length)} / {order.length}</span></div>
      </div>
      <div className="seg scroll" style={{ marginBottom: 12 }}>
        <button className={filter === 'due' ? 'on' : ''} onClick={() => build('due')}>Due today</button>
        <button className={filter === 'all' ? 'on' : ''} onClick={() => build('all')}>All cards</button>
        {ch.sections.map(s => <button key={s.id} className={filter === s.id ? 'on' : ''} onClick={() => build(s.id)}>{s.title}</button>)}
      </div>
      <div className="track"><i style={{ transform: `scaleX(${order.length ? idx / order.length : 0})` }} /></div>

      {!card ? (
        <div className="card result">
          <p className="eyebrow">Session done</p>
          <div className="bigscore">{done}</div>
          <p>card{done === 1 ? '' : 's'} reviewed. The scheduler brings each one back when it is due.</p>
          <button className="btn pri" onClick={() => build(filter)}>Go again</button>
        </div>
      ) : <>
        <div className={'flip' + (flipped ? ' on' : '')} role="button" tabIndex={0} aria-pressed={flipped} aria-label={flipped ? 'Card answer. Press to see the question' : 'Card question. Press to reveal the answer'} onClick={() => setFlipped(f => !f)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped(f => !f); } }}>
          <div className="flip-inner">
            <div className="flip-face flip-front card">
              <div className="chead"><span className="src">{card.type}</span>{card.tags?.slice(0, 3).map(t => <span key={t} className="chip">{t}</span>)}</div>
              <div className="flip-q">{card.front}</div>
              <p className="muted" style={{ textAlign: 'center', margin: 0, fontSize: 13 }}>Tap to reveal</p>
            </div>
            <div className="flip-face flip-back card">
              <div className="fback">
                {card.back.bareText && <div className="law" style={{ margin: 0 }}>{card.back.bareText}</div>}
                {card.back.simplified && <div><span className="lab">In plain words</span>{card.back.simplified}</div>}
                {card.back.exception && <div><span className="lab">Exception</span>{card.back.exception}</div>}
                {card.back.explanation && <div><span className="lab">Explanation</span>{card.back.explanation}</div>}
                {card.back.trap && <div className="trap"><b>Examiner&apos;s trap</b>{card.back.trap}</div>}
                {card.back.cases?.map((c, i) => <div key={i} className="upd" style={{ margin: 0 }}>{c}</div>)}
                {card.back.cross && card.back.cross.length > 0 && <p className="links" style={{ margin: 0 }}><span>Cross-refs</span>{card.back.cross.map(x => <span key={x} className="xref">{x}</span>)}</p>}
              </div>
            </div>
          </div>
        </div>
        {flipped ? (
          <div className="grades">
            <button className="vb bad" onClick={() => grade(0)}>Again<small>forgot</small></button>
            <button className="vb mixed" onClick={() => grade(3)}>Hard<small>shaky</small></button>
            <button className="vb good" onClick={() => grade(4)}>Good<small>got it</small></button>
            <button className="vb" onClick={() => grade(5)}>Easy<small>instant</small></button>
          </div>
        ) : (
          <div className="nav" style={{ justifyContent: 'center' }}><button className="btn pri" onClick={() => setFlipped(true)}>Show answer</button></div>
        )}
      </>}
    </div>
  );
}

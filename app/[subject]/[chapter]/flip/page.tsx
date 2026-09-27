'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { findChapter } from '@/lib/registry';
import { getProgress, updateCard } from '@/lib/storage';
import { isDue, schedule, type Grade } from '@/lib/spacedRep';
import type { Card, Chapter, Subject } from '@/lib/types';

export default function FlipDeck({ params }: { params: { subject: Subject; chapter: string } }) {
  const { subject, chapter: chapterId } = params;
  const [ch, setCh] = useState<Chapter | null>(null);
  const [order, setOrder] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filter, setFilter] = useState<'due' | 'all' | string>('due');
  const [done, setDone] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const row = findChapter(chapterId);
      if (!row) return;
      const c = await row.loader();
      if (cancelled) return;
      setCh(c);
      buildOrder(c, filter);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  function buildOrder(c: Chapter, mode: string) {
    const all = c.sections.flatMap(s => s.cards);
    const prog = getProgress(c.id);
    let pool = all;
    if (mode === 'due') pool = all.filter(x => isDue(prog[x.id]));
    else if (mode !== 'all') pool = c.sections.find(s => s.id === mode)?.cards ?? [];
    // Shuffle for varied recall
    pool = [...pool].sort(() => Math.random() - 0.5);
    setOrder(pool);
    setIdx(0);
    setFlipped(false);
    setDone(0);
  }

  function grade(g: Grade) {
    if (!ch || !order[idx]) return;
    const card = order[idx];
    const prev = getProgress(chapterId)[card.id];
    const next = schedule(prev, g);
    updateCard(chapterId, card.id, next);
    setDone(d => d + 1);
    setFlipped(false);
    setIdx(i => i + 1);
  }

  if (!ch) return <div className="p-6 font-note">Loading deck…</div>;

  const total = order.length;
  const card = order[idx];

  return (
    <main className="min-h-screen">
      <header className="px-4 pt-4 pb-3 rounded-b-3xl text-white"
        style={{ background: 'linear-gradient(135deg,#c0392b,#8e44ad)' }}>
        <div className="flex justify-between items-center">
          <Link href={`/${subject}/${chapterId}`} className="text-white/90 font-note text-sm">← Chapter</Link>
          <div className="font-head text-lg">🎴 Flip Cards</div>
          <div className="font-note text-sm">{Math.min(idx + 1, Math.max(total, 1))}/{total || 0}</div>
        </div>
        <div className="mt-2 flex gap-1 overflow-x-auto no-scroll-bar">
          <FilterChip on={filter === 'due'} onClick={() => { setFilter('due'); buildOrder(ch, 'due'); }}>Due today</FilterChip>
          <FilterChip on={filter === 'all'} onClick={() => { setFilter('all'); buildOrder(ch, 'all'); }}>All cards</FilterChip>
          {ch.sections.map(s => (
            <FilterChip key={s.id} on={filter === s.id} onClick={() => { setFilter(s.id); buildOrder(ch, s.id); }}>{s.emoji ?? '·'} {s.title}</FilterChip>
          ))}
        </div>
      </header>

      <section className="px-4 mt-4 pb-8">
        {!card && (
          <div className="paper rounded-2xl shadow-md">
            <div className="paper-inner text-center py-10">
              <div className="text-5xl mb-2">🎉</div>
              <div className="font-head text-2xl text-accent">Session done</div>
              <div className="font-note text-sm opacity-80 mt-1">
                Reviewed {done} card{done === 1 ? '' : 's'}. Come back tomorrow for the next round —
                the scheduler will queue what needs to come back.
              </div>
              <div className="mt-4 flex gap-2 justify-center">
                <button className="btn btn-ghost" onClick={() => buildOrder(ch, filter)}>Shuffle again</button>
                <Link href={`/${subject}/${chapterId}`} className="btn btn-primary">Chapter home</Link>
              </div>
            </div>
          </div>
        )}

        {card && (
          <>
            <div className={`flip ${flipped ? 'on' : ''}`} onClick={() => setFlipped(f => !f)}>
              <div className="flip-inner min-h-[380px]">
                {/* FRONT */}
                <div className="flip-face paper rounded-2xl shadow-md">
                  <div className="paper-inner min-h-[380px] flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="chip" style={{ background: typeToBg(card.type), color: '#fff' }}>{card.type}</span>
                      {card.tags?.slice(0, 3).map(t => (
                        <span key={t} className="chip" style={{ background:'#ecf0f1', color:'#5a6a8a' }}>{t}</span>
                      ))}
                    </div>
                    <div className="flex-1 flex items-center justify-center text-center">
                      <div>
                        <div className="font-head text-3xl leading-tight text-ink">{card.front}</div>
                        <div className="font-note text-sm opacity-70 mt-6">tap to reveal</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* BACK */}
                <div className="flip-face flip-back paper rounded-2xl shadow-md">
                  <div className="paper-inner">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="chip" style={{ background:'#27ae60', color:'#fff' }}>answer</span>
                      <span className="font-note text-xs opacity-70">tap to flip back</span>
                    </div>
                    <CardBack card={card} />
                  </div>
                </div>
              </div>
            </div>

            {flipped && (
              <div className="mt-4">
                <div className="font-note text-center text-sm opacity-80 mb-2">How well did you know it?</div>
                <div className="grid grid-cols-4 gap-2">
                  <button className="btn btn-again" onClick={(e) => { e.stopPropagation(); grade(0); }}>Again</button>
                  <button className="btn btn-hard"  onClick={(e) => { e.stopPropagation(); grade(3); }}>Hard</button>
                  <button className="btn btn-good"  onClick={(e) => { e.stopPropagation(); grade(4); }}>Good</button>
                  <button className="btn btn-easy"  onClick={(e) => { e.stopPropagation(); grade(5); }}>Easy</button>
                </div>
              </div>
            )}
            {!flipped && (
              <div className="mt-4 text-center">
                <button className="btn btn-ghost" onClick={() => setFlipped(true)}>Show answer</button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function FilterChip({ children, on, onClick }: { children: React.ReactNode; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-head"
      style={{ background: on ? '#fff' : 'rgba(255,255,255,0.2)', color: on ? '#c0392b' : '#fff' }}>
      {children}
    </button>
  );
}

function typeToBg(t: string) {
  return {
    clause: '#c0392b',
    concept: '#2874a6',
    illustration: '#8e44ad',
    mnemonic: '#e67e22',
    section: '#16a085',
    case: '#7b241c',
  }[t] ?? '#5a6a8a';
}

function CardBack({ card }: { card: Card }) {
  const b = card.back;
  return (
    <div className="text-sm leading-6 space-y-1">
      {b.bareText && <div className="rule"><b>Bare text:</b> {b.bareText}</div>}
      {b.simplified && <div className="exc"><b>In plain words:</b> {b.simplified}</div>}
      {b.exception && <div className="exc"><b>Exception:</b> {b.exception}</div>}
      {b.explanation && <div className="info"><b>Explanation:</b> {b.explanation}</div>}
      {b.trap && <div className="trap"><b>Trap:</b> {b.trap}</div>}
      {b.cases?.map((c, i) => <div key={i} className="case"><b>Case:</b> {c}</div>)}
      {b.cross && b.cross.length > 0 && (
        <div className="text-xs opacity-70 font-note pt-1">Cross-refs: {b.cross.join(' · ')}</div>
      )}
    </div>
  );
}

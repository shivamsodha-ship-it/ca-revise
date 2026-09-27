'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { findChapter } from '@/lib/registry';
import type { Chapter, Card, Subject } from '@/lib/types';

export default function ReadNotes({ params }: { params: { subject: Subject; chapter: string } }) {
  const { subject, chapter: chapterId } = params;
  const [ch, setCh] = useState<Chapter | null>(null);
  const [openSec, setOpenSec] = useState<string | null>(null);
  const [openCard, setOpenCard] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const row = findChapter(chapterId);
      if (!row) return;
      const c = await row.loader();
      if (cancelled) return;
      setCh(c);
      setOpenSec(c.sections[0]?.id ?? null);
    })();
    return () => { cancelled = true; };
  }, [chapterId]);

  if (!ch) return <div className="p-6 font-note">Loading notes…</div>;

  return (
    <main className="min-h-screen">
      <header className="px-4 pt-4 pb-3 rounded-b-3xl text-white"
        style={{ background: 'linear-gradient(135deg,#2874a6,#8e44ad)' }}>
        <div className="flex justify-between items-center">
          <Link href={`/${subject}/${chapterId}`} className="text-white/90 font-note text-sm">← Chapter</Link>
          <div className="font-head text-lg">📖 Read Notes</div>
          <div className="w-8"></div>
        </div>
      </header>

      <section className="px-4 mt-4 pb-10 space-y-3">
        {ch.sections.map(sec => (
          <div key={sec.id} className="paper rounded-2xl shadow-md overflow-hidden">
            <button className="w-full paper-inner text-left" onClick={() => setOpenSec(o => o === sec.id ? null : sec.id)}>
              <div className="flex items-center gap-2">
                <div className="text-2xl">{sec.emoji ?? '📌'}</div>
                <div className="flex-1">
                  <div className="font-head text-xl text-accent leading-none">{sec.title}</div>
                  <div className="font-note text-xs opacity-70 mt-1">{sec.cards.length} card{sec.cards.length === 1 ? '' : 's'}</div>
                </div>
                <div className="font-head text-accent text-xl">{openSec === sec.id ? '−' : '+'}</div>
              </div>
            </button>
            {openSec === sec.id && (
              <div className="border-t border-dashed border-gray-300 bg-white/60 p-3 space-y-2">
                {sec.cards.map(card => (
                  <div key={card.id} className="bg-white rounded-lg shadow-sm">
                    <button onClick={() => setOpenCard(o => o === card.id ? null : card.id)}
                      className="w-full text-left p-3 flex items-center gap-2">
                      <span className="chip" style={{ background: typeToBg(card.type), color:'#fff' }}>{card.type}</span>
                      <span className="font-hand text-sm flex-1">{card.front}</span>
                      <span className="text-accent font-head text-lg">{openCard === card.id ? '−' : '+'}</span>
                    </button>
                    {openCard === card.id && (
                      <div className="px-3 pb-3 text-sm leading-6 space-y-1 border-t border-dashed border-gray-200 pt-2">
                        {card.back.bareText && <div className="rule"><b>Bare text:</b> {card.back.bareText}</div>}
                        {card.back.simplified && <div className="exc"><b>Plain words:</b> {card.back.simplified}</div>}
                        {card.back.exception && <div className="exc"><b>Exception:</b> {card.back.exception}</div>}
                        {card.back.explanation && <div className="info"><b>Explanation:</b> {card.back.explanation}</div>}
                        {card.back.trap && <div className="trap"><b>Trap:</b> {card.back.trap}</div>}
                        {card.back.cases?.map((c, i) => <div key={i} className="case"><b>Case:</b> {c}</div>)}
                        {card.back.cross && card.back.cross.length > 0 && (
                          <div className="text-xs opacity-70 font-note">Cross: {card.back.cross.join(' · ')}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}

function typeToBg(t: string) {
  return {
    clause: '#c0392b', concept: '#2874a6', illustration: '#8e44ad',
    mnemonic: '#e67e22', section: '#16a085', case: '#7b241c',
  }[t] ?? '#5a6a8a';
}

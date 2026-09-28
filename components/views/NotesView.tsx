'use client';
import { useState } from 'react';
import { useChapter } from '@/components/ChapterShell';

// The only handwritten part of the app: everything is scoped under .hand.
const TYPE_BG: Record<string, string> = {
  clause: '#c0392b', concept: '#2874a6', illustration: '#8e44ad',
  mnemonic: '#e67e22', section: '#16a085', case: '#7b241c',
};

export default function NotesView() {
  const { ch } = useChapter();
  const [openSec, setOpenSec] = useState<string | null>(ch.sections[0]?.id ?? null);
  const [openCard, setOpenCard] = useState<string | null>(null);

  return (
    <div className="hand">
      <header className="vhead">
        <p className="eyebrow">Notes</p>
        <h1 className="h-title">{ch.title}: my notes</h1>
        <p className="h-note">{ch.sections.length} sections · tap one to open it</p>
      </header>

      <div className="notes-list">
        {ch.sections.map(sec => (
          <div key={sec.id} className="paper">
            <div className="paper-inner">
              <button className="sec-btn" onClick={() => setOpenSec(o => o === sec.id ? null : sec.id)} aria-expanded={openSec === sec.id}>
                <span style={{ fontSize: 24 }}>{sec.emoji ?? '📌'}</span>
                <span style={{ flex: 1 }}>
                  <span className="h-head" style={{ display: 'block' }}>{sec.title}</span>
                  <span className="h-note h-count">{sec.cards.length} point{sec.cards.length === 1 ? '' : 's'}</span>
                </span>
                <span className="pm">{openSec === sec.id ? '−' : '+'}</span>
              </button>

              {openSec === sec.id && sec.cards.map(card => (
                <div key={card.id} className="ncard">
                  <button onClick={() => setOpenCard(o => o === card.id ? null : card.id)} aria-expanded={openCard === card.id}>
                    <span className="h-chip" style={{ background: TYPE_BG[card.type] ?? '#5a6a8a' }}>{card.type}</span>
                    <span style={{ flex: 1 }}>{card.front}</span>
                    <span className="pm" style={{ fontSize: 22 }}>{openCard === card.id ? '−' : '+'}</span>
                  </button>
                  {openCard === card.id && (
                    <div className="nbody">
                      {card.back.bareText && <div className="h-rule"><b>Bare text:</b> {card.back.bareText}</div>}
                      {card.back.simplified && <div className="h-exc"><b>Plain words:</b> {card.back.simplified}</div>}
                      {card.back.exception && <div className="h-exc"><b>Exception:</b> {card.back.exception}</div>}
                      {card.back.explanation && <div className="h-info"><b>Explanation:</b> {card.back.explanation}</div>}
                      {card.back.trap && <div className="h-trap"><b>⚠ Trap:</b> {card.back.trap}</div>}
                      {card.back.cases?.map((c, i) => <div key={i} className="h-case"><b>Case:</b> {c}</div>)}
                      {card.back.cross && card.back.cross.length > 0 && (
                        <div className="h-note h-count">Cross-refs: {card.back.cross.join(' · ')}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

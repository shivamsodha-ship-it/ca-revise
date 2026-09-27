'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { findChapter } from '@/lib/registry';
import { addPractice, getPractice } from '@/lib/storage';
import type { Chapter, PracticeQ, Subject } from '@/lib/types';

export default function Practice({ params }: { params: { subject: Subject; chapter: string } }) {
  const { subject, chapter: chapterId } = params;
  const [ch, setCh] = useState<Chapter | null>(null);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [history, setHistory] = useState<Record<string, 'correct' | 'partial' | 'wrong' | undefined>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const row = findChapter(chapterId);
      if (!row) return;
      const c = await row.loader();
      if (cancelled) return;
      setCh(c);
      const past = getPractice(chapterId);
      const latest: Record<string, 'correct' | 'partial' | 'wrong'> = {};
      for (const p of past) if (!latest[p.qid]) latest[p.qid] = p.selfGrade;
      setHistory(latest);
    })();
    return () => { cancelled = true; };
  }, [chapterId]);

  const q: PracticeQ | undefined = ch?.practice[idx];

  function next() {
    setAnswer(''); setRevealed(false); setHintOpen(false);
    setIdx(i => (ch ? Math.min(i + 1, ch.practice.length - 1) : i));
  }
  function prev() {
    setAnswer(''); setRevealed(false); setHintOpen(false);
    setIdx(i => Math.max(0, i - 1));
  }
  function mark(g: 'correct' | 'partial' | 'wrong') {
    if (!q) return;
    addPractice(chapterId, {
      qid: q.id, at: new Date().toISOString(), answer, selfGrade: g,
    });
    setHistory(h => ({ ...h, [q.id]: g }));
  }

  if (!ch) return <div className="p-6 font-note">Loading practice…</div>;
  if (ch.practice.length === 0) {
    return (
      <div className="p-6">
        <Link href={`/${subject}/${chapterId}`} className="font-note text-sm text-accent">← Back</Link>
        <div className="paper rounded-2xl mt-3 shadow"><div className="paper-inner">
          <div className="font-head text-xl text-accent">No practice questions yet</div>
          <div className="text-sm mt-1">Add a <code>practice</code> array to this chapter's JSON.</div>
        </div></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="px-4 pt-4 pb-3 rounded-b-3xl text-white"
        style={{ background: 'linear-gradient(135deg,#27ae60,#16a085)' }}>
        <div className="flex justify-between items-center">
          <Link href={`/${subject}/${chapterId}`} className="text-white/90 font-note text-sm">← Chapter</Link>
          <div className="font-head text-lg">✍️ Practice</div>
          <div className="font-note text-sm">{idx + 1}/{ch.practice.length}</div>
        </div>
      </header>

      <section className="px-4 mt-4 pb-8">
        {q && (
          <>
            <div className="paper rounded-2xl shadow-md">
              <div className="paper-inner">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="chip" style={{ background:'#8e44ad', color:'#fff' }}>Q{idx + 1}</span>
                  {q.clauseRef && <span className="chip" style={{ background:'#fadbd8', color:'#7b241c' }}>{q.clauseRef}</span>}
                  {history[q.id] && (
                    <span className="chip" style={{
                      background: history[q.id] === 'correct' ? '#d5f5e3' : history[q.id] === 'partial' ? '#fff59d' : '#fadbd8',
                      color:     history[q.id] === 'correct' ? '#196f3d' : history[q.id] === 'partial' ? '#7d6608' : '#7b241c',
                    }}>last: {history[q.id]}</span>
                  )}
                </div>
                <div className="font-head text-xl text-ink leading-tight">{q.prompt}</div>
                {q.hints && q.hints.length > 0 && (
                  <div className="mt-3">
                    <button className="btn btn-ghost text-sm" onClick={() => setHintOpen(o => !o)}>
                      {hintOpen ? 'Hide hints' : `Show ${q.hints.length} hint${q.hints.length === 1 ? '' : 's'}`}
                    </button>
                    {hintOpen && (
                      <ul className="mt-2 space-y-1">
                        {q.hints.map((h, i) => <li key={i} className="info text-xs">💡 {h}</li>)}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here — apply the 4-step template: Cite → Rule + Regulation → Apply → Conclude"
                className="w-full rounded-2xl bg-white border-2 border-gray-200 p-3 text-[15px] leading-6 font-hand focus:border-accent focus:outline-none min-h-[180px]"
              />
              <div className="mt-1 flex justify-between text-xs opacity-70 font-note">
                <span>{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
                <span>writing counts — don't peek</span>
              </div>
            </div>

            {!revealed && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="btn btn-ghost" onClick={() => { setAnswer(''); }}>Clear</button>
                <button className="btn btn-primary" onClick={() => setRevealed(true)}>Reveal model answer →</button>
              </div>
            )}

            {revealed && (
              <>
                <div className="mt-3 paper rounded-2xl shadow-md">
                  <div className="paper-inner">
                    <div className="font-head text-xl text-accent mb-1">✅ Model answer</div>
                    <div className="text-sm leading-6 whitespace-pre-wrap">{q.modelAnswer}</div>
                    <div className="mt-3">
                      <div className="font-head text-lg text-ink">Marking points</div>
                      <ul className="mt-1 space-y-1">
                        {q.markingPoints.map((m, i) => (
                          <li key={i} className="text-sm flex gap-2">
                            <input type="checkbox" defaultChecked={false} className="mt-1" />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="font-note text-xs opacity-70 mt-2">Tick what your answer covered.</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button className="btn btn-again" onClick={() => mark('wrong')}>Wrong</button>
                  <button className="btn btn-hard" onClick={() => mark('partial')}>Partial</button>
                  <button className="btn btn-good" onClick={() => mark('correct')}>Correct</button>
                </div>
              </>
            )}

            <div className="mt-4 flex justify-between">
              <button className="btn btn-ghost" onClick={prev} disabled={idx === 0}>← Prev</button>
              <button className="btn btn-primary" onClick={next} disabled={idx === ch.practice.length - 1}>Next →</button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

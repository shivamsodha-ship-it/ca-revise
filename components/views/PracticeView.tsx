'use client';
import { useEffect, useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { addPractice, getPractice } from '@/lib/storage';

type SelfGrade = 'correct' | 'partial' | 'wrong';

export default function PracticeView() {
  const { ch } = useChapter();
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [hints, setHints] = useState(false);
  const [history, setHistory] = useState<Record<string, SelfGrade>>({});

  useEffect(() => {
    const latest: Record<string, SelfGrade> = {};
    for (const p of getPractice(ch.id)) if (!latest[p.qid]) latest[p.qid] = p.selfGrade;
    setHistory(latest);
  }, [ch.id]);

  if (ch.practice.length === 0) return <div className="card empty">No practice questions in this chapter yet.</div>;

  const q = ch.practice[idx];
  const move = (d: number) => { setAnswer(''); setRevealed(false); setHints(false); setIdx(i => Math.min(Math.max(0, i + d), ch.practice.length - 1)); window.scrollTo(0, 0); };
  const mark = (g: SelfGrade) => {
    addPractice(ch.id, { qid: q.id, at: new Date().toISOString(), answer, selfGrade: g });
    setHistory(h => ({ ...h, [q.id]: g }));
  };
  const last = history[q.id];
  const words = answer.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="drill">
      <div className="dtop">
        <div><p className="eyebrow">Written practice</p><h1 className="vh">Write the full answer. Then mark it.</h1></div>
        <div className="score"><span>{idx + 1} / {ch.practice.length}</span></div>
      </div>
      <div className="track"><i style={{ width: ((idx + 1) / ch.practice.length * 100) + '%' }} /></div>

      <article className="card case">
        <div className="chead">
          <span className="qid">Q{idx + 1}</span>
          {q.clauseRef && <span className="src">{q.clauseRef}</span>}
          {last && <span className={'src tone-' + (last === 'correct' ? 'good' : last === 'partial' ? 'mixed' : 'bad')}>Last time: {last}</span>}
        </div>
        <div className="facts"><p>{q.prompt}</p></div>
        {q.hints && q.hints.length > 0 && <>
          <button className="btn" onClick={() => setHints(h => !h)}>{hints ? 'Hide hints' : `Show ${q.hints.length} hint${q.hints.length === 1 ? '' : 's'}`}</button>
          {hints && <div className="trap" style={{ marginTop: 10 }}><b>Hints</b>{q.hints.map((h, i) => <p key={i}>{h}</p>)}</div>}
        </>}
      </article>

      <div style={{ marginTop: 14 }}>
        <textarea className="answerbox" aria-label="Your answer" value={answer} onChange={e => setAnswer(e.target.value)}
          placeholder="Provision → Rule and regulation → Apply to the facts → Conclude" />
        <p className="muted" style={{ margin: '4px 2px 0', fontSize: 12.5 }}>{words} words</p>
      </div>

      {!revealed ? (
        <div className="nav"><button className="btn" onClick={() => setAnswer('')}>Clear</button><button className="btn pri" onClick={() => setRevealed(true)}>Reveal model answer →</button></div>
      ) : <>
        <article className="card case" style={{ marginTop: 14 }}>
          <p className="eyebrow">Model answer</p>
          <div className="answer pre" style={{ borderTop: 0, marginTop: 0, paddingTop: 0 }}>{q.modelAnswer}</div>
          <p className="law-h">Marking points: tick what you covered</p>
          <ul className="mpoints">{q.markingPoints.map((m, i) => <li key={i}><label><input type="checkbox" /> <span>{m}</span></label></li>)}</ul>
        </article>
        <div className="vbtns" style={{ marginTop: 14 }}>
          <button className="vb bad" onClick={() => mark('wrong')}>Wrong</button>
          <button className="vb mixed" onClick={() => mark('partial')}>Partial</button>
          <button className="vb good" onClick={() => mark('correct')}>Correct</button>
        </div>
      </>}

      <div className="nav">
        <button className="btn" onClick={() => move(-1)} disabled={idx === 0}>← Previous</button>
        <button className="btn pri" onClick={() => move(1)} disabled={idx === ch.practice.length - 1}>Next →</button>
      </div>
    </div>
  );
}

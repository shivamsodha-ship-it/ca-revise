'use client';
import { useEffect, useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { shuffle } from '@/lib/casebook';

export default function McqView() {
  const { cb, P, Q, record } = useChapter();
  // Shuffled after mount so the server render and the first client render match.
  const [list, setList] = useState<string[] | null>(null);
  useEffect(() => { setList(shuffle((cb?.Q ?? []).filter(q => q.k === 'mcq').map(q => q.id))); }, [cb]);
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState<Record<string, number>>({});
  if (!cb) return null;
  if (!list) return <div className="drill"><div className="card case empty">Shuffling…</div></div>;

  const score = list.filter(id => picks[id] === Q[id].ans).length;
  const restart = () => { setList(shuffle(list)); setI(0); setPicks({}); };

  const q = i < list.length ? Q[list[i]] : null;
  const p = q ? picks[q.id] : undefined;

  return (
    <div className="drill">
      <div className="dtop">
        <div><p className="eyebrow">MCQ sprint</p><h1 className="vh">One mark each. No negative marking.</h1></div>
        <div className="score"><span>{score} / {list.length}</span></div>
      </div>
      <div className="track"><i style={{ width: (i / Math.max(list.length, 1) * 100) + '%' }} /></div>

      {!q ? (
        <div className="card result"><p className="eyebrow">{list.length ? 'Sprint complete' : 'No MCQs in this chapter yet'}</p><div className="bigscore">{score}/{list.length}</div><button className="btn pri" onClick={restart}>Shuffle and retry</button></div>
      ) : (
        <article className="card case">
          <div className="chead"><span className="qid">{q.id}</span><span className="src mcq">MCQ</span><span className="count">{i + 1} / {list.length}</span></div>
          <div className="facts" dangerouslySetInnerHTML={{ __html: q.q }} />
          <div className="opts">
            {(q.opts ?? []).map((o, ix) => {
              const cls = p === undefined ? '' : ix === q.ans ? 'right' : ix === p ? 'wrong' : '';
              return (
                <button key={ix} className={'opt ' + cls} disabled={p !== undefined}
                  onClick={() => { setPicks(x => ({ ...x, [q.id]: ix })); record(q.id, ix === q.ans); }}>
                  <b>({'abcd'[ix]})</b><span style={{ color: 'var(--ink)', fontSize: 14 }}>{o}</span>
                </button>
              );
            })}
          </div>
          {p !== undefined && <>
            <div className={'fb ' + (p === q.ans ? 'right' : 'wrong')} role="status">
              {p === q.ans ? 'Correct. ' : `Answer: (${'abcd'[q.ans ?? 0]}). `}<span dangerouslySetInnerHTML={{ __html: q.why ?? '' }} />
            </div>
            <p className="links"><span>Decided by</span>{q.links.map(l => P[l] && <button key={l} className="chip" data-p={l}>{P[l].label}</button>)}</p>
            <div className="nav"><span /><button className="btn pri" onClick={() => { setI(i + 1); window.scrollTo(0, 0); }}>{i === list.length - 1 ? 'Finish' : 'Next →'}</button></div>
          </>}
        </article>
      )}
    </div>
  );
}

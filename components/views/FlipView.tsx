'use client';
import { useEffect, useMemo, useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { getProgress, updateCard } from '@/lib/storage';
import { isDue, schedule, type Grade } from '@/lib/spacedRep';
import { shuffle } from '@/lib/casebook';
import { chapterCards } from '@/lib/formulaCards';
import type { Card, FormulaRecall } from '@/lib/types';
import { useKeys } from '@/lib/useKeys';

// A written name counts as right when it matches once spacing, case and punctuation are ignored.
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export default function FlipView() {
  const { ch, cb } = useChapter();
  const all = useMemo(() => chapterCards(ch, cb), [ch, cb]);
  const hasFormulas = all.some(c => c.type === 'formula');
  const [filter, setFilter] = useState<string>('due');
  const [order, setOrder] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const [typed, setTyped] = useState('');

  const build = (mode: string) => {
    const prog = getProgress(ch.id);
    let pool = all;
    if (mode === 'due') pool = all.filter(x => isDue(prog[x.id]));
    else if (mode === 'formulas') pool = all.filter(x => x.type === 'formula');
    else if (mode !== 'all') pool = ch.sections.find(s => s.id === mode)?.cards ?? [];
    setFilter(mode); setOrder(shuffle(pool)); setIdx(0); setFlipped(false); setDone(0); setTyped('');
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => build('due'), [ch.id]);

  const grade = (g: Grade) => {
    const card = order[idx]; if (!card) return;
    updateCard(ch.id, card.id, schedule(getProgress(ch.id)[card.id], g));
    setDone(d => d + 1); setFlipped(false); setIdx(i => i + 1); setTyped('');
  };

  const card = order[idx];
  const f: FormulaRecall | undefined = card?.formula;
  const GRADES: [Grade, string, string, string][] = [[0, 'Again', 'forgot', 'bad'], [3, 'Hard', 'shaky', 'mixed'], [4, 'Good', 'got it', 'good'], [5, 'Easy', 'instant', 'easy']];
  const keyMap: Record<string, () => void> = {};
  if (card) {
    keyMap[' '] = () => setFlipped(f => !f);
    if (flipped) GRADES.forEach(([g], n) => { keyMap[String(n + 1)] = () => grade(g); });
  }
  useKeys(keyMap);
  const wroteRight = f ? norm(typed) !== '' && norm(typed) === norm(f.name) : false;
  return (
    <div className="drill">
      <div className="dtop">
        <div><p className="eyebrow">Flip cards</p><h1 className="vh">Recall first, then rate yourself</h1></div>
        <div className="score"><span>{Math.min(idx + 1, order.length)} / {order.length}</span></div>
      </div>
      <div className="seg scroll" style={{ marginBottom: 12 }}>
        <button className={filter === 'due' ? 'on' : ''} onClick={() => build('due')}>Due today</button>
        <button className={filter === 'all' ? 'on' : ''} onClick={() => build('all')}>All cards</button>
        {hasFormulas && <button className={filter === 'formulas' ? 'on' : ''} onClick={() => build('formulas')}>Formulas</button>}
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
        <div key={card.id} className={'flip' + (flipped ? ' on' : '')} role="button" tabIndex={0} aria-pressed={flipped} aria-label={flipped ? 'Card answer. Press to see the question' : 'Card question. Press to reveal the answer'} onClick={() => setFlipped(x => !x)} onKeyDown={e => { if (e.key === 'Enter') setFlipped(x => !x); }}>
          <div className="flip-inner">
            <div className="flip-face flip-front card">
              <div className="chead"><span className="src">{f ? 'formula' : card.type}</span>{card.tags?.slice(0, 3).map(t => <span key={t} className="chip">{t}</span>)}</div>
              <div className="flip-q">{card.front}</div>
              <p className="muted" style={{ textAlign: 'center', margin: 0, fontSize: 13 }}><span className="tap-hint">Tap to reveal</span><span className="key-hint">Space to reveal</span></p>
            </div>
            <div className="flip-face flip-back card">
              <div className="fback">
                {f ? <>
                  <div className="flip-name">{f.name}</div>
                  <div className="fexpr-b" dangerouslySetInnerHTML={{ __html: f.expr }} />
                  {typed.trim() && <div className={'fb ' + (wroteRight ? 'right' : 'wrong')} role="status">You wrote “{typed.trim()}”{wroteRight ? ' — right.' : ' — compare with the name above.'}</div>}
                  {f.from.length > 0 && <div><span className="lab">Derived from</span>{f.from.join(' · ')}</div>}
                  {f.derive && <div><span className="lab">How it comes from its parent</span><span dangerouslySetInnerHTML={{ __html: f.derive }} /></div>}
                  <div><span className="lab">Why it works</span><span dangerouslySetInnerHTML={{ __html: f.logic }} /></div>
                  {f.trap && <div className="trap"><b>Examiner&apos;s trap</b><span dangerouslySetInnerHTML={{ __html: f.trap }} /></div>}
                  {f.hook && <div><span className="lab">Memory hook</span>{f.hook}</div>}
                </> : <>
                  {card.back.bareText && <div className="law" style={{ margin: 0 }}>{card.back.bareText}</div>}
                  {card.back.simplified && <div><span className="lab">In plain words</span>{card.back.simplified}</div>}
                  {card.back.exception && <div><span className="lab">Exception</span>{card.back.exception}</div>}
                  {card.back.explanation && <div><span className="lab">Explanation</span>{card.back.explanation}</div>}
                  {card.back.trap && <div className="trap"><b>Examiner&apos;s trap</b>{card.back.trap}</div>}
                  {card.back.cases?.map((c, i) => <div key={i} className="upd" style={{ margin: 0 }}>{c}</div>)}
                  {card.back.cross && card.back.cross.length > 0 && <p className="links" style={{ margin: 0 }}><span>Cross-refs</span>{card.back.cross.map(x => <span key={x} className="xref">{x}</span>)}</p>}
                </>}
              </div>
            </div>
          </div>
        </div>
        {f && !flipped && (
          <label className="numrow" style={{ marginTop: 12 }}>
            <span>Write the formula name, then reveal</span>
            <input autoComplete="off" value={typed} placeholder="e.g. Sharpe ratio" onChange={e => setTyped(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') setFlipped(true); }} />
          </label>
        )}
        {flipped ? (
          <div className="grades">
            {GRADES.map(([g, label, hint, tone], n) => <button key={g} className={'vb ' + tone} onClick={() => grade(g)}>{label}<small>{hint}</small><kbd aria-hidden="true">{n + 1}</kbd></button>)}
          </div>
        ) : (
          <div className="nav" style={{ justifyContent: 'center' }}><button className="btn pri" onClick={() => setFlipped(true)} aria-keyshortcuts="Space">{f ? 'Reveal formula' : 'Show answer'}</button></div>
        )}
      </>}
    </div>
  );
}

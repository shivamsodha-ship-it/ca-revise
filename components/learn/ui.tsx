'use client';
import { useEffect, useState } from 'react';
import { shuffle } from '@/lib/casebook';

// HTML coming from the chapter data files (inline and block).
export const H = ({ html }: { html: string }) => <span dangerouslySetInnerHTML={{ __html: html }} />;
export const HBlock = ({ html, className }: { html: string; className?: string }) => <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;

// "Step 3 of 10 · 2 right" line with its progress track, shared by every quiz-style screen.
export const RunHead = ({ left, right, frac }: { left: string; right: string; frac: number }) => (
  <>
    <div className="lm-prog"><span>{left}</span><span>{right}</span></div>
    <div className="track"><i style={{ transform: `scaleX(${frac})` }} /></div>
  </>
);

// Tap the steps into order. `items` is the correct order; the board shuffles them and calls onCheck with the verdict.
export function OrderBoard({ items, result, onCheck }: { items: string[]; result: boolean | null; onCheck: (ok: boolean) => void }) {
  const [mix, setMix] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  useEffect(() => { setMix(shuffle(items)); setChosen([]); }, [items]);
  return (
    <div>
      <ol className="lm-ord">{chosen.map((c, i) => <li key={i} className={result === null ? '' : c === items[i] ? 'right' : 'wrong'}>{c}</li>)}</ol>
      {result === null && <>
        <div className="lm-pool">{mix.filter(m => !chosen.includes(m)).map(m => <button key={m} className="lm-tok" onClick={() => setChosen(c => [...c, m])}>{m}</button>)}</div>
        <div className="lm-act">
          <button className="btn" disabled={!chosen.length} onClick={() => setChosen(c => c.slice(0, -1))}>Undo</button>
          <button className="btn pri" disabled={chosen.length !== items.length} onClick={() => onCheck(chosen.every((c, i) => c === items[i]))}>Check order</button>
        </div>
      </>}
      {result === false && <p className="lm-fix"><b>Correct order:</b> {items.join(' → ')}</p>}
    </div>
  );
}

'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { EXAMS, STATUSES, TARGET, boardRows, daysTo, readiness, withSeed, type BoardItem, type SeedChapter, type Status } from '@/lib/plan';
import { usePlan } from '@/lib/planStore';
import type { Subject } from '@/lib/types';

// "3 Ind AS 115", "Ch 3: Ind AS 115" or "Ind AS 115": an optional chapter number, then the title.
function parseLine(line: string): { n?: number; t: string } | null {
  const m = line.trim().match(/^(?:ch(?:apter)?\.?\s*)?(\d{1,2})?\s*[.:)\-–]?\s*(.+)$/i);
  if (!m || !m[2].trim()) return null;
  return { n: m[1] ? Number(m[1]) : undefined, t: m[2].trim() };
}

// Every chapter of all three papers with a status. Built chapters come from the app; the rest the student adds.
export default function Board({ seed }: { seed: SeedChapter[] }) {
  const { board: saved, ready, saveBoard } = usePlan();
  const board = useMemo(() => withSeed(saved, seed), [saved, seed]);
  const [paste, setPaste] = useState<Record<string, string>>({});
  const built = new Set(seed.map(c => c.id));

  const put = (id: string, item: BoardItem) => saveBoard({ items: { ...saved.items, [id]: { ...item, u: Date.now() } } });
  const add = (s: Subject) => {
    const items = { ...saved.items };
    let i = 0;
    for (const line of (paste[s] ?? '').split('\n')) {
      const p = parseLine(line);
      if (p) items[`${s}-u${Date.now().toString(36)}${i++}`] = { s, ...p, st: 'todo', u: Date.now() };
    }
    if (i) { saveBoard({ items }); setPaste({ ...paste, [s]: '' }); }
  };

  if (!ready) return <p className="muted">Reading your board…</p>;
  return (
    <>
      {EXAMS.map(e => {
        const rows = boardRows(board, e.subject);
        const r = readiness(board, e.subject);
        const d = daysTo(e.date);
        return (
          <section key={e.subject} className="sec board" data-subj={e.subject}>
            <div className="sec-h">
              <h2>{e.label} <span className="muted">· {d > 0 ? `${d} days` : d === 0 ? 'today' : 'done'}</span></h2>
              <span className="muted">{r.pct}% ready · {r.sure} of {r.n} exam-ready</span>
            </div>
            <span className="cd-bar big" aria-label={`${r.pct}% ready, target ${TARGET}%`}><i style={{ width: `${r.pct}%` }} /><em style={{ left: `${TARGET}%` }} /></span>
            {rows.length > 0 && (
              <ol className="brows">
                {rows.map(([id, i]) => (
                  <li key={id} className={'brow st-' + i.st}>
                    <span className="brow-t">
                      {i.n ? <small>Ch {i.n}</small> : null}
                      {built.has(id) ? <Link href={`/${i.s}/${id}`}>{i.t}</Link> : i.t}
                    </span>
                    <select value={i.st} onChange={ev => put(id, { ...i, st: ev.target.value as Status })} aria-label={`Status of ${i.t}`}>
                      {STATUSES.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}
                    </select>
                    {!built.has(id) && <button className="x" onClick={() => put(id, { ...i, del: 1 })} aria-label={`Remove ${i.t}`}>×</button>}
                  </li>
                ))}
              </ol>
            )}
            <details className="badd" open={rows.length <= seed.filter(c => c.s === e.subject).length}>
              <summary>Add {e.label} chapters</summary>
              <p className="muted">Paste the chapter list from the contents page of your ICAI study material, one per line, for example <code>3 Ind AS 115 Revenue from Contracts with Customers</code>.</p>
              <textarea rows={5} value={paste[e.subject] ?? ''} onChange={ev => setPaste({ ...paste, [e.subject]: ev.target.value })} aria-label={`${e.label} chapters, one per line`} />
              <button className="btn" onClick={() => add(e.subject)} disabled={!(paste[e.subject] ?? '').trim()}>Add to board</button>
            </details>
          </section>
        );
      })}
      <p className="muted" style={{ marginTop: 24 }}>
        Ready counts Studying as 30%, Revised once as 70% and Exam-ready as 100% of a chapter; Skipping counts as 0.
        The {TARGET}% target line is the app&apos;s rule of thumb for a safe pass, not an ICAI figure. Pick what to skip from the chapters ICAI asks least.
      </p>
    </>
  );
}

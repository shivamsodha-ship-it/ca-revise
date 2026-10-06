'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { loadCaseState, type CaseState } from '@/lib/progress';
import { PENDING_DRILL, rankConcepts, type ConceptRow, type SlimProvision } from '@/lib/weak';

export interface SlimChapter { id: string; subject: string; subjectLabel: string; number: number; title: string; provisions: SlimProvision[] }

const PRIORITY = (exam: number) => (exam >= 5 ? 'High' : exam >= 2 ? 'Medium' : 'Low');
const SHOW = 40;

export default function WeakAreas({ chapters }: { chapters: SlimChapter[] }) {
  const [states, setStates] = useState<Record<string, CaseState> | null>(null);
  const [subj, setSubj] = useState('all');
  const [all, setAll] = useState(false);

  // Progress lives in this browser's localStorage, so it is read after mount.
  useEffect(() => {
    setStates(Object.fromEntries(chapters.map(c => [c.id, loadCaseState(c.id)])));
  }, [chapters]);

  const rows = useMemo(() => (states ? rankConcepts(chapters, states) : []), [chapters, states]);
  const shownRows = rows.filter(r => subj === 'all' || r.subject === subj);
  const subjects = chapters.filter((c, i, a) => a.findIndex(x => x.subject === c.subject) === i);
  const totalMisses = shownRows.reduce((n, r) => n + r.misses, 0);

  // Plain text for pasting into any chatbot (ChatGPT, Gemini), when no connector is available.
  const summary = () => {
    const top = shownRows.slice(0, 15);
    const lines = top.map((r, i) => `${i + 1}. ${r.label} · ${r.title} (${r.subject.toUpperCase()} Ch ${r.chNumber} ${r.chTitle}): ${r.misses ? `missed ${r.misses} of ${r.attempts}` : 'not tried yet'}, exam priority ${PRIORITY(r.exam)}`);
    return ['My CA Final weak concepts from CA Revise, ranked:', ...lines, '', 'Quiz me on these one at a time. Ask me the question first, check my answer against the ICAI rule, and point out the examiner trap.'].join('\n');
  };
  const [copied, setCopied] = useState(false);
  const copySummary = async () => {
    try { await navigator.clipboard.writeText(summary()); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  const drill = (r: ConceptRow) => {
    try { sessionStorage.setItem(PENDING_DRILL, JSON.stringify({ clause: r.pid, missed: r.misses > 0 })); } catch {}
  };

  if (!states) return <p className="muted">Reading your progress…</p>;
  if (!rows.length) return (
    <div className="card" style={{ padding: 18 }}>
      <p>Nothing to fix yet. Attempt a few case drills or MCQs and the concepts you miss appear here, ranked.</p>
      <p className="muted" style={{ margin: 0 }}>High-priority concepts you have not tried yet also appear here.</p>
    </div>
  );

  return (
    <>
      <div className="seg scroll" style={{ marginBottom: 12 }}>
        <button className={subj === 'all' ? 'on' : ''} onClick={() => setSubj('all')}>All subjects</button>
        {subjects.map(s => <button key={s.subject} className={subj === s.subject ? 'on' : ''} onClick={() => setSubj(s.subject)}>{s.subjectLabel}</button>)}
      </div>
      <p className="muted" style={{ margin: '0 0 12px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span>{shownRows.length} concept{shownRows.length === 1 ? '' : 's'} · {totalMisses} missed question{totalMisses === 1 ? '' : 's'}</span>
        {shownRows.length > 0 && <button className="btn" onClick={copySummary}>{copied ? 'Copied' : 'Copy for ChatGPT or Gemini'}</button>}
      </p>
      {shownRows.length === 0 ? <p className="muted">No weak concepts in this subject.</p> : (
        <ol className="chlist">
          {(all ? shownRows : shownRows.slice(0, SHOW)).map((r, i) => {
            const ch = chapters.find(c => c.id === r.chapterId);
            return (
              <li key={r.pid + r.chapterId} className="chrow weak-row">
                <span className="chnum">{String(i + 1).padStart(2, '0')}</span>
                <span className="chbody">
                  <span className="chtitle">{r.label}: {r.title}</span>
                  <span className="chsum">Ch {r.chNumber} {r.chTitle}, {ch?.subjectLabel}</span>
                  <span className="weak-meta">
                    <span className={'chip ' + (r.misses ? 'no' : '')}>{r.misses ? `${r.misses} missed` : 'not tried'}</span>
                    {r.attempts > 0 && <span className="chip">{r.attempts - r.misses}/{r.attempts} right</span>}
                    <span className="chip">Exam priority: {PRIORITY(r.exam)}</span>
                  </span>
                </span>
                <Link href={`/${r.subject}/${r.chapterId}/drill`} className="btn pri" onClick={() => drill(r)}>{r.misses ? 'Drill misses' : 'Drill'}</Link>
              </li>
            );
          })}
        </ol>
      )}
      {!all && shownRows.length > SHOW && <p style={{ textAlign: 'center' }}><button className="btn" onClick={() => setAll(true)}>Show all {shownRows.length}</button></p>}
    </>
  );
}

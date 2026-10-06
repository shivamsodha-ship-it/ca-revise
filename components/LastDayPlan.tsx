'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { loadCaseState, type CaseState } from '@/lib/progress';
import { PENDING_DRILL, rankConcepts, type SlimProvision } from '@/lib/weak';

export interface PlanChapter {
  id: string; number: number; title: string; weight: number; cards: number;
  hasCasebook: boolean; hasFormulas: boolean; hasMcqs: boolean;
  provisions: SlimProvision[];
}
interface Block { key: string; label: string; share: number; href: string; drill?: boolean }

const SETTINGS = (subject: string) => `ca-revise:v1:lastday:${subject}`;

// Time shares within a chapter. Casebook chapters get the full mix; the rest get notes, flip cards and writing.
function blocksFor(c: PlanChapter, base: string): Block[] {
  if (!c.hasCasebook) return [
    { key: 'notes', label: 'Skim the notes', share: 40, href: `${base}/notes` },
    { key: 'flip', label: 'Flip cards, due first', share: 40, href: `${base}/flip` },
    { key: 'practice', label: 'Write two answers', share: 20, href: `${base}/practice` },
  ];
  return [
    { key: 'cheat', label: 'Cheat sheet: figures and triggers', share: 10, href: `${base}/cheat` },
    ...(c.hasFormulas ? [{ key: 'formulas', label: 'Formula bank: master formulas', share: 15, href: `${base}/formulas` }] : []),
    { key: 'drill', label: 'Drill your misses', share: 35, href: `${base}/drill`, drill: true },
    ...(c.hasMcqs ? [{ key: 'mcq', label: 'MCQ sprint', share: 25, href: `${base}/mcq` }] : []),
    { key: 'flip', label: 'Flip cards, due first', share: 15, href: `${base}/flip` },
  ];
}

const fmt = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? m % 60 + ' min' : ''}`.trim() : `${m} min`);

export default function LastDayPlan({ subject, subjectLabel, chapters }: { subject: string; subjectLabel: string; chapters: PlanChapter[] }) {
  const [days, setDays] = useState(1.5);
  const [hours, setHours] = useState(8);
  const [done, setDone] = useState<Record<string, true>>({});
  const [states, setStates] = useState<Record<string, CaseState> | null>(null);

  // Settings and ticks are per-browser conveniences, so they are read after mount and never required.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS(subject));
      if (raw) { const v = JSON.parse(raw); if (v.days) setDays(v.days); if (v.hours) setHours(v.hours); if (v.done) setDone(v.done); }
    } catch {}
    setStates(Object.fromEntries(chapters.map(c => [c.id, loadCaseState(c.id)])));
  }, [subject, chapters]);

  const save = (next: { days: number; hours: number; done: Record<string, true> }) => {
    try { localStorage.setItem(SETTINGS(subject), JSON.stringify(next)); } catch {}
  };
  const update = (patch: Partial<{ days: number; hours: number; done: Record<string, true> }>) => {
    const next = { days, hours, done, ...patch };
    setDays(next.days); setHours(next.hours); setDone(next.done); save(next);
  };

  const total = Math.max(0, Math.round(days * hours * 60));
  const totalWeight = chapters.reduce((n, c) => n + (c.weight || 1), 0) || 1;
  const plan = useMemo(() => {
    let clock = 0;
    return chapters.map(c => {
      const mins = Math.round(total * (c.weight || 1) / totalWeight);
      const start = clock; clock += mins;
      const base = `/${subject}/${c.id}`;
      const blocks = blocksFor(c, base).map(b => ({ ...b, mins: Math.round(mins * b.share / 100) }));
      return { c, mins, start, blocks };
    });
  }, [chapters, total, totalWeight, subject]);

  const concepts = useMemo(() => (states ? rankConcepts(
    chapters.map(c => ({ id: c.id, subject, number: c.number, title: c.title, provisions: c.provisions })), states).slice(0, 10) : []),
    [chapters, states, subject]);

  const doneMins = plan.reduce((n, p) => n + p.blocks.reduce((m, b) => m + (done[p.c.id + ':' + b.key] ? b.mins : 0), 0), 0);
  const toggle = (k: string) => { const d = { ...done }; if (d[k]) delete d[k]; else d[k] = true; update({ done: d }); };

  if (!chapters.length) return <p className="muted">No chapters in {subjectLabel} yet.</p>;

  return (
    <>
      <section className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="numform" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <label className="numrow" style={{ gridTemplateColumns: '1fr' }}><span>Days left</span>
            <input type="number" min={0.5} step={0.5} value={days} onChange={e => update({ days: Math.max(0.5, Number(e.target.value) || 0.5) })} /></label>
          <label className="numrow" style={{ gridTemplateColumns: '1fr' }}><span>Hours a day</span>
            <input type="number" min={1} max={16} step={0.5} value={hours} onChange={e => update({ hours: Math.min(16, Math.max(1, Number(e.target.value) || 1)) })} /></label>
        </div>
        <p className="muted" style={{ margin: '12px 0 0' }}>{fmt(total)} in total · {fmt(doneMins)} ticked off · {chapters.length} chapters, longest-weighted first</p>
      </section>

      <section className="sec">
        <div className="sec-h"><h2>Concepts to hit first</h2><span className="muted">Ranked by misses and exam priority</span></div>
        {!states ? <p className="muted">Reading your progress…</p> : concepts.length ? (
          <ol className="numres" style={{ paddingLeft: 22 }}>
            {concepts.map(r => (
              <li key={r.pid + r.chapterId} style={{ margin: '6px 0' }}>
                <Link href={`/${subject}/${r.chapterId}/drill`} onClick={() => { try { sessionStorage.setItem(PENDING_DRILL, JSON.stringify({ clause: r.pid, missed: r.misses > 0 })); } catch {} }}>
                  {r.label} · {r.title}
                </Link> <span className="muted">Ch {r.chNumber} · {r.misses ? `${r.misses} missed` : 'not tried'}</span>
              </li>
            ))}
          </ol>
        ) : <p className="muted">No misses yet. Work the drills first, or use the time below to cover the chapters.</p>}
      </section>

      <section className="sec">
        <div className="sec-h"><h2>Timed plan</h2></div>
        {plan.map(({ c, mins, start, blocks }) => (
          <article key={c.id} className="card" style={{ padding: 14, marginBottom: 10 }}>
            <div className="sec-h" style={{ marginBottom: 6 }}>
              <h3 style={{ margin: 0 }}>Ch {c.number} · {c.title}</h3>
              <span className="muted">{fmt(start)} → {fmt(start + mins)} · {fmt(mins)}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {blocks.map(b => {
                const k = c.id + ':' + b.key;
                return (
                  <li key={b.key} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderTop: '1px solid var(--line)' }}>
                    <input type="checkbox" checked={!!done[k]} onChange={() => toggle(k)} aria-label={`Done: ${b.label}, Ch ${c.number}`} style={{ width: 20, height: 20 }} />
                    <span style={{ flex: 1, textDecoration: done[k] ? 'line-through' : 'none' }}>{b.label} <span className="muted">· {b.mins} min</span></span>
                    <Link className="chip" href={b.href} onClick={() => { if (b.drill) { try { sessionStorage.setItem(PENDING_DRILL, JSON.stringify({ clause: null, missed: true })); } catch {} } }}>Open →</Link>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </section>
    </>
  );
}

'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { EXAMS, FOCUS_KEY, STATUSES, TARGET, blocksOn, boardRows, dayKey, daysTo, readiness, streak, withSeed, type SeedChapter, type Status } from '@/lib/plan';
import { TIMER_KEY, read, usePlan, write } from '@/lib/planStore';
import type { Subject } from '@/lib/types';

interface Timer { end: number; s: Subject; c?: string; m: number }

const GOALS = [4, 6, 8, 10];
const LENGTHS = [25, 50];
const mmss = (ms: number) => { const t = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };

// Home screen: countdown, today's target, one suggested chapter and a focus timer. One tap to start studying.
export default function Today({ seed }: { seed: SeedChapter[] }) {
  const { board: saved, focus, ready, saveBoard, saveFocus } = usePlan();
  const board = useMemo(() => withSeed(saved, seed), [saved, seed]);
  const [now, setNow] = useState(() => Date.now());
  const [timer, setTimer] = useState<Timer | null>(null);
  const [justDone, setJustDone] = useState<Timer | null>(null);
  const [chosen, setPick] = useState<{ s?: Subject; c?: string }>({});

  const goal = focus.goal ?? 8, len = focus.len ?? 25;
  const ahead = EXAMS.filter(e => daysTo(e.date, now) >= 0);

  // Suggestion: stay on the last block's chapter until it is revised; otherwise the paper furthest from the target
  // (earliest exam on a tie), then its chapter in progress or next not started.
  const lastAt = Object.keys(focus.log).sort().pop();
  const last = lastAt ? focus.log[lastAt] : undefined;
  const carry = !chosen.s && last?.c && ['todo', 'learn'].includes(board.items[last.c]?.st) ? last : undefined;
  const pick = carry ? { s: carry.s, c: carry.c } : chosen;
  const subject = pick.s ?? [...ahead].sort((x, y) => readiness(board, x.subject).pct - readiness(board, y.subject).pct)[0]?.subject ?? 'fr';
  const rows = boardRows(board, subject);
  const chapterId = pick.c ?? (rows.find(([, i]) => i.st === 'learn') ?? rows.find(([, i]) => i.st === 'todo') ?? rows.find(([, i]) => i.st === 'rev'))?.[0];
  const chapter = chapterId ? board.items[chapterId] : undefined;
  const built = seed.find(c => c.id === chapterId);

  // Finishing a block logs it (keyed by its end time, so a reload cannot log it twice).
  const finish = (t: Timer) => {
    const cur = read(FOCUS_KEY, focus);
    saveFocus({ ...cur, log: { ...cur.log, [t.end]: { s: t.s, c: t.c, m: t.m } } });
    write(TIMER_KEY, null); setTimer(null); setJustDone(t);
    document.title = 'Block done · CA Revise';
  };

  useEffect(() => { setTimer(read<Timer | null>(TIMER_KEY, null)); }, []);
  useEffect(() => {
    if (!timer) return;
    const tick = () => {
      const t = Date.now(); setNow(t);
      if (t >= timer.end) finish(timer); else document.title = `${mmss(timer.end - t)} · ${timer.s.toUpperCase()}`;
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const start = () => {
    const t = { end: Date.now() + len * 60000, s: subject, c: chapterId, m: len };
    write(TIMER_KEY, t); setTimer(t); setJustDone(null);
  };
  const stop = () => {
    if (!timer) return;
    const spent = Math.round((timer.m * 60000 - (timer.end - Date.now())) / 60000);
    // A block stopped after 10 minutes still counts for the minutes done.
    if (spent >= 10) finish({ ...timer, end: Date.now(), m: spent }); else { write(TIMER_KEY, null); setTimer(null); document.title = 'CA Revise'; }
  };
  const setStatus = (id: string, st: Status) => saveBoard({ items: { ...saved.items, [id]: { ...board.items[id], st, u: Date.now() } } });

  const today = blocksOn(focus, dayKey(now));
  const mins = today.reduce((n, b) => n + b.m, 0);
  const doneBlocks = Math.floor(mins / 25);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() - 6 + i); return dayKey(+d); });
  const week = days.map(d => blocksOn(focus, d).reduce((n, b) => n + b.m, 0));
  const top = Math.max(goal * 25, ...week);
  const totalH = Object.values(focus.log).reduce((n, b) => n + b.m, 0) / 60;

  return (
    <section className="today" aria-label="Today">
      <div className="countdown">
        {EXAMS.map(e => {
          const d = daysTo(e.date, now);
          const r = readiness(board, e.subject);
          return (
            <Link key={e.subject} href="/board" className="cd" data-subj={e.subject}>
              <span className="cd-l">{e.label}</span>
              <b>{d > 0 ? d : d === 0 ? 'Today' : 'Done'}</b>
              <span className="muted">{d > 0 ? (d === 1 ? 'day left' : 'days left') : ' '}</span>
              <span className="cd-bar" aria-label={`${r.pct}% ready, target ${TARGET}%`}><i style={{ width: `${r.pct}%` }} /><em style={{ left: `${TARGET}%` }} /></span>
              <span className="cd-r">{ready ? `${r.pct}% ready` : ' '}</span>
            </Link>
          );
        })}
      </div>

      <div className="card focus" data-subj={timer?.s ?? subject}>
        {timer ? (
          <>
            <p className="eyebrow">Focus · {timer.s.toUpperCase()}{timer.c && board.items[timer.c] ? ` · ${board.items[timer.c].t}` : ''}</p>
            <p className="clock" aria-live="off">{mmss(timer.end - now)}</p>
            <p className="muted">Phone face down in another room. Only this chapter until the timer ends.</p>
            <button className="btn" onClick={stop}>Stop early</button>
          </>
        ) : justDone ? (
          <>
            <p className="eyebrow">Block done</p>
            <h2>{justDone.m} minutes on {justDone.s.toUpperCase()}. Take 5, then go again.</h2>
            {justDone.c && board.items[justDone.c] && (
              <>
                <p className="muted" style={{ marginTop: 10 }}>Where is <strong>{board.items[justDone.c].t}</strong> now?</p>
                <div className="seg">{STATUSES.filter(x => x.id !== 'skip').map(x => (
                  <button key={x.id} className={board.items[justDone.c!].st === x.id ? 'on' : ''} onClick={() => setStatus(justDone.c!, x.id)}>{x.label}</button>
                ))}</div>
              </>
            )}
            <p style={{ marginTop: 14 }}><button className="btn pri" onClick={() => setJustDone(null)}>Next block →</button></p>
          </>
        ) : (
          <>
            <p className="eyebrow">Next up</p>
            {chapter ? (
              <h2>{chapter.n ? `Ch ${chapter.n} · ` : ''}{chapter.t} <span className="muted">· {STATUSES.find(x => x.id === chapter.st)?.label}</span></h2>
            ) : (
              <h2>No {subject.toUpperCase()} chapters on your board yet. <Link href="/board">Add them →</Link></h2>
            )}
            <div className="seg" style={{ marginTop: 12 }} role="group" aria-label="Paper">
              {EXAMS.map(e => <button key={e.subject} className={e.subject === subject ? 'on' : ''} onClick={() => setPick({ s: e.subject })}>{e.label}</button>)}
            </div>
            {rows.length > 1 && (
              <select className="pickch" value={chapterId ?? ''} onChange={e => setPick({ s: subject, c: e.target.value })} aria-label="Chapter">
                {rows.filter(([, i]) => i.st !== 'skip').map(([id, i]) => <option key={id} value={id}>{i.n ? `Ch ${i.n} · ` : ''}{i.t} ({STATUSES.find(x => x.id === i.st)?.label})</option>)}
              </select>
            )}
            <div className="focus-go">
              <button className="btn pri" onClick={start}>Start {len} minutes</button>
              {built && <Link className="btn" href={`/${built.s}/${built.id}`}>Open chapter →</Link>}
            </div>
            <div className="seg" role="group" aria-label="Block length">
              {LENGTHS.map(l => <button key={l} className={l === len ? 'on' : ''} onClick={() => saveFocus({ ...focus, len: l, u: Date.now() })}>{l} min</button>)}
            </div>
          </>
        )}
      </div>

      <div className="card daygoal">
        <div className="sec-h" style={{ marginBottom: 8 }}>
          <h2>Today: {doneBlocks} of {goal} blocks</h2>
          <span className="muted">{mins} min{streak(focus, now) > 1 ? ` · ${streak(focus, now)}-day streak` : ''}</span>
        </div>
        <div className="pipsrow" aria-hidden="true">{Array.from({ length: goal }, (_, i) => <i key={i} className={i < doneBlocks ? 'on' : ''} />)}</div>
        <div className="week" aria-label="Minutes studied, last 7 days">
          {week.map((m, i) => (
            <span key={days[i]} className="wk" title={`${days[i]}: ${m} min`}>
              <i style={{ height: `${top ? Math.max(4, (m / top) * 100) : 4}%` }} className={m >= goal * 25 ? 'hit' : ''} />
              <small>{new Date(days[i] + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'narrow' })}</small>
            </span>
          ))}
        </div>
        <div className="sec-h" style={{ marginTop: 10, marginBottom: 0 }}>
          <span className="muted">{totalH.toFixed(1)} hours logged so far</span>
          <span className="seg" role="group" aria-label="Daily target">
            {GOALS.map(g => <button key={g} className={g === goal ? 'on' : ''} onClick={() => saveFocus({ ...focus, goal: g, u: Date.now() })}>{g}</button>)}
          </span>
        </div>
      </div>
    </section>
  );
}

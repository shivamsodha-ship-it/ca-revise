'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { getProgress } from '@/lib/storage';
import { chapterCards } from '@/lib/formulaCards';
import { LEVEL_PASS, useLearnState } from '@/lib/learn';
import { autoGames } from '@/lib/autoGames';

interface Stage { id: string; n: number; name: string; what: string; href: string; pct: number; note: string }

const MASTER_WHAT = { numerical: 'Step solver, then games and drills', theory: 'Case drills, sorters and games', mixed: 'Solver, cases and games' } as const;

// The six-stage route through a chapter. Each stage reads its own progress; the first unfinished one is "next".
export default function Journey() {
  const { learn, cb, ch, base, chapterId, S } = useChapter();
  const { L } = useLearnState(chapterId);
  const cards = useMemo(() => chapterCards(ch, cb), [ch, cb]);
  const [seen, setSeen] = useState(0);
  useEffect(() => { const p = getProgress(ch.id); setSeen(cards.filter(c => p[c.id]).length); }, [ch.id, cards]);
  const games = useMemo(() => [...(learn?.games ?? []), ...autoGames(cb)], [learn, cb]);
  if (!learn && !cb) return null;

  const levels = learn?.levels ?? [];
  const cleared = levels.filter(l => (L.lv[l.id]?.best ?? 0) >= LEVEL_PASS).length;
  const style = learn?.vision?.style ?? 'mixed';
  const gamesDone = games.filter(g => (L.gm[g.id]?.best ?? 0) >= 80).length;
  const solves = learn?.solves ?? [];
  const solveVersions = solves.flatMap(s => s.variants.map((_, i) => `${s.id}|${i}`));
  const solveDone = solveVersions.filter(k => (L.sv[k]?.best ?? 0) >= 100).length;
  const ids = cb?.Q.map(q => q.id) ?? [];
  const drillPct = ids.length ? Math.round(ids.filter(i => S.r[i]).length / ids.length * 100) : 0;

  // Mastery blends what matters for the subject: solvers for numerical chapters, games and drills for theory.
  const parts: [number, number][] = [];
  if (games.length) parts.push([gamesDone / games.length * 100, style === 'numerical' ? 1 : 2]);
  if (solveVersions.length) parts.push([solveDone / solveVersions.length * 100, style === 'theory' ? 1 : 3]);
  if (ids.length) parts.push([drillPct, 2]);
  const masteryPct = parts.length ? Math.round(parts.reduce((a, [v, w]) => a + v * w, 0) / parts.reduce((a, [, w]) => a + w, 0)) : 0;
  let masterHref = `${base}/drill`;
  if (style === 'numerical' && solves.length) masterHref = `${base}/solve`;
  else if (games.length) masterHref = `${base}/games`;
  const memBest = Math.max(L.lv.memory?.best ?? 0, L.gm.numcards?.best ?? 0);
  const conBest = Math.max(L.lv.connect?.best ?? 0, L.lv.cmp?.best ?? 0);

  const stages: Stage[] = [];
  if (learn?.vision) stages.push({ id: 'vision', n: 1, name: 'Vision', what: 'See the whole chapter on one page', href: `${base}/vision`, pct: L.lv.vision ? 100 : 0, note: L.lv.vision ? 'Read' : 'Start here' });
  if (levels.length) stages.push({ id: 'learn', n: 2, name: 'Learn', what: 'Understand it level by level', href: `${base}/path`, pct: Math.round(cleared / levels.length * 100), note: `${cleared}/${levels.length} levels` });
  stages.push({ id: 'revise', n: 3, name: 'Revise', what: 'Notes, law library and flip cards', href: `${base}/flip`, pct: cards.length ? Math.round(seen / cards.length * 100) : 0, note: `${seen}/${cards.length} cards seen` });
  if (learn?.memory || cb?.numbers.length) stages.push({ id: 'memory', n: 4, name: 'Memory', what: 'Mnemonics and number cards', href: `${base}/memory`, pct: memBest, note: L.lv.memory || L.gm.numcards ? `best ${memBest}%` : 'not tried' });
  if (learn?.connect?.links?.length) stages.push({ id: 'connect', n: 5, name: 'Connect', what: 'See how the ideas link', href: `${base}/connect`, pct: conBest, note: L.lv.connect || L.lv.cmp ? `best ${conBest}%` : 'not tried' });
  stages.push({ id: 'master', n: 6, name: 'Master', what: MASTER_WHAT[style], href: masterHref, pct: masteryPct, note: `${masteryPct}% mastered` });

  const next = stages.find(s => s.pct < (s.id === 'learn' ? 100 : 80)) ?? stages[stages.length - 1];
  return (
    <section className="jy" aria-label="Study journey">
      <Link href={next.href} className="jy-next">
        <span className="jy-next-k">Next up · Step {next.n} of {stages.length}</span>
        <b>{next.name}</b>
        <span>{next.what}</span>
        <span className="jy-next-go">Go <i aria-hidden="true">→</i></span>
      </Link>
      <div className="sec-h"><h2 className="sec-title">Your route through this chapter</h2><span className="muted">Vision first, mastery last</span></div>
      <ol className="jy-list">
        {stages.map(s => (
          <li key={s.id} className={'jy-st' + (s === next ? ' next' : '') + (s.pct >= 80 ? ' done' : '')}>
            <Link href={s.href}>
              <span className="jy-n">{s.n}</span>
              <span className="jy-t"><b>{s.name}</b><small>{s.what}</small></span>
              <span className="jy-p"><i style={{ transform: `scaleX(${Math.min(s.pct, 100) / 100})` }} /></span>
              <span className="jy-s">{s === next ? 'Next · ' : ''}{s.note}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

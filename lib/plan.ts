// Study plan: exam dates, the syllabus board (every chapter's status) and the focus log (timed study blocks).
// Pure data and merges, so the server's sync route and the browser share them. Storage lives in planStore.ts.
import type { Subject } from './types';

export const BOARD_KEY = 'ca-revise:v1:board';
export const FOCUS_KEY = 'ca-revise:v1:focus';

// Group 1, November 2026, as published in ICAI's date sheet (2 pm IST). Check the admit card before relying on it.
export const EXAMS: { subject: Subject; label: string; date: string }[] = [
  { subject: 'fr', label: 'FR', date: '2026-11-02' },
  { subject: 'afm', label: 'AFM', date: '2026-11-04' },
  { subject: 'aaa', label: 'AAA', date: '2026-11-06' },
];

export type Status = 'todo' | 'learn' | 'rev' | 'sure' | 'skip';
// pts: how much of a chapter counts as "ready". App-written rule of thumb, not an ICAI figure.
export const STATUSES: { id: Status; label: string; pts: number }[] = [
  { id: 'todo', label: 'Not started', pts: 0 },
  { id: 'learn', label: 'Studying', pts: 0.3 },
  { id: 'rev', label: 'Revised once', pts: 0.7 },
  { id: 'sure', label: 'Exam-ready', pts: 1 },
  { id: 'skip', label: 'Skipping', pts: 0 },
];
// Readiness to aim for in each paper before the exam. App-written target, not an ICAI rule.
export const TARGET = 65;

export interface BoardItem { s: Subject; t: string; n?: number; st: Status; u: number; del?: 1 }
export interface Board { items: Record<string, BoardItem> }
// One finished block, keyed in the log by the time it ended (ms), so logging the same block twice is harmless.
export interface Block { s: Subject; c?: string; m: number }
export interface Focus { goal?: number; len?: number; u?: number; log: Record<string, Block> }

export interface SeedChapter { id: string; s: Subject; n: number; t: string }

// Built chapters are always on the board; a saved entry (u > 0) wins over the seed.
export function withSeed(b: Board, seed: SeedChapter[]): Board {
  const items = { ...b.items };
  for (const c of seed) if (!items[c.id]) items[c.id] = { s: c.s, t: c.t, n: c.n, st: 'todo', u: 0 };
  return { items };
}

export function boardRows(b: Board, s: Subject): [string, BoardItem][] {
  return Object.entries(b.items).filter(([, i]) => i.s === s && !i.del)
    .sort(([, x], [, y]) => (x.n ?? 999) - (y.n ?? 999) || x.t.localeCompare(y.t));
}

export function readiness(b: Board, s: Subject) {
  const rows = boardRows(b, s).map(([, i]) => i);
  const pts = rows.reduce((n, i) => n + (STATUSES.find(x => x.id === i.st)?.pts ?? 0), 0);
  return { n: rows.length, pct: rows.length ? Math.round((pts / rows.length) * 100) : 0, sure: rows.filter(i => i.st === 'sure').length };
}

// Local calendar day, so a block at 11 pm in India counts for that day.
export const dayKey = (ms: number) => new Date(ms).toLocaleDateString('en-CA');

export function daysTo(date: string, now = Date.now()) {
  return Math.round((Date.parse(date + 'T00:00:00') - Date.parse(dayKey(now) + 'T00:00:00')) / 86400000);
}

export function blocksOn(f: Focus, day: string) {
  return Object.entries(f.log).filter(([at]) => dayKey(Number(at)) === day).map(([, b]) => b);
}

// Days in a row, ending today (or yesterday, so the count holds until today's first block), with a block.
export function streak(f: Focus, now = Date.now()) {
  const days = new Set(Object.keys(f.log).map(at => dayKey(Number(at))));
  const d = new Date(now);
  if (!days.has(dayKey(+d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(+d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export function mergeBoard(a: Board, b: Board): Board {
  const items: Board['items'] = {};
  for (const k of new Set([...Object.keys(a.items ?? {}), ...Object.keys(b.items ?? {})])) {
    const x = a.items?.[k], y = b.items?.[k];
    items[k] = !x ? y! : !y ? x : y.u > x.u ? y : x;
  }
  return { items };
}

export function mergeFocus(a: Focus, b: Focus): Focus {
  const newer = (a.u ?? 0) >= (b.u ?? 0) ? a : b;
  return { goal: newer.goal, len: newer.len, u: Math.max(a.u ?? 0, b.u ?? 0), log: { ...a.log, ...b.log } };
}

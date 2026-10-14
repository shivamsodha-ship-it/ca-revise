// Cross-device sync: which localStorage keys travel, and how two copies of one key are merged.
// The same merge runs in the browser (against its own copy) and on the server (against the stored copy),
// so both sides converge no matter which device writes first. Every merge keeps the newer change per item,
// using timestamps stored inside the values, so an offline phone and the laptop never overwrite each other.
import type { CaseState } from './progress';
import type { CardProgress } from './spacedRep';
import { mergeLearn, type LearnState } from './learnData';
import { mergeBoard, mergeFocus, type Board, type Focus } from './plan';

export const KEY_PREFIX = 'ca-revise:v1:';

const SUBJECTS = ['fr', 'afm', 'aaa'];
const CHAPTER = /^[a-z0-9-]{1,60}$/;

// Keys that travel: case progress, flip-card schedule, written attempts, streak, last-day plan, syllabus board, focus log.
export function isSyncKey(key: string): boolean {
  if (!key.startsWith(KEY_PREFIX)) return false;
  const rest = key.slice(KEY_PREFIX.length);
  if (rest === 'streak' || rest === 'board' || rest === 'focus') return true;
  const [kind, id] = rest.split(/:(.+)/);
  if (!id) return false;
  if (kind === 'case' || kind === 'prog' || kind === 'prac' || kind === 'learn') return CHAPTER.test(id);
  if (kind === 'lastday') return SUBJECTS.includes(id);
  return false;
}

export interface PracticeAttempt { qid: string; at: string; answer: string; selfGrade: string }
export interface StreakState { streak: number; last: string }
export interface LastDayState { days?: number; hours?: number; u?: number; done: Record<string, number> }

// A tick stores the time it was ticked; unticking stores 0, so the later action wins on every device.
const stamp = (v: unknown): number => (v === true ? 1 : typeof v === 'number' ? v : 0);

function mergeCase(a: CaseState, b: CaseState): CaseState {
  const r: CaseState['r'] = {};
  const rt: Record<string, number> = {};
  for (const id of new Set([...Object.keys(a.r ?? {}), ...Object.keys(b.r ?? {})])) {
    const ta = a.rt?.[id] ?? 0, tb = b.rt?.[id] ?? 0;
    const useA = id in (a.r ?? {}) && (!(id in (b.r ?? {})) || ta >= tb);
    const src = useA ? a : b;
    r[id] = src.r[id];
    rt[id] = useA ? ta : tb;
  }
  const newer = (a.u ?? 0) >= (b.u ?? 0) ? a : b;
  return {
    r, rt,
    best: Math.max(a.best ?? 0, b.best ?? 0),
    huntBest: Math.max(a.huntBest ?? 0, b.huntBest ?? 0),
    streak: newer.streak ?? 0,
    last: newer.last,
    u: Math.max(a.u ?? 0, b.u ?? 0),
  } as CaseState;
}

function mergeProg(a: Record<string, CardProgress>, b: Record<string, CardProgress>): Record<string, CardProgress> {
  const out: Record<string, CardProgress> = {};
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[id], y = b[id];
    out[id] = !x ? y : !y ? x : (y.lastReviewed ?? '') > (x.lastReviewed ?? '') ? y : x;
  }
  return out;
}

function mergePrac(a: PracticeAttempt[], b: PracticeAttempt[]): PracticeAttempt[] {
  const seen = new Map<string, PracticeAttempt>();
  for (const p of [...a, ...b]) seen.set(p.qid + '|' + p.at, p);
  return [...seen.values()].sort((x, y) => (y.at > x.at ? 1 : y.at < x.at ? -1 : 0)).slice(0, 200);
}

function mergeStreak(a: StreakState, b: StreakState): StreakState {
  if (a.last !== b.last) return a.last > b.last ? a : b;
  return a.streak >= b.streak ? a : b;
}

function mergeLastDay(a: LastDayState, b: LastDayState): LastDayState {
  const done: Record<string, number> = {};
  for (const k of new Set([...Object.keys(a.done ?? {}), ...Object.keys(b.done ?? {})])) {
    done[k] = Math.max(stamp(a.done?.[k]), stamp(b.done?.[k]));
  }
  const newer = (a.u ?? 0) >= (b.u ?? 0) ? a : b;
  return { days: newer.days, hours: newer.hours, u: Math.max(a.u ?? 0, b.u ?? 0), done };
}

// Merge two values of one key. Anything malformed on either side is dropped in favour of the other side.
export function mergeValue(key: string, a: unknown, b: unknown): unknown {
  if (a === undefined || a === null) return b;
  if (b === undefined || b === null) return a;
  const rest = key.slice(KEY_PREFIX.length);
  try {
    if (rest === 'streak') return mergeStreak(a as StreakState, b as StreakState);
    if (rest === 'board') return mergeBoard(a as Board, b as Board);
    if (rest === 'focus') return mergeFocus(a as Focus, b as Focus);
    const kind = rest.split(':')[0];
    if (kind === 'case') return mergeCase(a as CaseState, b as CaseState);
    if (kind === 'prog') return mergeProg(a as Record<string, CardProgress>, b as Record<string, CardProgress>);
    if (kind === 'prac') return mergePrac(a as PracticeAttempt[], b as PracticeAttempt[]);
    if (kind === 'learn') return mergeLearn(a as LearnState, b as LearnState);
    if (kind === 'lastday') return mergeLastDay(a as LastDayState, b as LastDayState);
  } catch {}
  return b;
}

// Shape check for what the server accepts. Keeps junk out of the store.
export function validValue(key: string, v: unknown): boolean {
  const rest = key.slice(KEY_PREFIX.length);
  if (rest === 'streak') return !!v && typeof v === 'object' && !Array.isArray(v);
  if (rest === 'board') return !!v && typeof v === 'object' && !!(v as Board).items && typeof (v as Board).items === 'object';
  if (rest === 'focus') return !!v && typeof v === 'object' && !!(v as Focus).log && typeof (v as Focus).log === 'object';
  const kind = rest.split(':')[0];
  if (kind === 'prac') return Array.isArray(v);
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

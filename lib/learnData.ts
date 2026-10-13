// Mastery layer data shapes and the pure merge used by sync (no React, safe on the server).
// HTML fields follow the casebook rules (plain p/strong/em/ul/li/table, xref links).
export type Recall =
  | { k: 'mc'; q: string; opts: string[]; ans: number; why: string }
  | { k: 'tf'; q: string; ans: boolean; why: string }
  | { k: 'num'; q: string; ans: number; unit?: string; tol?: number; why: string }
  | { k: 'order'; q: string; items: string[]; why: string };   // items are listed in the correct order

export interface Level {
  id: string;
  title: string;
  hook: string;                         // one line: why this level matters in the exam
  mins?: number;
  teach: { h: string; html: string }[]; // the lesson, in small blocks
  picture?: string;                     // HTML: a table or list that maps the idea
  correlate?: string;                   // HTML: how it connects to the other levels / the other regulated entity
  links?: string[];                     // provision ids to open from the level
  recall: Recall[];                     // checkpoint: answer from memory
  twist?: { q: string; a: string };     // "what if" the examiner changes one fact
}

export interface CompareRow { d: string; a: string; b: string; p?: string; same?: boolean }
export interface Compare {
  title: string;
  cols: [string, string];
  rows: CompareRow[];
  // "Which is which?" — each statement belongs to column 0, column 1, both, or neither
  sorter: { s: string; ans: 0 | 1 | 2 | 3; why: string }[];
}

export type Game =
  | { id: string; type: 'match'; title: string; intro: string; pairs: [string, string][] }
  | { id: string; type: 'sort'; title: string; intro: string; buckets: string[]; items: { t: string; b: number; why?: string }[] }
  | { id: string; type: 'order'; title: string; intro: string; rounds: { q: string; items: string[] }[] };

export interface SolveStep {
  ask: string;                          // what to find, in plain words
  kind: 'num' | 'pick';
  ans?: number; unit?: string; tol?: number;   // num
  opts?: string[]; pickIx?: number;            // pick
  say: string;                          // HTML: the working in one or two lines (shown after the attempt)
  note?: string;                        // short line saved in "Your working" (e.g. "DTL = 400 − 40 = 360")
}
export interface SolveVariant { label: string; q: string; steps: SolveStep[] }
export interface Solve {
  id: string; title: string; p?: string;       // p = provision id
  tip: string;                          // the mental-maths trick for this type
  variants: SolveVariant[];             // base case first, then twisted versions
}

export interface LearnData { levels: Level[]; compare?: Compare; games?: Game[]; solves?: Solve[] }

// ---------- progress (localStorage, synced like the rest) ----------
export interface LearnState {
  lv: Record<string, { best: number; at: number }>;    // level id -> best recall score %
  gm: Record<string, { best: number; at: number }>;    // game id -> best score %
  sv: Record<string, { best: number; at: number }>;    // solve id|variant index -> best % of steps right
  cmp?: { best: number; at: number };
  u?: number;
}
export const EMPTY_LEARN: LearnState = { lv: {}, gm: {}, sv: {} };
const key = (id: string) => `ca-revise:v1:learn:${id}`;

export function mergeLearn(a: LearnState, b: LearnState): LearnState {
  const m = (x: LearnState['lv'] = {}, y: LearnState['lv'] = {}) => {
    const out: LearnState['lv'] = {};
    for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
      const p = x[k], q = y[k];
      out[k] = !p ? q : !q ? p : p.best !== q.best ? (p.best > q.best ? p : q) : (p.at >= q.at ? p : q);
    }
    return out;
  };
  return { lv: m(a.lv, b.lv), gm: m(a.gm, b.gm), sv: m(a.sv, b.sv), u: Math.max(a.u ?? 0, b.u ?? 0) };
}

export const LEVEL_PASS = 80;

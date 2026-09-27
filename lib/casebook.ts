// Casebook data — the Case Drill / Clause Hunt / MCQ / Law Library / Cheat Sheet content for a chapter.
// Shape matches the Ethics Casebook artifact's DATA object.

export interface Provision {
  id: string;
  g: string;        // group key (matches groups[i][0])
  label: string;    // short code, e.g. "FS I(1)"
  title: string;
  short: string;
  law: string;      // HTML
  notes: string[];  // HTML
  upd: string;      // HTML, '' when none
  mem: string;
  qs: string[];     // question ids that test this provision
}

export type Kind = 'rtp' | 'sm-ill' | 'sm-tyk' | 'pyq' | 'upd' | 'mcq';

export interface Question {
  id: string;
  src: string;
  k: Kind;
  links: string[];  // provision ids; links[0] is the deciding clause
  v: string;        // 'Guilty' | 'Not guilty' | 'Partly' | 'Theory' | 'MCQ'
  q: string;        // HTML facts
  a?: string;       // HTML model answer
  trap?: string;    // HTML
  opts?: string[];  // MCQ options
  ans?: number;     // MCQ answer index
  why?: string;     // MCQ explanation (HTML)
}

export interface Casebook {
  P: Provision[];
  Q: Question[];
  groups: [string, string][];
  numbers: [string, string, string, boolean][]; // item, figure, provision id, changed?
  finder: [string, string][];                    // facts, provision id
  method: [string, string][];                    // step title, HTML body
  changes: string[];                             // HTML
}

export const KINDS: [string, string][] = [
  ['all', 'All'], ['rtp', 'RTP Nov 2026'], ['sm-ill', 'SM Illustrations'],
  ['sm-tyk', 'SM TYK'], ['pyq', 'Exam pattern'], ['upd', 'Code 2026 vs SM'],
];
export const VKEY: Record<string, 'g' | 'n' | 'p'> = { 'Guilty': 'g', 'Not guilty': 'n', 'Partly': 'p' };

export function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export function stripTags(h: string): string {
  return h.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
}

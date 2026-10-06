// Casebook data: the Case Drill / Provision Hunt / MCQ / Law Library / Cheat Sheet content for a chapter.
// One JSON file per chapter (data/<subject>/<slug>-casebook.json). Nothing chapter-specific lives in
// components: wording, verdict options and sources all come from `meta`.

export interface Provision {
  id: string;
  g: string;        // group key (matches groups[i][0])
  label: string;    // short code, e.g. "FS I(1)" or "Ind AS 115"
  title: string;
  short: string;
  law: string;      // HTML
  notes: string[];  // HTML
  upd: string;      // HTML, '' when none
  mem: string;
  qs: string[];     // question ids that test this provision
  hunt?: boolean;   // eligible as an answer in Provision Hunt
}

export interface Question {
  id: string;
  src: string;      // source label shown on the card, e.g. "SM Illustration 1"
  k: string;        // source kind: a key from meta.sources, or 'mcq'
  links: string[];  // provision ids; links[0] is the deciding provision
  v: string;        // verdict label (one of meta.verdicts) — anything else means reveal-and-self-mark
  q: string;        // HTML facts
  a?: string;       // HTML model answer
  trap?: string;    // HTML
  opts?: string[];  // MCQ options
  ans?: number;     // MCQ answer index
  why?: string;     // MCQ explanation (HTML)
  nums?: NumAnswer[]; // auto-checked final figures for numerical questions
}

// [label, expected value, unit ('₹' | '%' | 'units' | 'days' | 'years' | '' …), optional absolute tolerance]
export type NumAnswer = [string, number, string, number?];

export type Tone = 'bad' | 'good' | 'mixed';
export interface Verdict { label: string; tone: Tone; hint?: string }

export interface CasebookMeta {
  title: string;                    // e.g. "Ethics Casebook"
  sources: [string, string][];      // [kind, label] filters for Case Drill
  verdicts?: Verdict[];             // omit for chapters where cases are answered, not ruled on
  caseNoun?: string;                // "case" | "question" | "problem"
  provisionNoun?: string;           // "clause" | "standard" | "section"
  huntQuestion?: string;            // Provision Hunt prompt
  scopeTitle?: string;              // heading for `changes`
  scopeNote?: string;               // provision id that holds the full scope note
  tagline?: string;                 // chapter home headline, e.g. "Rule on the case. *Then* read the law."
  intro?: string;                   // one line under the headline; {cases} is replaced with the case count
  methodTitle?: string;             // heading for `method`
}

// Formula bank: families of formulas, each led by a master formula that the others come from.
// HTML fields may use <em>, <sub>, <sup>, <strong> and <span class="frac"><span>top</span><span>bottom</span></span>.
export interface Formula {
  id: string;                 // unique in the chapter, kebab-case
  name: string;
  expr: string;               // HTML: the formula itself
  vars?: [string, string][];  // [symbol (HTML), meaning]
  logic: string;              // HTML: why it works, in plain words a child could follow
  derive?: string;            // HTML: how it comes from the master / parent formula
  from?: string[];            // ids of the formulas this one is derived from
  hook?: string;              // memory hook
  cue?: string;               // exam cue: the words in a question that call for it
  trap?: string;              // HTML: the usual mistake
  example?: string;           // HTML: a small worked example
  p?: string;                 // provision id it belongs to
  beyond?: boolean;           // not in the study material (app-added for concept questions)
}
export interface FormulaFamily {
  id: string;
  title: string;
  idea: string;               // HTML: the one idea that ties the family together
  master: Formula;
  items: Formula[];
}

export interface Casebook {
  meta: CasebookMeta;
  P: Provision[];
  Q: Question[];
  groups: [string, string][];
  numbers: [string, string, string, boolean][]; // item, figure, provision id, changed?
  finder: [string, string][];                    // facts, provision id
  method: [string, string][];                    // step title, HTML body
  changes: string[];                             // HTML
  formulas?: FormulaFamily[];                    // formula bank (Formulas view + subject formula bank)
}

export function metaOf(cb: Casebook) {
  const m = cb.meta;
  return {
    title: m.title,
    sources: m.sources,
    verdicts: m.verdicts ?? [],
    caseNoun: m.caseNoun ?? 'case',
    provisionNoun: m.provisionNoun ?? 'provision',
    huntQuestion: m.huntQuestion ?? 'Which provision do these facts turn on?',
    scopeTitle: m.scopeTitle ?? 'Exam scope',
    scopeNote: m.scopeNote,
    tagline: m.tagline ?? (m.verdicts?.length ? 'Rule on the case. *Then* read the law.' : 'Answer the question. *Then* read the law.'),
    intro: m.intro ?? '',
    methodTitle: m.methodTitle ?? 'How to write the answer',
  };
}
export type Meta = ReturnType<typeof metaOf>;

// Tone of a verdict label ('bad' | 'good' | 'mixed'), or null when the question has no ruling to call.
export function toneOf(meta: Meta, v: string): Tone | null {
  return meta.verdicts.find(x => x.label === v)?.tone ?? null;
}

// Provisions offered as answers in Provision Hunt: those flagged `hunt`, or all when none are flagged.
export function huntPool(cb: Casebook): Provision[] {
  const flagged = cb.P.filter(p => p.hunt);
  return flagged.length ? flagged : cb.P;
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

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

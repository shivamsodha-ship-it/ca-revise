// Read-only tools for Claude: the signed-in user's progress, weak concepts, missed questions and formulas.
// Runs on the server with the same casebooks and merge rules the app uses, so answers match what the app shows.
import { listChapters, findChapter } from './registry';
import { stripTags, type Casebook, type FormulaFamily } from './casebook';
import { chapterCards } from './formulaCards';
import { isDue, type CardProgress } from './spacedRep';
import { rankConcepts, type SlimProvision } from './weak';
import { loadDocs } from './syncDb';
import type { Chapter, Subject } from './types';

interface LoadedChapter { id: string; subject: Subject; number: number; title: string; ch: Chapter; cb: Casebook | null }
interface CaseState { r: Record<string, 0 | 1>; u?: number }
interface SlimChapter { id: string; subject: string; subjectLabel: string; number: number; title: string; provisions: SlimProvision[] }

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const priority = (exam: number) => (exam >= 5 ? 'High' : exam >= 2 ? 'Medium' : 'Low');

async function loadAll(): Promise<LoadedChapter[]> {
  const out: LoadedChapter[] = [];
  for (const row of listChapters()) {
    const [ch, cb] = await Promise.all([row.loader(), row.casebook ? row.casebook() : null]);
    out.push({ id: row.id, subject: row.subject, number: row.number, title: row.title, ch, cb });
  }
  return out;
}

const stateOf = (docs: Record<string, unknown>, id: string): CaseState =>
  (docs[`ca-revise:v1:case:${id}`] as CaseState) ?? { r: {} };

function chapterOf(all: LoadedChapter[], id: unknown): LoadedChapter {
  const c = all.find(x => x.id === id);
  if (!c) throw new Error(`Unknown chapter "${String(id)}". Use list_chapters to see the ids.`);
  return c;
}

export const TOOLS = [
  {
    name: 'list_chapters',
    description: 'List every CA Final chapter in CA Revise with its id, subject and number of questions.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'weak_concepts',
    description: 'Concepts (provisions) the user keeps getting wrong, ranked by misses weighted by how often ICAI has asked them. Use this to decide what to study next.',
    inputSchema: {
      type: 'object',
      properties: {
        subject: { type: 'string', enum: ['fr', 'afm', 'aaa'], description: 'Limit to one subject' },
        limit: { type: 'integer', minimum: 1, maximum: 50, default: 15 },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'chapter_progress',
    description: 'Progress in one chapter: questions attempted, right and missed, flip cards due, and when the user last studied it.',
    inputSchema: { type: 'object', properties: { chapter: { type: 'string', description: 'Chapter id, e.g. afm-ch08' } }, required: ['chapter'], additionalProperties: false },
  },
  {
    name: 'missed_questions',
    description: 'Questions the user last answered wrongly in one chapter, with the facts, the model answer and the examiner trap, so you can explain them or quiz the user.',
    inputSchema: {
      type: 'object',
      properties: {
        chapter: { type: 'string' },
        limit: { type: 'integer', minimum: 1, maximum: 25, default: 8 },
      },
      required: ['chapter'],
      additionalProperties: false,
    },
  },
  {
    name: 'search_formulas',
    description: 'Find formulas in the formula banks by name, expression, exam cue or logic. Returns the formula, its parent formulas and the trap.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'], additionalProperties: false },
  },
];

export async function callTool(name: string, args: Record<string, any>, userId: string): Promise<string> {
  const all = await loadAll();
  const docs = await loadDocs(userId);

  if (name === 'list_chapters') {
    return all.map(c => `${c.id}: Ch ${c.number} ${c.title} (${c.subject.toUpperCase()}), ${c.cb?.Q.length ?? 0} questions`).join('\n');
  }

  if (name === 'weak_concepts') {
    const subjects = args.subject ? [args.subject] : null;
    const slim: SlimChapter[] = all.filter(c => c.cb && (!subjects || subjects.includes(c.subject))).map(c => ({
      id: c.id, subject: c.subject, subjectLabel: c.subject.toUpperCase(), number: c.number, title: c.title,
      provisions: c.cb!.P.map(p => ({ id: p.id, label: p.label, title: stripTags(p.title), qs: p.qs.map(id => ({ id, k: c.cb!.Q.find(q => q.id === id)?.k ?? '' })) })),
    }));
    const states = Object.fromEntries(slim.map(c => [c.id, stateOf(docs, c.id)])) as Parameters<typeof rankConcepts>[1];
    const rows = rankConcepts(slim, states).slice(0, Math.min(50, Math.max(1, Number(args.limit) || 15)));
    if (!rows.length) return 'No weak concepts yet. Attempt some case drills or MCQs first.';
    return rows.map((r, i) => `${i + 1}. ${r.label} · ${r.title} (Ch ${r.chNumber} ${r.chTitle}, ${r.subject.toUpperCase()}): ${r.misses} missed, ${r.attempts - r.misses} right, exam priority ${priority(r.exam)}`).join('\n');
  }

  if (name === 'chapter_progress') {
    const c = chapterOf(all, args.chapter);
    const S = stateOf(docs, c.id);
    const qs = c.cb?.Q ?? [];
    const attempted = qs.filter(q => q.id in S.r);
    const right = attempted.filter(q => S.r[q.id] === 1).length;
    const prog = (docs[`ca-revise:v1:prog:${c.id}`] ?? {}) as Record<string, CardProgress>;
    const cards = chapterCards(c.ch, c.cb);
    const due = cards.filter(card => isDue(prog[card.id])).length;
    const last = S.u ? new Date(S.u).toISOString().slice(0, 10) : 'never';
    return [
      `${c.id} · Ch ${c.number} ${c.title}`,
      `Questions: ${attempted.length} of ${qs.length} attempted, ${right} right, ${attempted.length - right} missed`,
      `Flip cards: ${due} due of ${cards.length}`,
      `Last studied: ${last}`,
    ].join('\n');
  }

  if (name === 'missed_questions') {
    const c = chapterOf(all, args.chapter);
    if (!c.cb) return `${c.id} has no question bank.`;
    const S = stateOf(docs, c.id);
    const cb = c.cb;
    const P = Object.fromEntries(cb.P.map(p => [p.id, p]));
    const missed = cb.Q.filter(q => S.r[q.id] === 0).slice(0, Math.min(25, Math.max(1, Number(args.limit) || 8)));
    if (!missed.length) return `No missed questions in ${c.id}.`;
    return missed.map((q, i) => {
      const prov = q.links.map(l => P[l]?.label).filter(Boolean).join(', ');
      const parts = [`${i + 1}. [${q.id}] ${q.src}${prov ? ` · ${prov}` : ''}`, clip(stripTags(q.q), 700)];
      if (q.k === 'mcq' && q.opts && q.ans !== undefined) parts.push(`Answer: ${stripTags(q.opts[q.ans])}`, q.why ? clip(stripTags(q.why), 500) : '');
      else if (q.a) parts.push(`Model answer: ${clip(stripTags(q.a), 900)}`);
      if (q.trap) parts.push(`Trap: ${clip(stripTags(q.trap), 300)}`);
      return parts.filter(Boolean).join('\n');
    }).join('\n\n');
  }

  if (name === 'search_formulas') {
    const q = String(args.query ?? '').trim().toLowerCase();
    if (!q) return 'Give a word or phrase to search for.';
    const hits: string[] = [];
    for (const c of all) {
      const fams: FormulaFamily[] = c.cb?.formulas ?? [];
      const byId = new Map(fams.flatMap(f => [f.master, ...f.items]).map(x => [x.id, x]));
      for (const f of fams.flatMap(fam => [fam.master, ...fam.items])) {
        const text = stripTags([f.name, f.expr, f.cue, f.logic, f.derive, f.trap].filter(Boolean).join(' ')).toLowerCase();
        if (!text.includes(q)) continue;
        const from = (f.from ?? []).map(id => byId.get(id)?.name ?? id);
        hits.push([
          `${f.name} (${c.id})`,
          `Formula: ${stripTags(f.expr)}`,
          from.length ? `Derived from: ${from.join(', ')}` : '',
          f.derive ? `How: ${clip(stripTags(f.derive), 300)}` : '',
          f.cue ? `Exam cue: ${f.cue}` : '',
          f.trap ? `Trap: ${clip(stripTags(f.trap), 240)}` : '',
        ].filter(Boolean).join('\n'));
        if (hits.length >= 10) break;
      }
      if (hits.length >= 10) break;
    }
    return hits.length ? hits.join('\n\n') : `No formula matches "${args.query}".`;
  }

  throw new Error(`Unknown tool ${name}`);
}


import type { Chapter, ChapterIndexRow, Subject } from './types';
import type { Casebook } from './casebook';

// Subjects shown on the home page, in this order.
export const SUBJECTS: { id: Subject; label: string; long: string }[] = [
  { id: 'fr', label: 'FR', long: 'Financial Reporting' },
  { id: 'afm', label: 'AFM', long: 'Advanced Financial Management' },
  { id: 'aaa', label: 'AAA', long: 'Advanced Auditing, Assurance & Professional Ethics' },
];

// One row per chapter. `npm run new-chapter` adds rows above the end marker.
// `loader` = notes, flip cards and written practice; `casebook` (optional) = cases, MCQs, law library.
const registry: ChapterIndexRow[] = [
  {
    id: 'aaa-ch19',
    subject: 'aaa',
    number: 19,
    title: 'Professional Ethics',
    summary: 'Code of Ethics · CA Act Schedules · Council Guidelines',
    loader: async () => (await import('../data/aaa/ch19-professional-ethics.json')).default as unknown as Chapter,
    casebook: async () => (await import('../data/aaa/ch19-casebook.json')).default as unknown as Casebook,
  },
  {
    id: 'aaa-ch15',
    subject: 'aaa',
    number: 15,
    title: 'Overview of Audit of Public Sector Undertakings',
    summary: 'C&AG · COPU/PAC · compliance, performance, comprehensive and propriety audit',
    loader: async () => (await import('../data/aaa/ch15-overview-of-audit-of-public-sector-undertakings.json')).default as unknown as Chapter,
    casebook: async () => (await import('../data/aaa/ch15-casebook.json')).default as unknown as Casebook,
  },
  {
    id: 'afm-ch08',
    subject: 'afm',
    number: 8,
    title: 'Mutual Funds',
    summary: 'NAV · returns and effective yield · dividend equalisation · plan-wise yield · Sharpe/Treynor → NAV',
    loader: async () => (await import('../data/afm/ch08-mutual-funds.json')).default as unknown as Chapter,
    casebook: async () => (await import('../data/afm/ch08-casebook.json')).default as unknown as Casebook,
  },
  // @chapters-end
];

export function listChapters(subject?: Subject): ChapterIndexRow[] {
  return registry.filter(r => !subject || r.subject === subject).sort((a, b) => a.number - b.number);
}

export function findChapter(id: string): ChapterIndexRow | undefined {
  return registry.find(r => r.id === id);
}

export function subjectOf(id: string) {
  return SUBJECTS.find(s => s.id === id);
}

// What a chapter contains, for lists and progress. Runs on the server at build time.
export interface ChapterCounts { cases: number; mcqs: number; provisions: number; cards: number; written: number; sections: number }
export async function countChapter(row: ChapterIndexRow): Promise<ChapterCounts> {
  const [ch, cb] = await Promise.all([row.loader(), row.casebook ? row.casebook() : null]);
  const mcqs = cb ? cb.Q.filter(q => q.k === 'mcq').length : 0;
  return {
    cases: cb ? cb.Q.length - mcqs : 0,
    mcqs,
    provisions: cb ? cb.P.length : 0,
    cards: ch.sections.reduce((n, s) => n + s.cards.length, 0),
    written: ch.practice.length,
    sections: ch.sections.length,
  };
}

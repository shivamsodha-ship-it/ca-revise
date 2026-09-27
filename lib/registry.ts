import type { Chapter, ChapterIndexRow, Subject } from './types';
import type { Casebook } from './casebook';

// Registry — add a new chapter by importing its JSON and adding a row.
const registry: ChapterIndexRow[] = [
  {
    id: 'aaa-ch19',
    subject: 'aaa',
    number: 19,
    title: 'Professional Ethics',
    summary: 'Code of Ethics · CA Act Schedules · Council Guidelines · 138 cases & MCQs',
    loader: async () => (await import('../data/aaa/ch19-professional-ethics.json')).default as unknown as Chapter,
    casebook: async () => (await import('../data/aaa/ch19-casebook.json')).default as unknown as Casebook,
  },
];

export function listChapters(subject: Subject): ChapterIndexRow[] {
  return registry.filter(r => r.subject === subject).sort((a, b) => a.number - b.number);
}

export function allSubjects(): { id: Subject; label: string; long: string; emoji: string; count: number }[] {
  return [
    { id: 'aaa', label: 'AAA', long: 'Advanced Auditing, Assurance & Professional Ethics', emoji: '⚖️', count: registry.filter(r => r.subject === 'aaa').length },
    { id: 'fr',  label: 'FR',  long: 'Financial Reporting', emoji: '📈', count: registry.filter(r => r.subject === 'fr').length },
    { id: 'afm', label: 'AFM', long: 'Advanced Financial Management', emoji: '💹', count: registry.filter(r => r.subject === 'afm').length },
  ];
}

export function findChapter(id: string): ChapterIndexRow | undefined {
  return registry.find(r => r.id === id);
}

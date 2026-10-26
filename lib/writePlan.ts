// Daily handwriting plan and last-three-attempts analysis, built by scripts/lastday/plan.py.
// Plan layout and minutes are app-written; every question and answer text is ICAI's, verbatim.
import plan from '../data/lastday/plan.json';
import analysis from '../data/lastday/analysis.json';

export interface PlanItem {
  block: string; source: string; marks: number | null; concept: string; minutes: number; mode: string;
  q?: { prompt: string; ans: string }; note?: string;
}
export interface PlanDay { date: string; items: PlanItem[] }
type Plans = Record<string, { days: PlanDay[] }>;
const P = plan as unknown as Plans;
export const SUBJECT_ORDER = ['fr', 'afm', 'aaa'] as const;

export const planDates = (): string[] => [...new Set(Object.values(P).flatMap(s => s.days.map(d => d.date)))].sort();
export const dayOf = (subject: string, date: string): PlanDay | undefined => P[subject]?.days.find(d => d.date === date);
export const analysisOf = (subject: string): { analysis: string; plan: string } | undefined =>
  (analysis as unknown as Record<string, { analysis: string; plan: string }>)[subject];

export const MODE_LABEL: Record<string, string> = {
  copy: 'Copy the ICAI answer', 'from-memory': 'Write from memory, then compare', 'from memory': 'Write from memory, then compare',
  timed: 'Timed, then compare', 'full-paper': 'Full paper, timed', 'timed full paper': 'Full paper, timed', 'timed full paper, OMR-style': 'Part I, timed',
  'formula-drill': 'Formula drill', 'recall from memory': 'Recall from memory', review: 'Review', compare: 'Compare', checklist: 'Checklist', 'self-check': 'Self-check',
};
export const dateLabel = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

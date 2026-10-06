// Concept ranking for the weak-areas dashboard and the last-day plan. A "concept" is a provision.
// Misses come from the last result per question (casebook state); exam priority comes from where the
// provision's questions were asked: past papers count double, RTP/MTP and SM questions once each.
import type { CaseState } from './progress';

// Set by pages outside a chapter (weak areas, last-day plan) before they open that chapter's drill.
export const PENDING_DRILL = 'ca-revise:pending-drill';

export interface SlimQuestion { id: string; k: string }
export interface SlimProvision { id: string; label: string; title: string; qs: SlimQuestion[] }

export interface ConceptRow {
  chapterId: string;
  subject: string;
  chNumber: number;
  chTitle: string;
  pid: string;
  label: string;
  title: string;
  attempts: number;
  misses: number;
  exam: number;
  score: number;
}

export function examWeight(k: string): number {
  if (k === 'pyq') return 2;
  if (k === 'rtp' || k === 'mtp' || k === 'sm-ill' || k === 'sm-tyk' || k === 'upd') return 1;
  return 0;
}

// Only concepts that need work: missed at least once, or never attempted but high exam priority (exam >= 5).
export function rankConcepts(chapters: { id: string; subject: string; number: number; title: string; provisions: SlimProvision[] }[], states: Record<string, CaseState>): ConceptRow[] {
  const rows: ConceptRow[] = [];
  for (const ch of chapters) {
    const S = states[ch.id];
    for (const p of ch.provisions) {
      let attempts = 0, misses = 0, exam = 0;
      for (const q of p.qs) {
        exam += examWeight(q.k);
        if (S && q.id in S.r) { attempts++; if (S.r[q.id] === 0) misses++; }
      }
      if (!p.qs.length) continue;
      if (!(misses > 0 || (attempts === 0 && exam >= 5))) continue;
      rows.push({
        chapterId: ch.id, subject: ch.subject, chNumber: ch.number, chTitle: ch.title,
        pid: p.id, label: p.label, title: p.title, attempts, misses, exam,
        // Concepts with misses always rank above untried ones; among them, misses count most, then exam priority.
        score: misses > 0 ? 100 + misses * 3 + exam : exam,
      });
    }
  }
  return rows.sort((a, b) => b.score - a.score || b.misses - a.misses);
}

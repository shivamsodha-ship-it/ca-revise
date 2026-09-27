// SM-2 (Anki-style) spaced repetition, simplified.
// Each card gets: reps (successful in a row), interval (days), ef (ease factor), due (ISO date).
// Grades: 0 = Again, 3 = Hard, 4 = Good, 5 = Easy.

export interface CardProgress {
  reps: number;
  interval: number;   // days
  ef: number;         // 1.3 .. 2.5+
  due: string;        // ISO date
  lastGrade?: number;
  lastReviewed?: string;
  history?: { at: string; grade: number }[];
}

export type Grade = 0 | 3 | 4 | 5;

const MIN_EF = 1.3;

export function fresh(): CardProgress {
  const today = new Date().toISOString().slice(0, 10);
  return { reps: 0, interval: 0, ef: 2.5, due: today };
}

export function schedule(prev: CardProgress | undefined, grade: Grade, today = new Date()): CardProgress {
  const p = prev ?? fresh();
  let { reps, interval, ef } = p;

  // Ease factor update (SM-2)
  ef = Math.max(MIN_EF, ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));

  if (grade === 0) {
    // failed → back to learning
    reps = 0;
    interval = 0;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ef);
    if (grade === 3) interval = Math.max(1, Math.round(interval * 0.7));  // hard → shorter
    if (grade === 5) interval = Math.round(interval * 1.3);               // easy → longer
  }

  const due = new Date(today);
  due.setDate(due.getDate() + interval);
  const dueIso = due.toISOString().slice(0, 10);
  const nowIso = today.toISOString();

  return {
    reps,
    interval,
    ef,
    due: dueIso,
    lastGrade: grade,
    lastReviewed: nowIso,
    history: [...(p.history ?? []), { at: nowIso, grade }].slice(-30),
  };
}

export function isDue(p: CardProgress | undefined, today = new Date()): boolean {
  if (!p) return true; // never seen → due
  return p.due <= today.toISOString().slice(0, 10);
}

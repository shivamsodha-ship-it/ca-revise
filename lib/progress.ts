'use client';
// Casebook progress (cases, MCQs, hunt best, streak), stored per chapter in localStorage.

export interface CaseState {
  r: Record<string, 0 | 1>;   // last result per question: 1 right, 0 wrong
  best: number;
  streak: number;
  huntBest: number;
  last?: { view: string; id?: string }; // where to resume
}
export const EMPTY_STATE: CaseState = { r: {}, best: 0, streak: 0, huntBest: 0 };

const key = (chapterId: string) => `ca-revise:v1:case:${chapterId}`;

export function loadCaseState(chapterId: string): CaseState {
  try {
    const raw = localStorage.getItem(key(chapterId));
    return raw ? { ...EMPTY_STATE, ...JSON.parse(raw) } : EMPTY_STATE;
  } catch { return EMPTY_STATE; }
}

export function saveCaseState(chapterId: string, s: CaseState) {
  try { localStorage.setItem(key(chapterId), JSON.stringify(s)); } catch {}
}

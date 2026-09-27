'use client';
import type { CardProgress } from './spacedRep';

const NS = 'ca-revise:v1';

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function safeSet(key: string, val: unknown) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

const progKey = (chapterId: string) => `${NS}:prog:${chapterId}`;
const practiceKey = (chapterId: string) => `${NS}:prac:${chapterId}`;
const streakKey = `${NS}:streak`;

export function getProgress(chapterId: string): Record<string, CardProgress> {
  return safeGet(progKey(chapterId), {});
}
export function saveProgress(chapterId: string, all: Record<string, CardProgress>) {
  safeSet(progKey(chapterId), all);
}
export function updateCard(chapterId: string, cardId: string, prog: CardProgress) {
  const all = getProgress(chapterId);
  all[cardId] = prog;
  saveProgress(chapterId, all);
}

export interface PracticeAttempt {
  qid: string;
  at: string;
  answer: string;
  selfGrade: 'correct' | 'partial' | 'wrong';
}
export function getPractice(chapterId: string): PracticeAttempt[] {
  return safeGet(practiceKey(chapterId), []);
}
export function addPractice(chapterId: string, a: PracticeAttempt) {
  const list = getPractice(chapterId);
  list.unshift(a);
  safeSet(practiceKey(chapterId), list.slice(0, 200));
}

export function tickStreak(): { streak: number; last: string } {
  const today = new Date().toISOString().slice(0, 10);
  const s = safeGet<{ streak: number; last: string }>(streakKey, { streak: 0, last: '' });
  if (s.last === today) return s;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const y = yesterday.toISOString().slice(0, 10);
  const next = { streak: s.last === y ? s.streak + 1 : 1, last: today };
  safeSet(streakKey, next);
  return next;
}
export function readStreak(): { streak: number; last: string } {
  return safeGet(streakKey, { streak: 0, last: '' });
}

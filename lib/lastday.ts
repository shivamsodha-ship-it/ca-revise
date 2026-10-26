// Must-do packs: built by scripts/lastday (export.py) from ICAI's study material and ICAI's own papers.
// Everything in a pack is ICAI text, verbatim; the only app-written parts are labels and the ordering.
import type { Subject } from './types';
import fr from '../data/lastday/fr.json';
import afm from '../data/lastday/afm.json';
import aaa from '../data/lastday/aaa.json';

export interface PackSection { n: string; t: string; p0: number; p1: number; hits: number }
export interface PackQuestion {
  role: 'comprehensive' | 'drill';
  src: string;            // e.g. "PYQ Jan 2026", "MTP Nov 2026 S-I", "ICAI SM Practice Question"
  label: string;          // e.g. "3(b)"
  kind: string;
  loose: boolean;         // matched to the chapter by looser wording; shown with a warning
  covers: number[];       // indexes into sections
  closest: { t: string; p0: number };
  prompt: string;
  ans: string;
}
export interface Pack {
  id: string; title: string; url: string; tier: 'must' | 'should' | 'quick';
  rank: { score: number; pyq?: number; rtpmtp?: number; nov26?: boolean };
  sweep: { points: number; pyq?: number; rtp?: number; mtp?: number; sm?: number };
  sections: PackSection[]; questions: PackQuestion[];
  reading: { sec: number; text: string; cut: boolean }[];
}
export interface PackSet { subject: Subject; basis: string; topics: Pack[] }

const DATA: Record<Subject, PackSet> = { fr: fr as unknown as PackSet, afm: afm as unknown as PackSet, aaa: aaa as unknown as PackSet };
export const packsOf = (s: string): PackSet | undefined => DATA[s as Subject];

export const TIERS = [
  { id: 'must', label: 'Must-do', note: 'Highest exam weight in the swept ICAI papers' },
  { id: 'should', label: 'Should-do', note: 'Asked often enough to be worth a pass' },
  { id: 'quick', label: 'If time remains', note: 'Lower frequency in the swept papers' },
] as const;

// The marks ICAI prints at the end of a question, e.g. "(6 Marks)"; the last one wins.
export function marksOf(prompt: string): number | null {
  const m = [...prompt.matchAll(/\((\d{1,2})\s*Marks?\)/gi)];
  return m.length ? Number(m[m.length - 1][1]) : null;
}

import type { Casebook } from './casebook';

export type Subject = 'aaa' | 'fr' | 'afm';

export interface CardFace {
  bareText?: string;
  simplified?: string;
  explanation?: string;
  exception?: string;
  trap?: string;
  cases?: string[];
  cross?: string[];
}

export type CardType = 'clause' | 'concept' | 'illustration' | 'mnemonic' | 'section' | 'case' | 'formula';

export interface Card {
  id: string;
  type: CardType;
  tags?: string[];
  front: string;   // prompt shown first
  back: CardFace;  // reveal
  formula?: FormulaRecall; // formula-bank cards: the name is the answer, the rest is shown on reveal
}

// Built from the formula bank by lib/formulaCards.ts. HTML fields come straight from the casebook.
export interface FormulaRecall {
  name: string;
  expr: string;          // HTML
  derive?: string;       // HTML: how it comes from its parent formula(s)
  from: string[];        // parent formula names, for "Derived from"
  logic: string;         // HTML
  trap?: string;         // HTML
  hook?: string;
}

export interface Section {
  id: string;
  title: string;
  emoji?: string;
  cards: Card[];
}

export interface PracticeQ {
  id: string;
  prompt: string;
  hints?: string[];
  clauseRef?: string;
  modelAnswer: string;    // 4-step template answer
  markingPoints: string[]; // things the answer must include
}

export interface Chapter {
  id: string;             // e.g. "aaa-ch19"
  subject: Subject;
  number: number;         // e.g. 19
  title: string;          // e.g. "Professional Ethics"
  summary: string;        // one line for the list
  weight?: number;        // ICAI mark weight
  currency?: string;      // Nov 2026 flag line
  sections: Section[];
  practice: PracticeQ[];
  notesHtml?: string;     // optional link to the handwritten HTML playbook
}

export interface ChapterIndexRow {
  id: string;
  subject: Subject;
  number: number;
  title: string;
  summary: string;
  loader: () => Promise<Chapter>;
  // Optional casebook: case drills, clause hunt, MCQs, law library, cheat sheet
  casebook?: () => Promise<Casebook>;
}

// Flip cards generated from a chapter's formula bank: the exam cue (or the variables) is the prompt,
// the formula name is the answer, and the reveal shows the expression, the parent it comes from and the trap.
// Nothing is written twice: edit the formula in the casebook and its card follows.
import type { Casebook, Formula } from './casebook';
import { stripTags } from './casebook';
import type { Card, Chapter } from './types';

export const FORMULA_CARD_PREFIX = 'fx:';

export function formulaCards(cb: Casebook | null | undefined): Card[] {
  if (!cb?.formulas?.length) return [];
  const byId = new Map<string, Formula>();
  for (const f of cb.formulas) for (const x of [f.master, ...f.items]) byId.set(x.id, x);

  return cb.formulas.flatMap(fam => [fam.master, ...fam.items].map((f): Card => {
    const from = (f.from ?? []).map(id => byId.get(id)?.name ?? id);
    const meanings = (f.vars ?? []).map(([, m]) => m).filter(Boolean);
    const prompt = f.cue
      ? `Exam cue: ${f.cue}`
      : meanings.length
        ? `Which formula uses: ${meanings.join(', ')}?`
        : `Which formula belongs to “${stripTags(fam.title)}”?`;
    return {
      id: FORMULA_CARD_PREFIX + f.id,
      type: 'formula',
      front: prompt,
      back: {},
      formula: {
        name: f.name,
        expr: f.expr,
        derive: f.derive,
        from,
        logic: f.logic,
        trap: f.trap,
        hook: f.hook,
      },
    };
  }));
}

// Everything reviewed on the flip cards: section cards first, then one card per formula.
export function chapterCards(ch: Chapter, cb: Casebook | null | undefined): Card[] {
  return [...ch.sections.flatMap(s => s.cards), ...formulaCards(cb)];
}

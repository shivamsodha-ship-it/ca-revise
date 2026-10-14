// Games that need no authoring: built from what every casebook already holds (numbers table, fact finder,
// formula bank). They give every chapter, in every subject, a first memory game on day one.
import type { Casebook } from './casebook';
import { stripTags } from './casebook';
import type { Game } from './learnData';

type Pair = [string, string];

// A partner that appears twice would make two correct answers for one tile, so keep the first of each.
function firstOfEachPartner(pairs: Pair[]): Pair[] {
  const seen = new Set<string>();
  return pairs.filter(([, b]) => (seen.has(b) ? false : (seen.add(b), true)));
}

export function autoGames(cb: Casebook | null | undefined): Game[] {
  if (!cb) return [];
  const out: Game[] = [];
  const clean = (s: string) => stripTags(s).replace(/\s+/g, ' ').trim();

  const numPairs = firstOfEachPartner(cb.numbers
    .map(n => [clean(n[0]), clean(n[1])] as Pair)
    .filter(([a, b]) => a.length >= 4 && a.length <= 70 && b.length >= 1 && b.length <= 42 && !/no fixed|varies/i.test(b)));
  if (numPairs.length >= 6) out.push({ id: 'auto-numbers', type: 'match', title: 'Every number in the chapter', intro: `Six random pairs from the chapter's ${numPairs.length} key figures. Item on the left, figure on the right.`, pairs: numPairs });

  const P = Object.fromEntries(cb.P.map(p => [p.id, p]));
  const trigPairs = firstOfEachPartner(cb.finder
    .map(f => [clean(f[0]), P[f[1]]?.short ? clean(P[f[1]].short) : ''] as Pair)
    .filter(([a, b]) => a.length >= 8 && a.length <= 110 && b.length >= 3 && b.length <= 60));
  if (trigPairs.length >= 6) out.push({ id: 'auto-triggers', type: 'match', title: 'Spot the trigger', intro: 'The words in a question on the left; the rule they point to on the right.', pairs: trigPairs });

  const fxPairs = firstOfEachPartner((cb.formulas ?? []).flatMap(f => [f.master, ...f.items])
    .filter(f => f.cue)
    .map(f => [clean(f.cue!), clean(f.name)] as Pair)
    .filter(([a, b]) => a.length >= 6 && a.length <= 110 && b.length <= 60));
  if (fxPairs.length >= 6) out.push({ id: 'auto-formulas', type: 'match', title: 'Exam cue to formula', intro: 'Which formula does the wording of the question call for?', pairs: fxPairs });
  return out;
}

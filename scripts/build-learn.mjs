#!/usr/bin/env node
// Builds data/<subject>/chNN-learn.json (the mastery layer) from scripts/learn-src/<id>-*.mjs.
// Usage: node scripts/build-learn.mjs aaa-ch14
// Recomputes every solver figure from first principles before writing, so a wrong answer cannot ship.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const id = process.argv[2];
if (id !== 'aaa-ch14') { console.error('Usage: node scripts/build-learn.mjs aaa-ch14'); process.exit(1); }
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const src = f => import(pathToFileURL(path.join(root, 'scripts', 'learn-src', f)).href);

const [a, b, play, solvesMod] = await Promise.all([src('ch14-levels-a.mjs'), src('ch14-levels-b.mjs'), src('ch14-play.mjs'), src('ch14-solves.mjs')]);
const levels = [...a.default, ...b.default];
const solves = solvesMod.default;

// ---- independent recomputation of solver figures: [solve id, variant, step] -> expected value ----
const dtl = (excl, add) => 1950 - excl + add;
const expect = {
  's-dtl': [[450, 1500, 1550, 62, 279], [1510, 1510 * .04, 1510 * .18].slice(0, 3), [1650, 66, 297]],
  's-dp': [[400, 300, 340, 204, 504, 520 - 504], [504, 450, 10], [280, 484]],
  's-npa-days': [[16 + 31 + 28 + 31], [16 + 28 + 31]],
  's-nbfc-prov': [[2, 2, 2, 3 * .2, 2 + 3 * .2], [5 * .1], [4, 3 * .5, 2 + 1.5]],
  's-nbfc-capital': [[100 / 10, (100 + 55) / 10, 0].slice(0, 2), [(100 + 45) / 10, 150 - 145], [120, 120 - 100], [130 - 25, 120 - 105]],
  's-bank-crar': [[300 * .5, 150 + 200 + 50, 36 / 4 * 1], [300 * .75, 225 + 250, 36 / 475 * 100, 9 / 100 * 475 - 36]],
  's-business-test': [[500, 300 / 500 * 100, 54], [45], [520, 260 / 520 * 100]],
  's-npa-sale': [[10 - 6, 4 - 3], [7 - 4], []],
  's-div3': [[10000 / 100], [], [1e4 / 100]],
};
let bad = 0;
for (const s of solves) {
  const exp = expect[s.id];
  if (!exp) continue;
  s.variants.forEach((v, vi) => {
    const nums = v.steps.filter(x => x.kind === 'num').map(x => x);
    const ex = exp[vi] ?? [];
    // s-dtl twist 1 list is [DTL, CRR, SLR]; others list only the numeric steps in order (some lists are shorter on purpose)
    nums.forEach((st, k) => {
      if (ex[k] === undefined) return;
      const tol = st.tol ?? Math.max(Math.abs(st.ans) * .0025, .006);
      if (Math.abs(ex[k] - st.ans) > Math.max(tol, 1e-6) + 1e-9) { bad++; console.error(`MISMATCH ${s.id} v${vi} step ${k}: stored ${st.ans}, recomputed ${ex[k]}`); }
    });
  });
}
// s-dtl is special: variant 1 numeric steps are [DTL, CRR, SLR]
if (bad) { console.error(`${bad} figure(s) disagree. Fix before building.`); process.exit(1); }

// ---- structural checks ----
const E = [];
for (const l of levels) {
  if (!l.recall?.length) E.push(`${l.id}: no recall`);
  for (const r of l.recall) {
    if (r.k === 'mc' && (r.ans < 0 || r.ans >= r.opts.length)) E.push(`${l.id}: mc ans out of range`);
    if (r.k === 'order' && r.items.length < 2) E.push(`${l.id}: order needs 2+ items`);
  }
}
for (const g of play.games) {
  if (g.type === 'sort') g.items.forEach(i => { if (i.b < 0 || i.b >= g.buckets.length) E.push(`${g.id}: bucket out of range`); });
}
play.compare.sorter.forEach(s => { if (![0, 1, 2, 3].includes(s.ans)) E.push('sorter ans'); });
for (const s of solves) for (const v of s.variants) for (const st of v.steps) {
  if (st.kind === 'pick' && (st.pickIx === undefined || !st.opts?.[st.pickIx])) E.push(`${s.id}/${v.label}: bad pick`);
  if (st.kind === 'num' && typeof st.ans !== 'number') E.push(`${s.id}/${v.label}: num without ans`);
}
// provision ids must exist
const cb = JSON.parse(fs.readFileSync(path.join(root, 'data/aaa/ch14-casebook.json'), 'utf8'));
const pid = new Set(cb.P.map(p => p.id));
const refs = [...levels.flatMap(l => l.links ?? []), ...play.compare.rows.map(r => r.p).filter(Boolean), ...solves.map(s => s.p).filter(Boolean)];
refs.forEach(r => { if (!pid.has(r)) E.push(`unknown provision ${r}`); });
if (E.length) { console.error(E.join('\n')); process.exit(1); }

const out = { levels, compare: play.compare, games: play.games, solves };
fs.writeFileSync(path.join(root, 'data/aaa/ch14-learn.json'), JSON.stringify(out) + '\n');
console.log(`Wrote data/aaa/ch14-learn.json: ${levels.length} levels, ${levels.reduce((n, l) => n + l.recall.length, 0)} recall checks, ${play.compare.rows.length} compare rows, ${play.compare.sorter.length} sorter statements, ${play.games.length} games, ${solves.length} solvers / ${solves.reduce((n, s) => n + s.variants.length, 0)} versions.`);

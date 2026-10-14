#!/usr/bin/env node
// Builds a chapter's mastery file from scripts/learn-src/<chapter-id>.mjs.
// Usage: node scripts/build-learn.mjs <chapter-id>      e.g. aaa-ch14, afm-ch08
// The module default-exports { file, learn, check? }. `check(learn)` returns a list of error strings (figure recomputation).
// Generic checks here: structure, provision links, every solver figure present, every MCQ/sorter key in range.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const id = process.argv[2];
if (!id) { console.error('Usage: node scripts/build-learn.mjs <chapter-id>'); process.exit(1); }
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const mod = (await import(pathToFileURL(path.join(root, 'scripts', 'learn-src', `${id}.mjs`)).href)).default;
const { file, learn } = mod;
const E = [...(mod.check ? mod.check(learn) : [])];

const reg = fs.readFileSync(path.join(root, 'lib', 'registry.ts'), 'utf8');
const block = reg.split(/\n  \{\n/).find(b => b.includes(`id: '${id}'`));
const cbPath = block?.match(/casebook:.*import\('\.\.\/(data\/[^']+)'\)/)?.[1];
const cb = cbPath ? JSON.parse(fs.readFileSync(path.join(root, cbPath), 'utf8')) : null;
const pid = new Set((cb?.P ?? []).map(p => p.id));
const prov = (where, x) => { if (x && cb && !pid.has(x)) E.push(`${where}: unknown provision ${x}`); };

for (const l of learn.levels ?? []) {
  (l.links ?? []).forEach(x => prov(l.id, x));
  if (!l.recall?.length) E.push(`${l.id}: no recall`);
  for (const r of l.recall) {
    if (r.k === 'mc' && !(r.ans >= 0 && r.ans < r.opts.length)) E.push(`${l.id}: mc ans out of range`);
    if (r.k === 'order' && r.items.length < 2) E.push(`${l.id}: order needs 2+ items`);
    if (r.k === 'num' && typeof r.ans !== 'number') E.push(`${l.id}: num recall without ans`);
  }
}
(learn.compare?.rows ?? []).forEach(r => prov('compare', r.p));
(learn.compare?.sorter ?? []).forEach(s => { if (![0, 1, 2, 3].includes(s.ans)) E.push('sorter ans out of range'); });
for (const g of learn.games ?? []) if (g.type === 'sort') g.items.forEach(i => { if (!(i.b >= 0 && i.b < g.buckets.length)) E.push(`${g.id}: bucket out of range`); });
for (const s of learn.solves ?? []) {
  prov(s.id, s.p);
  for (const v of s.variants) for (const st of v.steps) {
    if (st.kind === 'pick' && (st.pickIx === undefined || !st.opts?.[st.pickIx])) E.push(`${s.id}/${v.label}: bad pick`);
    if (st.kind === 'num' && typeof st.ans !== 'number') E.push(`${s.id}/${v.label}: num without ans`);
  }
}
(learn.vision?.map ?? []).forEach(b => (b.p ?? []).forEach(x => prov('vision', x)));
(learn.memory?.mnemonics ?? []).forEach(m => prov(m.id, m.p));
const dupe = (arr, what) => arr.filter((x, i) => arr.indexOf(x) !== i).forEach(d => E.push(`duplicate ${what} ${d}`));
dupe((learn.levels ?? []).map(l => l.id), 'level'); dupe((learn.games ?? []).map(g => g.id), 'game'); dupe((learn.solves ?? []).map(s => s.id), 'solve');
dupe((learn.memory?.mnemonics ?? []).map(m => m.id), 'mnemonic');
(learn.connect?.links ?? []).forEach(l => prov('connect', l.p));
if (E.length) { console.error(E.join('\n')); process.exit(1); }

fs.writeFileSync(path.join(root, file), JSON.stringify(learn) + '\n');
const n = (a) => (a ?? []).length;
console.log(`Wrote ${file}: ${n(learn.levels)} levels, ${(learn.levels ?? []).reduce((a, l) => a + l.recall.length, 0)} recall checks, ${n(learn.compare?.rows)} compare rows, ${n(learn.compare?.sorter)} sorter statements, ${n(learn.games)} games, ${n(learn.solves)} solvers / ${(learn.solves ?? []).reduce((a, s) => a + s.variants.length, 0)} versions, ${n(learn.memory?.mnemonics)} mnemonics, ${n(learn.connect?.links)} connections.`);

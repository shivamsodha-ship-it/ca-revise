#!/usr/bin/env node
// Assemble a chapter's two data files from part files, so long content can be written in batches.
// Usage: node scripts/assemble-chapter.mjs <chapter-id>      e.g. fr-ch03
//
// Reads work/<id>/parts/:
//   chapter.json           { id, subject, number, title, summary, weight?, currency? }
//   sections-*.json        array of sections   (files are read in name order)
//   practice-*.json        array of practice questions
//   meta.json              casebook meta
//   groups.json            [[key, name], ...]
//   provisions-*.json      array of provisions (qs may be omitted: it is rebuilt from question links)
//   questions-*.json       array of questions
//   extras.json            { numbers, finder, method, changes }
//   nums.json              { questionId: [[label, value, unit, tol?]] } (optional; auto-checked numericals)
//   formulas-*.json        array of formula families (optional; the Formulas view and subject formula bank)
// Writes the paths registered in lib/registry.ts for that chapter.
import fs from 'node:fs';
import path from 'node:path';

const id = process.argv[2];
if (!id) { console.error('Usage: npm run assemble -- <chapter-id>'); process.exit(1); }
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const dir = path.join(root, 'work', id, 'parts');
if (!fs.existsSync(dir)) { console.error(`No part files: ${path.relative(root, dir)}`); process.exit(1); }

const read = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const parts = prefix => fs.readdirSync(dir).filter(f => f.startsWith(prefix + '-') && f.endsWith('.json')).sort().flatMap(f => {
  const v = read(f);
  if (!Array.isArray(v)) throw new Error(`${f} must contain a JSON array`);
  return v;
});

// Output paths come from the registry, so the loader and this script can never disagree.
const reg = fs.readFileSync(path.join(root, 'lib', 'registry.ts'), 'utf8');
const block = reg.split(/\n  \{\n/).find(b => b.includes(`id: '${id}'`));
if (!block) { console.error(`${id} is not registered. Run npm run new-chapter first.`); process.exit(1); }
const notesPath = block.match(/loader:.*import\('\.\.\/(data\/[^']+)'\)/)?.[1];
const cbPath = block.match(/casebook:.*import\('\.\.\/(data\/[^']+)'\)/)?.[1];

let wrote = [];
if (fs.existsSync(path.join(dir, 'chapter.json'))) {
  const ch = { ...read('chapter.json'), sections: parts('sections'), practice: parts('practice') };
  fs.writeFileSync(path.join(root, notesPath), JSON.stringify(ch, null, 1) + '\n');
  wrote.push(`${notesPath} (${ch.sections.length} sections, ${ch.sections.reduce((n, s) => n + s.cards.length, 0)} cards, ${ch.practice.length} practice)`);
}
if (fs.existsSync(path.join(dir, 'meta.json'))) {
  if (!cbPath) { console.error(`${id} has no casebook registered (re-run new-chapter with --casebook, or add the casebook line).`); process.exit(1); }
  const Q = parts('questions');
  // nums.json: { questionId: [[label, value, unit, tol?], …] } — final figures for auto-checked numericals.
  if (fs.existsSync(path.join(dir, 'nums.json'))) {
    const nums = read('nums.json');
    for (const q of Q) if (nums[q.id]) q.nums = nums[q.id];
    const unknown = Object.keys(nums).filter(k => !Q.some(q => q.id === k));
    if (unknown.length) console.warn('nums.json has unknown question ids: ' + unknown.join(', '));
  }
  const P = parts('provisions').map(p => ({ ...p, qs: Q.filter(q => q.links?.includes(p.id)).map(q => q.id) }));
  const cb = { meta: read('meta.json'), P, Q, groups: read('groups.json'), ...read('extras.json') };
  const formulas = parts('formulas');
  if (formulas.length) cb.formulas = formulas;
  fs.writeFileSync(path.join(root, cbPath), JSON.stringify(cb) + '\n');
  wrote.push(`${cbPath} (${P.length} provisions, ${Q.length} questions)`);
}
console.log(wrote.length ? 'Wrote ' + wrote.join('; ') : 'Nothing to write: add chapter.json and/or meta.json to the parts folder.');

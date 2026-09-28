#!/usr/bin/env node
// Check a chapter's data before it ships. Usage: npm run validate -- <chapter-id>
// Errors break the app or mislabel sources and must be fixed. Warnings are worth a look.
import fs from 'node:fs';
import path from 'node:path';

const id = process.argv[2];
if (!id) { console.error('Usage: npm run validate -- <chapter-id>'); process.exit(1); }
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const errors = [], warns = [];
const E = m => errors.push(m), W = m => warns.push(m);

const reg = fs.readFileSync(path.join(root, 'lib', 'registry.ts'), 'utf8');
const block = reg.split(/\n  \{\n/).find(b => b.includes(`id: '${id}'`));
if (!block) { console.error(`${id} is not registered in lib/registry.ts`); process.exit(1); }
if (/One-line summary|Chapter Title/.test(block)) E('lib/registry.ts row still has template title/summary text');
const notesPath = block.match(/loader:.*import\('\.\.\/(data\/[^']+)'\)/)?.[1];
const cbPath = block.match(/casebook:.*import\('\.\.\/(data\/[^']+)'\)/)?.[1];
const load = p => { try { return JSON.parse(fs.readFileSync(path.join(root, p), 'utf8')); } catch (e) { E(`${p}: ${e.message}`); return null; } };
const dupes = arr => arr.filter((x, i) => arr.indexOf(x) !== i);
const ATTEMPT = /\b(Jan|Jun|June|May|Nov|Dec|Sep|Sept|Oct|Mar|Apr)[a-z]*\.?\s*(19|20)\d\d\b/i;
const htmlOk = (h, where) => {
  if (typeof h !== 'string') return;
  for (const t of ['p', 'strong', 'ul', 'li', 'em', 'table']) {
    const o = (h.match(new RegExp(`<${t}[\\s>]`, 'g')) || []).length, c = (h.match(new RegExp(`</${t}>`, 'g')) || []).length;
    if (o !== c) W(`${where}: <${t}> opened ${o}, closed ${c}`);
  }
};

// ---------- notes / flip cards / practice ----------
const ch = load(notesPath);
if (ch) {
  for (const k of ['id', 'subject', 'number', 'title', 'summary']) if (ch[k] === undefined || ch[k] === '') E(`chapter.${k} missing`);
  if (ch.id !== id) E(`chapter.id is "${ch.id}", expected "${id}"`);
  if (/One-line summary|Chapter Title/.test(ch.summary + ch.title)) E('chapter title/summary still has template text');
  if (!ch.sections?.length) E('chapter has no sections');
  const cards = (ch.sections ?? []).flatMap(s => s.cards ?? []);
  dupes((ch.sections ?? []).map(s => s.id)).forEach(d => E(`duplicate section id ${d}`));
  dupes(cards.map(c => c.id)).forEach(d => E(`duplicate card id ${d}`));
  const TYPES = ['clause', 'concept', 'illustration', 'mnemonic', 'section', 'case'];
  for (const c of cards) {
    if (!TYPES.includes(c.type)) E(`card ${c.id}: type "${c.type}" not one of ${TYPES.join('/')}`);
    if (!c.front?.trim()) E(`card ${c.id}: empty front`);
    if (!c.back || !Object.values(c.back).some(v => (Array.isArray(v) ? v.length : v))) E(`card ${c.id}: empty back`);
  }
  (ch.sections ?? []).forEach(s => { if (!s.cards?.length) W(`section ${s.id} has no cards`); });
  dupes((ch.practice ?? []).map(p => p.id)).forEach(d => E(`duplicate practice id ${d}`));
  for (const p of ch.practice ?? []) {
    if (!p.prompt || !p.modelAnswer) E(`practice ${p.id}: prompt and modelAnswer are required`);
    if (!p.markingPoints?.length) W(`practice ${p.id}: no marking points`);
  }
  if ((ch.practice ?? []).length < 5) W(`only ${(ch.practice ?? []).length} written practice questions`);
}

// ---------- casebook ----------
const cb = cbPath ? load(cbPath) : null;
if (cbPath && cb) {
  const m = cb.meta ?? {};
  if (!m.title) E('meta.title missing');
  if (!Array.isArray(m.sources) || !m.sources.every(s => Array.isArray(s) && s.length === 2)) E('meta.sources must be [[kind, label], ...]');
  const kinds = new Set((m.sources ?? []).map(s => s[0]));
  const verdicts = (m.verdicts ?? []).map(v => v.label);
  for (const v of m.verdicts ?? []) if (!['bad', 'good', 'mixed'].includes(v.tone)) E(`verdict ${v.label}: tone must be bad/good/mixed`);

  const gkeys = (cb.groups ?? []).map(g => g[0]);
  dupes(gkeys).forEach(d => E(`duplicate group ${d}`));
  const P = cb.P ?? [], Q = cb.Q ?? [];
  const pid = new Set(P.map(p => p.id)), qid = new Set(Q.map(q => q.id));
  dupes(P.map(p => p.id)).forEach(d => E(`duplicate provision id ${d}`));
  dupes(Q.map(q => q.id)).forEach(d => E(`duplicate question id ${d}`));

  for (const p of P) {
    for (const k of ['id', 'g', 'label', 'title', 'short', 'law']) if (!p[k]) E(`provision ${p.id}: ${k} missing`);
    if (!gkeys.includes(p.g)) E(`provision ${p.id}: group "${p.g}" not in groups`);
    if (!Array.isArray(p.notes)) E(`provision ${p.id}: notes must be an array`);
    for (const q of p.qs ?? []) if (!qid.has(q)) E(`provision ${p.id}: qs has unknown question ${q}`);
    htmlOk(p.law, `provision ${p.id}.law`);
    if (!(p.qs ?? []).length) W(`provision ${p.id} (${p.label}) is not tested by any question`);
  }
  gkeys.forEach(g => { if (!P.some(p => p.g === g)) W(`group ${g} has no provisions`); });

  for (const q of Q) {
    const where = `question ${q.id}`;
    if (!q.q) E(`${where}: facts (q) missing`);
    if (!q.src) E(`${where}: src label missing`);
    if (q.k !== 'mcq' && !kinds.has(q.k)) E(`${where}: kind "${q.k}" is not in meta.sources`);
    if (!q.links?.length) E(`${where}: links empty`);
    for (const l of q.links ?? []) if (!pid.has(l)) E(`${where}: links to unknown provision ${l}`);
    if (q.k === 'mcq') {
      if (!Array.isArray(q.opts) || q.opts.length < 2) E(`${where}: MCQ needs opts`);
      if (!Number.isInteger(q.ans) || q.ans < 0 || q.ans >= (q.opts?.length ?? 0)) E(`${where}: MCQ ans out of range`);
      if (!q.why) W(`${where}: MCQ has no explanation (why)`);
    } else if (!q.a) E(`${where}: model answer (a) missing`);
    // Sourced kinds must name the attempt, e.g. "RTP Nov 2026 · Q3", "PYQ May 2025 · Q4(b)".
    if (['rtp', 'mtp', 'pyq'].includes(q.k) && !ATTEMPT.test(q.src)) E(`${where}: ${q.k} source "${q.src}" must name the attempt (e.g. "PYQ May 2025 · Q4(b)")`);
    if (q.k === 'sm-ill' && !/\d|case (study|scenario)/i.test(q.src)) E(`${where}: SM illustration source must carry its number (or say Case Study / Case Scenario)`);
    if (verdicts.length && q.k !== 'mcq' && !verdicts.includes(q.v)) W(`${where}: v "${q.v}" is not a verdict, so it is shown as reveal-and-self-mark`);
    for (const f of ['q', 'a', 'trap', 'why']) htmlOk(q[f], `${where}.${f}`);
    const pl = P.filter(p => (p.qs ?? []).includes(q.id)).map(p => p.id);
    for (const l of q.links ?? []) if (pid.has(l) && !pl.includes(l)) W(`${where} links ${l}, but ${l}.qs does not list it (npm run assemble rebuilds qs)`);
  }

  // cross-references inside HTML
  const blob = JSON.stringify(cb);
  for (const [, ref] of blob.matchAll(/data-p=\\"([^"\\]+)\\"/g)) if (!pid.has(ref)) E(`HTML link data-p="${ref}" points to no provision`);
  for (const n of cb.numbers ?? []) if (n[2] && !pid.has(n[2])) E(`numbers row "${n[0]}" -> unknown provision ${n[2]}`);
  for (const f of cb.finder ?? []) if (!pid.has(f[1])) E(`finder row "${f[0]}" -> unknown provision ${f[1]}`);
  if (m.scopeNote && !pid.has(m.scopeNote)) E(`meta.scopeNote ${m.scopeNote} is not a provision`);

  const hunt = P.filter(p => p.hunt).length ? P.filter(p => p.hunt) : P;
  const huntQs = Q.filter(q => q.k !== 'mcq' && hunt.some(p => p.id === q.links?.[0]));
  if (hunt.length < 4) E(`Provision Hunt needs at least 4 answer options (has ${hunt.length})`);
  if (huntQs.length < 10) W(`only ${huntQs.length} questions usable in Provision Hunt (10 per round)`);
  if (Q.filter(q => q.k === 'mcq').length < 10) W(`only ${Q.filter(q => q.k === 'mcq').length} MCQs`);

  // Coverage against the study-material inventory, when the extractor has been run.
  const invPath = path.join(root, 'work', id, 'sm', 'inventory.json');
  if (fs.existsSync(invPath)) {
    const inv = JSON.parse(fs.readFileSync(invPath, 'utf8'));
    const ills = new Set(inv.illustrations.filter(i => !i.repeat).map(i => i.n));
    const have = Q.filter(q => q.k === 'sm-ill').length;
    if (have < ills.size) W(`study material has ${ills.size} illustrations; casebook has ${have} sm-ill questions`);
  }

  const by = {};
  Q.forEach(q => { by[q.k] = (by[q.k] ?? 0) + 1; });
  console.log(`${id}: ${P.length} provisions, ${Q.length} questions (${Object.entries(by).map(([k, n]) => `${k} ${n}`).join(', ')})`);
}
if (ch) console.log(`${id}: ${ch.sections?.length ?? 0} sections, ${(ch.sections ?? []).reduce((n, s) => n + (s.cards?.length ?? 0), 0)} cards, ${ch.practice?.length ?? 0} practice`);

warns.slice(0, 40).forEach(w => console.log('  warn  ' + w));
if (warns.length > 40) console.log(`  … ${warns.length - 40} more warnings`);
errors.forEach(e => console.log('  ERROR ' + e));
console.log(errors.length ? `\n${errors.length} error(s), ${warns.length} warning(s)` : `\nOK: 0 errors, ${warns.length} warning(s)`);
process.exit(errors.length ? 1 : 0);

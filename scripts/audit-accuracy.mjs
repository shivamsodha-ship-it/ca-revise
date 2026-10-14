#!/usr/bin/env node
// Accuracy audit for a chapter's data. Usage: node scripts/audit-accuracy.mjs <chapter-id | all> [--json]
// It cannot know what ICAI says; it finds the ways the data can contradict ITSELF or its own sources:
//   1 MCQ key vs the answer text         2 typed-answer figures vs the model answer
//   3 numbers table vs the provision it points to     4 broken links and sources
//   5 figures in the mastery layer that appear nowhere in the casebook (must be verified by hand)
// Errors are real defects. "VERIFY" lines are claims no source in the repo backs: check each against ICAI/RBI.
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const reg = fs.readFileSync(path.join(root, 'lib', 'registry.ts'), 'utf8');
const rows = reg.split(/\n  \{\n/).slice(1).map(b => ({
  id: b.match(/id: '([^']+)'/)?.[1],
  notes: b.match(/loader:.*import\('\.\.\/(data\/[^']+)'\)/)?.[1],
  cb: b.match(/casebook:.*import\('\.\.\/(data\/[^']+)'\)/)?.[1],
  learn: b.match(/learn:.*import\('\.\.\/(data\/[^']+)'\)/)?.[1],
})).filter(r => r.id);
const want = process.argv[2];
const asJson = process.argv.includes('--json');
if (!want) { console.error('Usage: node scripts/audit-accuracy.mjs <chapter-id|all>'); process.exit(1); }

const strip = s => String(s ?? '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
// every number in a text, with Indian commas removed; '1,50,000' -> 150000; '12.5%' -> 12.5
const nums = s => [...strip(s).replace(/(\d),(?=\d)/g, '$1').matchAll(/\d+(?:\.\d+)?/g)].map(m => parseFloat(m[0]));
const near = (a, list, rel = 0.006) => list.some(b => Math.abs(a - b) <= Math.max(Math.abs(b) * rel, 0.006));
// "figure + unit" claims in a text, e.g. '15 days', '2.5 per cent' -> { v: 2.5, u: '%' }
const UNIT = u => { u = (u || '').toLowerCase(); return u === 'per cent' ? '%' : u.replace(/s$/, ''); };
const unitClaims = text => [...text.matchAll(/(\d+(?:\.\d+)?)\s*(%|per cent|crore|lakh|working days?|days?|months?|years?)/gi)].map(m => ({ v: parseFloat(m[1]), u: UNIT(m[2]), raw: m[0].trim() }));
const statedIn = (have, c) => have.some(h => h.u === c.u && Math.abs(h.v - c.v) <= Math.max(h.v * 0.001, 0.0006));

const report = [];
for (const r of rows.filter(r => want === 'all' || r.id === want)) {
  const out = { id: r.id, errors: [], verify: [], warns: [], stats: {} };
  const load = p => p && fs.existsSync(path.join(root, p)) ? JSON.parse(fs.readFileSync(path.join(root, p), 'utf8')) : null;
  const cb = load(r.cb), ch = load(r.notes), lr = load(r.learn);
  const E = m => out.errors.push(m), V = m => out.verify.push(m), W = m => out.warns.push(m);

  if (cb) {
    const pid = new Set(cb.P.map(p => p.id));
    const srcKinds = new Set(cb.meta.sources.map(s => s[0]));
    // 1 + 2 + 4 questions
    let mcq = 0, numq = 0;
    for (const q of cb.Q) {
      for (const l of q.links ?? []) if (!pid.has(l)) E(`${q.id}: links to unknown provision ${l}`);
      if (q.k !== 'mcq' && !srcKinds.has(q.k)) E(`${q.id}: kind ${q.k} is not in meta.sources`);
      if (['rtp', 'mtp', 'pyq'].includes(q.k) && !/(Jan|May|Sep|Nov|Dec|Mar|Apr|Jun)[a-z]*\.?\s*20\d\d/i.test(q.src)) E(`${q.id}: ${q.k} source "${q.src}" names no attempt`);
      if (q.k === 'mcq') {
        mcq++;
        if (!Array.isArray(q.opts) || q.opts.length < 2) { E(`${q.id}: MCQ has no options`); continue; }
        if (!(q.ans >= 0 && q.ans < q.opts.length)) E(`${q.id}: ans ${q.ans} out of range`);
        const m = strip(q.a ?? '').match(/Answer:\s*\(?([a-d])\)?/i);
        if (m && 'abcd'.indexOf(m[1].toLowerCase()) !== q.ans) E(`${q.id}: key says (${'abcd'[q.ans]}) but the answer text says (${m[1]})`);
        if (!m) W(`${q.id}: answer text has no "Answer: (x)" line to cross-check the key`);
        if (!q.why) W(`${q.id}: MCQ has no explanation`);
        const wm = strip(q.why ?? '').match(/\(([a-d])\)\s*(?:is|are)\s*(?:the\s*)?(?:right|correct)/i);
        if (wm && 'abcd'.indexOf(wm[1].toLowerCase()) !== q.ans) E(`${q.id}: explanation says (${wm[1]}) is right but the key is (${'abcd'[q.ans]})`);
        const optTexts = q.opts.map(o => strip(o).trim().toLowerCase());
        if (new Set(optTexts).size !== optTexts.length) E(`${q.id}: two options are identical`);
      }
      if (q.nums?.length) {
        numq++;
        const pool = nums((q.a ?? '') + ' ' + (q.why ?? ''));
        q.nums.forEach(n => {
          const v = Math.abs(n[1]);
          // the final figure should appear in the model answer (allowing rounding to 2 dp, or a x100 / ÷100 unit change)
          if (!near(v, pool, 0.01) && !near(v * 100, pool, 0.01) && !near(v / 100, pool, 0.01) && !near(v * 1e5, pool, 0.01) && !near(v / 1e5, pool, 0.01) && !near(v * 1e7, pool, 0.01) && !near(v / 1e7, pool, 0.01))
            E(`${q.id}: typed-answer figure "${n[0]}" = ${n[1]} appears nowhere in the model answer`);
        });
      }
    }
    for (const q of cb.Q) if (/Beyond the SM|beyond the SM/.test(q.a ?? '')) V(`${q.id}: answer contains BEYOND-SM statements (kind ${q.k})`);
    out.stats.questions = cb.Q.length; out.stats.mcq = mcq; out.stats.numerical = numq;

    // 3 numbers table vs provision
    for (const [item, fig, p] of cb.numbers ?? []) {
      const prov = cb.P.find(x => x.id === p);
      if (!prov) { E(`numbers row "${strip(item)}": unknown provision ${p}`); continue; }
      const text = [prov.law, ...(prov.notes ?? []), prov.upd, prov.mem].join(' ');
      const pool = nums(text);
      const figs = nums(fig).filter(f => !(f <= 12 && Number.isInteger(f) && !/%|₹|day|month|year|crore|lakh/i.test(strip(fig))));
      for (const f of figs) if (f > 0 && !near(f, pool, 0.001)) V(`numbers row "${strip(item).slice(0, 60)}" cites ${f}, which is not in provision ${p}`);
    }

    // 5 learn content vs casebook: every "figure + unit" claim must be stated, with the same unit, somewhere in the casebook
    if (lr) {
      const WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12, fifteen: 15, eighteen: 18 };
      const claims = html => unitClaims(strip(html).replace(/(\d),(?=\d)/g, '$1').replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|twelve|fifteen|eighteen)\b(?=\s+(?:working days?|days?|months?|years?|crore|lakh))/gi, w => WORDS[w.toLowerCase()]));
      const have = claims(JSON.stringify(cb));
      const seen = new Set();
      const scan = (where, html) => { for (const c of claims(html)) { const k = where + c.raw; if (statedIn(have, c) || seen.has(k)) continue; seen.add(k); V(`${where}: "${c.raw}" is not stated in the casebook with that unit`); } };
      for (const l of lr.levels ?? []) { l.teach.forEach(b => scan(`level ${l.id}`, b.html)); scan(`level ${l.id}`, l.picture ?? ''); scan(`level ${l.id}`, l.correlate ?? ''); }
      for (const row of lr.compare?.rows ?? []) { scan('compare', row.a); scan('compare', row.b); }
      for (const g of lr.games ?? []) if (g.type === 'match') g.pairs.forEach(p => scan(`game ${g.id}`, p[0] + ' ' + p[1]));
      for (const l of lr.levels ?? []) for (const x of l.links ?? []) if (!pid.has(x)) E(`level ${l.id}: unknown provision ${x}`);
      // anything the author labelled as outside the study material is a claim to confirm against the source
      const flagged = (where, html) => { for (const m of strip(html).matchAll(/[^.]*\b(Beyond the SM|not in the SM|not printed in the SM|check the latest|must be checked|verify the latest|illustrative)\b[^.]*\./gi)) V(`${where}: BEYOND-SM claim -> "${m[0].trim().slice(0, 170)}"`); };
      for (const l of lr.levels ?? []) { l.teach.forEach(b => flagged(`level ${l.id}`, b.h + '. ' + b.html)); flagged(`level ${l.id}`, (l.picture ?? '') + ' ' + (l.correlate ?? '')); }
      for (const row of lr.compare?.rows ?? []) flagged('compare', row.a + ' ' + row.b);
      for (const m of lr.memory?.mnemonics ?? []) scan('memory ' + m.id, m.stands + ' ' + (m.story ?? ''));
      for (const h of lr.memory?.hooks ?? []) scan('hook ' + h.id, h.story);
      for (const c of lr.connect?.links ?? []) { scan('connect', c.a + ' ' + c.b + ' ' + c.how); flagged('connect', c.how); }
      if (lr.vision) { lr.vision.sixty.forEach(x => scan('vision', x)); scan('vision', lr.vision.why); lr.vision.map.forEach(b => b.items.forEach(x => scan('vision', x))); }
    }
  }
  // flip cards: every "figure + unit" on a card must also be stated in the casebook (cards and casebook are written separately)
  if (ch && cb) {
    const claims = html => unitClaims(strip(html).replace(/(\d),(?=\d)/g, '$1'));
    const have = claims(JSON.stringify(cb));
    for (const sec of ch.sections) for (const c of sec.cards) {
      const text = [c.front, ...Object.values(c.back ?? {}).flat()].join(' ');
      for (const cl of claims(text)) if (!statedIn(have, cl)) V(`card ${c.id}: "${cl.raw}" is not stated in the casebook`);
    }
  }
  if (ch) {
    const cards = ch.sections.flatMap(s => s.cards);
    out.stats.cards = cards.length;
    if (!ch.currency) W('chapter has no currency line');
  }
  report.push(out);
}

if (asJson) { console.log(JSON.stringify(report, null, 1)); process.exit(0); }
let bad = 0;
for (const o of report) {
  console.log(`\n=== ${o.id}  ${JSON.stringify(o.stats)}`);
  o.errors.forEach(e => console.log('  ERROR  ' + e));
  o.warns.forEach(e => console.log('  warn   ' + e));
  o.verify.forEach(e => console.log('  VERIFY ' + e));
  console.log(`  -> ${o.errors.length} errors, ${o.warns.length} warnings, ${o.verify.length} to verify by hand`);
  bad += o.errors.length;
}
process.exit(bad ? 1 : 0);

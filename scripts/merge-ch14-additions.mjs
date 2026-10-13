#!/usr/bin/env node
// Adds the CFA-style and one-line questions to data/aaa/ch14-casebook.json. Safe to re-run: it replaces its own ids.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const file = path.join(root, 'data/aaa/ch14-casebook.json');
const { questions } = await import(pathToFileURL(path.join(root, 'scripts/learn-src/ch14-questions.mjs')).href);
const cb = JSON.parse(fs.readFileSync(file, 'utf8'));

const ours = new Set(questions.map(q => q.id));
cb.Q = cb.Q.filter(q => !ours.has(q.id));
const pid = new Set(cb.P.map(p => p.id));
for (const q of questions) {
  for (const l of q.links) if (!pid.has(l)) throw new Error(`${q.id}: unknown provision ${l}`);
  cb.Q.push(q);
}
// sources
const need = [['cfa', 'CFA-style'], ['line', 'One-line twists']];
for (const [k, l] of need) if (!cb.meta.sources.some(s => s[0] === k)) cb.meta.sources.push([k, l]);
// provisions' question lists
cb.P = cb.P.map(p => ({ ...p, qs: cb.Q.filter(q => q.links?.includes(p.id)).map(q => q.id) }));

// formula family for day-count interest (clears the "numerical but no formula" warnings)
const fam = {
  id: 'f-interest', title: 'Interest on a day count: accrued, FCNR and reversal',
  idea: '<p>Every interest figure in this chapter is <em>principal × rate × days ÷ year</em>. Only the day-count (360 or 365) and the question being asked change.</p>',
  master: { id: 'int-master', name: 'Interest for a part-year', expr: 'Interest = P × r × <span class="frac"><span>days</span><span>year basis</span></span>',
    vars: [['P', 'principal or deposit balance'], ['r', 'annual rate'], ['days', 'days since interest was last paid or booked'], ['year basis', '365 normally; 360 for FCNR']],
    logic: '<p>A year of interest is P × r. If only 45 days have passed you earned 45/365 of that year. The "year basis" is just how many days the bank counts in a year.</p>',
    cue: 'accrued interest for N days; interest on a deposit for part of a year', trap: '<p>Using 365 for FCNR, or forgetting that unbooked accrued interest still counts in DTL.</p>',
    example: '<p>Deposits ₹3,650 crore at 6% for 45 days: 3,650 × 6% × 45 ÷ 365 = ₹27 crore (LN4).</p>', p: 'bank-dtl' },
  items: [
    { id: 'int-fcnr', name: 'FCNR interest (360-day year)', expr: 'Interest = P × r × <span class="frac"><span>days</span><span>360</span></span>', vars: [['P', 'foreign currency deposit']], logic: '<p>Same idea, but the SM says FCNR counts a 360-day year; convert at the HO-notified rate.</p>', derive: '<p>Master with year basis = 360.</p>', from: ['int-master'], cue: 'FCNR deposit; foreign currency deposit interest', hook: 'FCNR = 360', trap: '<p>Using 365.</p>', example: '<p>US$ 50,000 × 2% × 90 ÷ 360 = US$ 250; × ₹84 = ₹21,000 (LN1).</p>', p: 'bank-deposits' },
    { id: 'int-reversal', name: 'Interest reversed on turning NPA', expr: 'Reversal = interest credited but not realised', vars: [['reversal', 'accrued income taken to P&L earlier']], logic: '<p>Once an account is NPA, income counts only when cash comes in. Anything booked but unpaid is taken back out.</p>', derive: '<p>Master gives the accrual (P × r × days ÷ 365); NPA status reverses it.</p>', from: ['int-master'], cue: 'account becomes NPA; interest already credited; interest not realised', hook: 'NPA = cash only', trap: '<p>Leaving the accrual in income because it was earned.</p>', example: '<p>₹1,000 crore × 12% × 9/12 = ₹90 crore reversed; NIM falls from 6.00% to 5.775% (CF5).</p>', p: 'bank-npa-income' },
  ],
};
cb.formulas = (cb.formulas ?? []).filter(f => f.id !== fam.id);
cb.formulas.push(fam);

// recompute check for numerical figures quoted in the questions
const approx = (a, b, t = 0.01) => Math.abs(a - b) <= t;
const chk = [
  [4500 / 60000 * 100, 7.5], [5500 / 60000 * 100, 9.17], [7000 / 60000 * 100, 11.67], [5500 / 125000 * 100, 4.4], [7000 / 65000 * 100, 10.77],
  [200 * .01 * .4 + 30 * .1 * .4 + 20 * 1 * .25, 7.0], [230 * .004 + 8 + 12 * .3, 12.52], [12.52 - 7.0, 5.52],
  [30000 * .05 + 20000 * .1 + 25000 * .4 - 4500, 9000], [8100 / 9000 * 100, 90], [9000 - 8100, 900],
  [2500 / 50000 * 100, 5], [1000 / 48500 * 100, 2.06], [1500 / 2500 * 100, 60],
  [(6000 - 90 - 3600) / 40000 * 100, 5.775],
  [105 / 1000 * 100, 10.5], [118 / 1000 * 100, 11.8],
  [50000 * .02 * 90 / 360, 250], [250 * 84, 21000], [3650 * .06 * 45 / 365, 27], [27 * .04, 1.08],
  [150 / 900 * 100, 16.67], [150 / 940 * 100, 15.96], [400 - 150, 250], [250 / 7850 * 100, 3.18],
  [100 * .45 + Math.min(40, .0125 * 2000) + 30, 100], [.15 * 200, 30], [50 - 30, 20],
];
chk.forEach(([x, y], i) => { if (!approx(x, y, 0.02)) throw new Error(`figure check ${i}: computed ${x}, written ${y}`); });
// nums on each numerical must match what was checked above (stored as given)
fs.writeFileSync(file, JSON.stringify(cb) + '\n');
console.log(`Merged ${questions.length} questions. Casebook now has ${cb.Q.length} questions.`);

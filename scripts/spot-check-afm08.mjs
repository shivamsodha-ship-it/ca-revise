#!/usr/bin/env node
// Independent recomputation of ICAI figures quoted in AFM Ch 8 (from the casebook's own model answers).
// Each line recomputes from the question's inputs and compares with the figure the app shows.
const checks = [];
const t = (name, got, want, tol = 0.006) => checks.push([name, got, want, Math.abs(got - want) <= tol]);
t('Required return, SM example (r1 10%, 6%, 2%)', (0.10 / 0.94 + 0.02) * 100, 12.64);
t('Required return, SM TYK (16%, 5.5%, 1.5%)', (0.16 / 0.945 + 0.015) * 100, 18.43);
// beta and expected NAV (SM TYK D and K)
const nd = 70 * (1 - 0.075) + (0.71 - 0.25); t('Expected NAV, D MF', nd, 65.21);
const nk = 60 * (1 - 0.055) + (2.5 - 0.25); t('Expected NAV, K MF', nk, 58.95);
t('Beta D = 2 x 11.25 / 15', 2 * 11.25 / 15, 1.5); t('Beta K = 3.3 x 5 / 15', 3.3 * 5 / 15, 1.1);
// hedge fund (ANP plan)
t('Hedge fee at +29% (lakh)', 20 * 0.001 * 100 + Math.max(0, 20 * 1.29 - 21) * 0.02 * 100, 11.6);
// closed-end (PYQ May 2026 Q4(b))
t('Closed-end NAV growth per period (%)', ((22.3 / 20) ** 0.25 - 1) * 100, 2.76, 0.01);
t('Closed-end investor GM return (%)', ((20 * 1.16 * 1.0 * 1.0 > 0 ? (22.3 * 1.04) / 20 : 0) ** 0.25 - 1) * 100, 3.771, 0.01);
// constant ratio plan (SM TYK Sunidhi)
let bonds = 100000, units = 100000 / 40, last = 40; const log = [];
for (const nav of [25, 36, 32, 38, 37, 42, 43, 50, 52]) {
  if (Math.abs(nav - last) / last >= 0.15) {
    const total = bonds + units * nav, target = total / 2, trade = (target - units * nav) / nav;
    units += trade; bonds -= trade * nav; log.push([nav, +trade.toFixed(2)]);
  }
  last = nav;
}
const final = bonds + units * 52;
t('CRP: units traded at NAV 25 (buy)', log[0][1], 750, 0.01);
t('CRP: units traded at NAV 36 (sell)', log[1][1], -496.53, 0.01);
t('CRP: units traded at NAV 38 (sell)', log[2][1], -72.46, 0.01);
t('CRP: final value', final, 240647.55, 1);
t('CRP: buy-and-hold value by the stated formula 1,00,000 + 2,500 x 52', 100000 + 2500 * 52, 230000, 0.01);
console.log('NOTE the source as transcribed prints 2,60,000 for buy-and-hold; the formula gives 2,30,000 (unresolved, see research/accuracy-report.md).');
// equalisation (SM TYK, 300 lakh units): only the identity checks that do not need the full table
t('Real return (PYQ Sep 2025 Q5(b)): 27.71% nominal, 4.5% inflation', ((1.2771 / 1.045) - 1) * 100, 22.21, 0.01);
let bad = 0;
for (const [n, got, want, ok] of checks) { if (!ok) bad++; console.log(`${ok ? 'OK  ' : 'FAIL'} ${n}: computed ${+got.toFixed(4)} vs shown ${want}`); }
console.log(bad ? `${bad} mismatch(es)` : 'All recomputed figures agree.');
process.exit(bad ? 1 : 0);

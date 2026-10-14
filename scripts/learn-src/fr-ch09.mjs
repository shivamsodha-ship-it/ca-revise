import levels from './fr-ch09-levels.mjs';
import { compare, games } from './fr-ch09-play.mjs';
import solves from './fr-ch09-solves.mjs';
import { vision, memory, connect } from './fr-ch09-mem.mjs';

// Independent recomputation of every numeric solver step and numeric recall, in order.
const r = (x, d = 2) => +x.toFixed(d);
const expect = {
  's-voucher': [[40 - 10, 500 * .3 * .8, Math.round(1000 * 1000 / 1120 / 10) * 10, Math.round(1000 * 120 / 1120 / 10) * 10], [1000 * .3 * .9, 2000 * 2000 / 2270, 2000 * 270 / 2270], []],
  's-catchup': [[30000 + 5000, 35000 / 250, 100 * 140 - 15000], [(60000 + 10000) / 250, 100 * 280 - 30000], [2000000 * .65, 2000000 + 150000 + 250000, 60.60, .606 * 2400000 - 1300000]],
  's-return': [[970 * 50, 30 * 50, 30 * 30], [9 * 100 + 3, 100 - 3], []],
  's-progress': [[500000 / 2500000 * 100, .2 * 3500000, .2 * 3500000 + 1500000], [600000 / 3000000 * 100, .2 * 4000000 + 1000000, .2 * 4000000 + 1000000 - 1600000], [300000 / 1200000 * 100, .25 * 2000000 + 1000000]],
  's-finance': [[121000 / 1.1 ** 2, 121000 - 100000, 100000 * .1], [4000 * 1.06 ** 2, 4000 * 1.06 ** 2 - 4000], []],
  's-points': [[1000000 / 500 * 10, 20000 * .5 * .8, 1000000 * 8000 / 1008000, 1000000 - 1000000 * 8000 / 1008000], [10000 * 500 / 10500, 10000 * 10000 / 10500]]
};
const recallExpect = {
  'l02-contract': [3], 'l03-mod': [100 * ((60000 + 10000) / 250) - 30000], 'l04-po': [4],
  'l05-options': [Math.round(1000 * (500 * .3 * .8) / (1000 + 500 * .3 * .8) / 10) * 10, 10000 * 500 / 10500],
  'l06-variable': [30 * 50, 700000 * 10 / 1e6], 'l07-financing': [121000 - 100000, 4000 * 1.06 ** 2, 800 * 24 - 2000],
  'l08-allocate': [50000 * 25000 / 70000, .6 * 120], 'l09-control': [.2 * 35 + 15], 'l10-costs-sca': [5 + 2]
};
function check(learn) {
  const E = [];
  for (const s of learn.solves) {
    const exp = expect[s.id];
    if (!exp) { E.push(`no recomputation for solver ${s.id}`); continue; }
    s.variants.forEach((v, vi) => {
      const steps = v.steps.filter(x => x.kind === 'num');
      const ex = exp[vi] ?? [];
      if (ex.length !== steps.length) { E.push(`${s.id} v${vi}: ${steps.length} numeric steps but ${ex.length} recomputed`); return; }
      steps.forEach((st, k) => {
        const tol = st.tol ?? Math.max(Math.abs(st.ans) * .0025, .006);
        if (Math.abs(ex[k] - st.ans) > Math.max(tol, 1e-6) + 1e-9) E.push(`MISMATCH ${s.id} v${vi} step ${k}: stored ${st.ans}, recomputed ${r(ex[k], 4)}`);
      });
    });
  }
  for (const l of learn.levels) {
    const nums = l.recall.filter(x => x.k === 'num');
    const ex = recallExpect[l.id] ?? [];
    if (nums.length !== ex.length) { E.push(`${l.id}: ${nums.length} numeric recalls but ${ex.length} recomputed`); continue; }
    nums.forEach((q, i) => { const tol = q.tol ?? Math.max(Math.abs(q.ans) * .0025, .006); if (Math.abs(q.ans - ex[i]) > Math.max(tol, 1e-6) + 1e-9) E.push(`MISMATCH ${l.id} recall ${i}: ${q.ans} vs ${r(ex[i], 4)}`); });
  }
  return E;
}
export default { file: 'data/fr/ch09-learn.json', learn: { vision, levels, compare, games, solves, memory, connect }, check };

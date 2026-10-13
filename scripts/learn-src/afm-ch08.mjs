import levels from './afm-ch08-levels.mjs';
import { compare, games } from './afm-ch08-play.mjs';
import solves from './afm-ch08-solves.mjs';
import { vision, memory, connect } from './afm-ch08-mem.mjs';

// Independent recomputation. Each entry lists the numeric steps of a variant, in order.
const r = (x, d = 2) => +x.toFixed(d);
const sd = (a) => { const m = a.reduce((s, v) => s + v, 0) / a.length; return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
const d = [8, 5, 6, 3, 7].map((f, i) => f - [5, 4, 5, 4, 6][i]);
const expect = {
  's-nav': [[1200 + 300 + 50 + 20, 1570 - 20, 1550 / 155], [31 / 10, (1550 + 31) / (155 + 3.1)], [0.5 * 155, (1550 - 77.5) / 155], [100 * 22000 / 20000, 1550 - 100 + 110]],
  's-loads': [[49 / .98, 50.5 / 1.01], [(1 - 10 / 10.204) * 100, (10 / 9.8 - 1) * 100]],
  's-required': [[12 / .96, 12 / .96 + 1.5], [14 - 2, 12 * .96]],
  's-hpr': [[(104 - 100) + 3 + 1, 8], [1000 * 4, 4000 / 102, (1000 + 4000 / 102) * 104, ((1000 + 4000 / 102) * 104 - 100000) / 1000], [12 / 12, .01 * 50, (50 * 1.01) - 0.5]],
  's-yield': [[1e5 / 20, 5000 * 1.2 + 5000 * .4, 8, 8 * 365 / 73], [8 * 365 / 40], [5000 * -1.5 / 1e5 * 100, -7.5 * 365 / 30]],
  's-plans': [[1000 * 10 * .2, 1000 + 2000 / 25, 1000 + 1000 / 5, 1080 * 30, 1200 * 25, 1000 * 31], [1200 * 5 / 6], [1080 / 1.08]],
  's-beta-nav': [[.95 * 80, 20, 20 / 16, 1.25 * -4, 76 * .95, 76 * .95 + 3], [1.25 * 8, 76 * 1.1 + 3], [3 * 5 / 10]],
  's-te': [[d.reduce((a, b) => a + b, 0) / 5, d.reduce((a, v) => a + (v - 1) ** 2, 0), 8 / 4, sd(d)]],
  's-hedge': [[20 * .001 * 100, 20 * 1.29, (20 * 1.29 - 21) * .02 * 100, 20 * .001 * 100 + (20 * 1.29 - 21) * .02 * 100], [20 * 1.045, 2], [2]],
  's-crp': [[(40 - 50) / 50 * 100, 1e5 + 2000 * 40, 2000 * 40, ((1e5 + 80000) / 2 - 80000) / 40], [9e4 + 2250 * 48, (((9e4 + 2250 * 48) / 2) - 2250 * 48) / -48]],
  's-gilt': [[28 / 4, (28 - 4 + 16) / 4], [(28 - 10 + 3) / 4]],
  's-deq': [[20 / 100, 20 * 1.02 + .2, 20 * .99 + .2]],
  's-closed': [[(24.2 / 20) ** .5 * 100 - 100, 24.2 * 1.05, ((24.2 * 1.05) / 20) ** .5 * 100 - 100]],
};
function check(learn) {
  const E = [];
  for (const s of learn.solves) {
    const exp = expect[s.id];
    if (!exp) { E.push(`no recomputation for solver ${s.id}`); continue; }
    s.variants.forEach((v, vi) => {
      const steps = v.steps.filter(x => x.kind === 'num');
      const ex = exp[vi];
      if (!ex || ex.length !== steps.length) { E.push(`${s.id} v${vi}: ${steps.length} numeric steps but ${ex?.length ?? 0} recomputed`); return; }
      steps.forEach((st, k) => {
        const tol = st.tol ?? Math.max(Math.abs(st.ans) * .0025, .006);
        if (Math.abs(ex[k] - st.ans) > Math.max(tol, 1e-6) + 1e-9) E.push(`MISMATCH ${s.id} v${vi} step ${k}: stored ${st.ans}, recomputed ${r(ex[k], 4)}`);
      });
    });
  }
  // recall figures
  const rc = (id, ix, val) => { const l = learn.levels.find(x => x.id === id); const q = l.recall.filter(x => x.k === 'num')[ix]; if (Math.abs(q.ans - val) > (q.tol ?? 0.006)) E.push(`${id} num recall ${ix}: ${q.ans} vs ${val}`); };
  rc('l05-nav', 0, 1550 / 155); rc('l05-nav', 1, 10 - 0.5); rc('l05-nav', 2, 100 * 22000 / 20000);
  rc('l06-loads-costs', 0, 49 / .98); rc('l06-loads-costs', 1, 50.5 / 1.01); rc('l06-loads-costs', 2, 12 / .96 + 1.5);
  rc('l07-returns', 0, 8); rc('l07-returns', 1, 8 * 365 / 73); rc('l07-returns', 2, 8 * 365 / 40); rc('l07-returns', 3, 24 * 5 / 12);
  rc('l08-plans', 0, 1000 * 10 * .2 / 25); rc('l08-plans', 1, 200); rc('l08-plans', 2, 1200 * 5 / 6);
  rc('l09-fund-accounts', 0, 0.2); rc('l09-fund-accounts', 1, 20 * 1.02 + .2); rc('l09-fund-accounts', 2, 20 * .99 + .2);
  rc('l10-evaluation', 0, 20 / 16); rc('l10-evaluation', 1, d.reduce((a, b) => a + b, 0) / 5);
  rc('l11-managers-formula-plans', 0, 25.8 - 21); rc('l11-managers-formula-plans', 1, (25.8 - 21) * .02 * 100);
  rc('l12-beyond-sm', 0, 2000 / 150);
  return E;
}
export default { file: 'data/afm/ch08-learn.json', learn: { vision, levels, compare, games, solves, memory, connect }, check };

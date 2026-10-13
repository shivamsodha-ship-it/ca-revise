import levels from './aaa-ch19-levels.mjs';
import { compare, games } from './aaa-ch19-play.mjs';
import solves from './aaa-ch19-solves.mjs';
import { vision, memory, connect } from './aaa-ch19-mem.mjs';

const expect = {
  's-tax': [[12 + 20 + 25], [12 + 20 + 25 + 6, 63 - 60], [63 - 5 - 2], [4 * 60, 68 - 60]],
  's-company': [[3 - 1, 2 * 30, 68 - 5 - 3], [3 * 30]],
  's-nonaudit': [[12 + 6], [12 + 10], [12 - 4 + 10], [], [3 * 20]],
  's-indebt': [[5], [1], []],
  's-sick': [[], []],
};
function check(learn) {
  const E = [];
  for (const s of learn.solves) {
    const exp = expect[s.id];
    if (!exp) { E.push(`no recomputation for ${s.id}`); continue; }
    s.variants.forEach((v, vi) => {
      const steps = v.steps.filter(x => x.kind === 'num');
      const ex = exp[vi];
      if (!ex || ex.length !== steps.length) { E.push(`${s.id} v${vi}: ${steps.length} numeric steps vs ${ex?.length ?? 0} recomputed`); return; }
      steps.forEach((st, k) => { if (Math.abs(ex[k] - st.ans) > 1e-9) E.push(`MISMATCH ${s.id} v${vi} step ${k}: stored ${st.ans}, recomputed ${ex[k]}`); });
    });
  }
  return E;
}
export default { file: 'data/aaa/ch19-learn.json', learn: { vision, levels, compare, games, solves, memory, connect }, check };

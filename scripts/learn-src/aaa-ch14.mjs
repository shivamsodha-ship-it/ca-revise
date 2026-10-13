import levelsA from './ch14-levels-a.mjs';
import levelsB from './ch14-levels-b.mjs';
import { compare, games } from './ch14-play.mjs';
import solves from './ch14-solves.mjs';
import { vision, memory, connect } from './ch14-mem.mjs';

// Independent recomputation of solver figures (variant lists are the numeric steps in order).
const expect = {
  's-dtl': [[450, 1500, 1550, 62, 279], [1510, 1510 * .04, 1510 * .18], [1650, 66, 297]],
  's-dp': [[400, 300, 340, 204, 504, 520 - 504], [504, 450, 10], [280, 484]],
  's-npa-days': [[16 + 31 + 28 + 31], [16 + 28 + 31]],
  's-nbfc-prov': [[2, 2, 2, 3 * .2, 2 + 3 * .2], [5 * .1], [4, 3 * .5, 2 + 1.5]],
  's-nbfc-capital': [[100 / 10, (100 + 55) / 10], [(100 + 45) / 10, 150 - 145], [120, 120 - 100], [130 - 25, 120 - 105]],
  's-bank-crar': [[300 * .5, 150 + 200 + 50, 36 / 4], [300 * .75, 225 + 250, 36 / 475 * 100, 9 / 100 * 475 - 36]],
  's-business-test': [[500, 300 / 500 * 100, 54], [45], [520, 260 / 520 * 100]],
  's-npa-sale': [[10 - 6, 4 - 3], [7 - 4], []],
  's-div3': [[10000 / 100], [], [1e4 / 100]],
};
function check(learn) {
  const E = [];
  for (const s of learn.solves) {
    const exp = expect[s.id]; if (!exp) continue;
    s.variants.forEach((v, vi) => v.steps.filter(x => x.kind === 'num').forEach((st, k) => {
      const e = (exp[vi] ?? [])[k]; if (e === undefined) return;
      const tol = st.tol ?? Math.max(Math.abs(st.ans) * .0025, .006);
      if (Math.abs(e - st.ans) > Math.max(tol, 1e-6) + 1e-9) E.push(`MISMATCH ${s.id} v${vi} step ${k}: stored ${st.ans}, recomputed ${e}`);
    }));
  }
  return E;
}
export default { file: 'data/aaa/ch14-learn.json', learn: { vision, levels: [...levelsA, ...levelsB], compare, games, solves, memory, connect }, check };

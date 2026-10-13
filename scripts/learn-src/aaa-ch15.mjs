import levels from './aaa-ch15-levels.mjs';
import { compare, games } from './aaa-ch15-play.mjs';
import solves from './aaa-ch15-solves.mjs';
import { vision, memory, connect } from './aaa-ch15-mem.mjs';

const expect = {
  's-govco': [[30 + 25], [30 + 20], []],
  's-cag-term': [[58 + 6, 6], [62 + 6, 65 - 62]],
  's-supp': [[31 - 10, 21 + 28, 60 - 49]],
  's-vacancy': [[31, 30], []],
};
// day-of-month check: 10 Jan 2026 + 60 days
const d = new Date(Date.UTC(2026, 0, 10)); d.setUTCDate(d.getUTCDate() + 60);
if (d.getUTCMonth() !== 2 || d.getUTCDate() !== 11) throw new Error('date check failed: ' + d.toISOString());
const v = new Date(Date.UTC(2026, 2, 1)); v.setUTCDate(v.getUTCDate() + 30);
const v2 = new Date(Date.UTC(2026, 2, 1)); v2.setUTCDate(v2.getUTCDate() + 60);
if (v.getUTCMonth() !== 2 || v.getUTCDate() !== 31 || v2.getUTCMonth() !== 3 || v2.getUTCDate() !== 30) throw new Error('vacancy date check failed');
function check(learn) {
  const E = [];
  for (const s of learn.solves) {
    const exp = expect[s.id];
    if (!exp) { E.push(`no recomputation for ${s.id}`); continue; }
    s.variants.forEach((vv, vi) => {
      const steps = vv.steps.filter(x => x.kind === 'num');
      const ex = exp[vi];
      if (!ex || ex.length !== steps.length) { E.push(`${s.id} v${vi}: ${steps.length} numeric steps vs ${ex?.length ?? 0}`); return; }
      steps.forEach((st, k) => { if (Math.abs(ex[k] - st.ans) > 1e-9) E.push(`MISMATCH ${s.id} v${vi} step ${k}: ${st.ans} vs ${ex[k]}`); });
    });
  }
  return E;
}
export default { file: 'data/aaa/ch15-learn.json', learn: { vision, levels, compare, games, solves, memory, connect }, check };

import weightage from '../data/lastday/weightage.json';

interface Row { unit: string; by: Record<string, number>; total: number; pct: number; comp: number; choice: number; n: number }
interface WSet { attempts: string[]; setPerAttempt: Record<string, number>; rows: Row[] }
export const weightageOf = (subject: string): WSet | undefined => (weightage as unknown as Record<string, WSet>)[subject];

// One subject's chapter-wise weightage: marks per attempt, total, share, compulsory vs choice. Prints on one A4 page.
export default function WeightageTable({ subject }: { subject: string }) {
  const w = weightageOf(subject);
  if (!w) return null;
  const sum = (f: (r: Row) => number) => w.rows.reduce((n, r) => n + f(r), 0);
  return (
    <div className="wt-scroll">
      <table className="wt-t">
        <thead><tr>
          <th>#</th><th className="wt-unit">{subject === 'fr' ? 'Ind AS / SM unit' : 'SM chapter'}</th>
          {w.attempts.map(a => <th key={a}>{a}</th>)}
          <th>Total</th><th>% of marks set</th><th>Compulsory</th><th>Choice</th><th>Seen in</th>
        </tr></thead>
        <tbody>
          {w.rows.map((r, i) => (
            <tr key={r.unit}>
              <td>{i + 1}</td><td className="wt-unit">{r.unit}</td>
              {w.attempts.map(a => <td key={a}>{r.by[a] || '–'}</td>)}
              <td><strong>{r.total}</strong></td><td>{r.pct}%</td><td>{r.comp || '–'}</td><td>{r.choice || '–'}</td><td>{r.n} of 3</td>
            </tr>
          ))}
        </tbody>
        <tfoot><tr>
          <td /><td className="wt-unit">Total marks set</td>
          {w.attempts.map(a => <td key={a}>{w.setPerAttempt[a]}</td>)}
          <td>{sum(r => r.total)}</td><td>100%</td><td>{sum(r => r.comp)}</td><td>{sum(r => r.choice)}</td><td />
        </tr></tfoot>
      </table>
    </div>
  );
}

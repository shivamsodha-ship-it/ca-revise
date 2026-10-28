import Link from 'next/link';
import { notFound } from 'next/navigation';
import PrintBar from '@/components/PrintBar';
import WeightageTable from '@/components/WeightageTable';
import { SUBJECTS, subjectOf } from '@/lib/registry';
import weightage from '../../../data/lastday/weightage.json';

interface Item { a: string; q: string; m: number; c: string; t: string; k: boolean }
interface Row { unit: string; by: Record<string, number>; total: number; pct: number; comp: number; choice: number; n: number; items: Item[] }
interface Set { attempts: string[]; setPerAttempt: Record<string, number>; rows: Row[] }
const W = weightage as unknown as Record<string, Set>;

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.map(s => ({ subject: s.id }));
}
export async function generateMetadata({ params }: { params: { subject: string } }) {
  return { title: `${subjectOf(params.subject)?.label ?? ''} chapter-wise weightage · CA Revise` };
}

export default function Weightage({ params }: { params: { subject: string } }) {
  const s = subjectOf(params.subject);
  const w = W[params.subject];
  if (!s || !w) notFound();
  return (
    <>
      <header className="topbar noprint"><div className="topbar-in">
        <Link href="/" className="brand"><span className="seal">CA</span><span className="brand-t">CA Revise</span></Link>
        <span className="crumb-sep" aria-hidden="true">/</span><Link href={`/${s.id}`} className="crumb">{s.label}</Link>
        <span className="crumb-sep" aria-hidden="true">/</span><span className="chapter-name">Weightage</span>
      </div></header>
      <main className="page rd rd-wide wt" data-subj={s.id}>
        <header className="vhead">
          <p className="eyebrow">{s.long}</p>
          <h1 className="vh">{s.label}: chapter-wise weightage, last three attempts</h1>
          <p className="muted">Sep 2025, Jan 2026 and May 2026, from ICAI&apos;s question papers. Marks are as printed. Each paper sets 118 marks counting both alternatives of an EITHER/OR question (114 otherwise) and you attempt 100: Part I (30) and Q1 are compulsory, and you answer four of Q2 to Q6. Compulsory marks are always attempted; choice marks can be skipped. Chapter mapping is the app&apos;s analysis of ICAI&apos;s papers and answers{s.id === 'fr' ? '; FR is grouped by Ind AS standard with its study-material chapter' : ''}.</p>
          <PrintBar label="Print weightage table" />
          <p className="noprint"><Link className="btn" href={`/${s.id}/analysis`}>Full analysis →</Link> <Link className="btn" href={`/${s.id}/write-plan`}>Writing plan →</Link></p>
        </header>

        <WeightageTable subject={s.id} />

        <h2 className="pk-h wt-break">What each chapter was tested on</h2>
        <p className="muted pk-note">Every question from the three papers, under its chapter: attempt, question, marks and the concept. &ldquo;C&rdquo; marks a compulsory question (Part I or Q1).</p>
        {w.rows.map((r, i) => (
          <section key={r.unit} className="wt-ch">
            <h3 className="wt-h">{i + 1}. {r.unit} <span className="muted">· {r.total} marks · {r.pct}% · seen in {r.n} of 3</span></h3>
            <table className="wt-t wt-d">
              <thead><tr><th>Attempt</th><th>Q</th><th>Marks</th><th>Concept tested</th></tr></thead>
              <tbody>
                {r.items.map((it, j) => (
                  <tr key={j}><td>{it.a}</td><td>{it.q}{it.k ? ' C' : ''}</td><td>{it.m}</td><td>{it.c}</td></tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </main>
    </>
  );
}

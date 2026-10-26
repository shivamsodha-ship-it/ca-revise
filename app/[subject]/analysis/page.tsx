import Link from 'next/link';
import { notFound } from 'next/navigation';
import Md from '@/components/Md';
import { SUBJECTS, subjectOf } from '@/lib/registry';
import { analysisOf } from '@/lib/writePlan';

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.map(s => ({ subject: s.id }));
}
export async function generateMetadata({ params }: { params: { subject: string } }) {
  return { title: `${subjectOf(params.subject)?.label ?? ''} last three attempts · CA Revise` };
}

export default function Analysis({ params }: { params: { subject: string } }) {
  const s = subjectOf(params.subject);
  const a = analysisOf(params.subject);
  if (!s || !a) notFound();
  return (
    <>
      <header className="topbar"><div className="topbar-in">
        <Link href="/" className="brand"><span className="seal">CA</span><span className="brand-t">CA Revise</span></Link>
        <span className="crumb-sep" aria-hidden="true">/</span><Link href={`/${s.id}`} className="crumb">{s.label}</Link>
        <span className="crumb-sep" aria-hidden="true">/</span><span className="chapter-name">Last three attempts</span>
      </div></header>
      <main className="page" data-subj={s.id}>
        <header className="vhead">
          <p className="eyebrow">{s.long}</p>
          <h1 className="vh">Last three attempts: topics and weightage</h1>
          <p className="muted">Marks and question labels are as printed by ICAI; chapter mapping, concept names and the paragraphs are the app&apos;s analysis of ICAI&apos;s papers and answers. A paper sets 114 marks (30 MCQ, compulsory Q1, five choice questions); you attempt 100.</p>
          <p><Link className="btn primary" href={`/${s.id}/weightage`}>Printable weightage table →</Link> <Link className="btn" href="/write-plan">Writing plan →</Link></p>
        </header>
        <Md text={a.analysis} />
      </main>
    </>
  );
}

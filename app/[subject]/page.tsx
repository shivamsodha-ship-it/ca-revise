import Link from 'next/link';
import { notFound } from 'next/navigation';
import ChapterList from '@/components/ChapterList';
import { SUBJECTS, subjectOf } from '@/lib/registry';

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.map(s => ({ subject: s.id }));
}

export default function SubjectPage({ params }: { params: { subject: string } }) {
  const s = subjectOf(params.subject);
  if (!s) notFound();
  return (
    <>
      <header className="topbar"><div className="topbar-in">
        <Link href="/" className="brand"><span className="seal">CA</span><span className="brand-t">CA Revise</span></Link>
        <span className="crumb-sep" aria-hidden="true">/</span>
        <span className="chapter-name">{s.label}</span>
      </div></header>
      <main className="page"><h1 className="sr">{s.label}: {s.long}</h1><p style={{ margin: '0 0 12px' }}><Link className="btn" href={`/${s.id}/formulas`}>Formula bank →</Link><Link className="btn" href={`/${s.id}/last-day`} style={{ marginLeft: 8 }}>Last-day revision →</Link></p><ChapterList only={s.id} /></main>
    </>
  );
}

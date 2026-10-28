import Link from 'next/link';
import { notFound } from 'next/navigation';
import ChapterList from '@/components/ChapterList';
import AccountChip from '@/components/AccountChip';
import { SUBJECTS, subjectOf } from '@/lib/registry';
import ThemeToggle from '@/components/ThemeToggle';

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
        <AccountChip />
        <ThemeToggle />
      </div></header>
      <main className="page"><h1 className="sr">{s.label}: {s.long}</h1><p style={{ margin: '0 0 12px' }}><Link className="btn" href={`/${s.id}/formulas`}>Formula bank →</Link><Link className="btn" href={`/${s.id}/last-day`} style={{ marginLeft: 8 }}>Last-day revision →</Link><Link className="btn" href={`/${s.id}/must-do`} style={{ marginLeft: 8 }}>Must-do packs →</Link><Link className="btn" href={`/${s.id}/updates`} style={{ marginLeft: 8 }}>What changed for Nov 2026 →</Link><Link className="btn" href={`/${s.id}/weightage`} style={{ marginLeft: 8 }}>Weightage table →</Link><Link className="btn" href={`/${s.id}/analysis`} style={{ marginLeft: 8 }}>Last 3 attempts →</Link><Link className="btn" href={`/${s.id}/write-plan`} style={{ marginLeft: 8 }}>Writing plan →</Link></p><ChapterList only={s.id} /></main>
    </>
  );
}

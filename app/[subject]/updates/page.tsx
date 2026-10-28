import Link from 'next/link';
import { notFound } from 'next/navigation';
import PackText from '@/components/PackText';
import PrintBar from '@/components/PrintBar';
import { SUBJECTS, subjectOf } from '@/lib/registry';
import { updatesOf } from '@/lib/updates';

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.map(s => ({ subject: s.id }));
}
export async function generateMetadata({ params }: { params: { subject: string } }) {
  return { title: `${subjectOf(params.subject)?.label ?? ''}: what changed for Nov 2026 · CA Revise` };
}

export default function Updates({ params }: { params: { subject: string } }) {
  const s = subjectOf(params.subject);
  const u = updatesOf(params.subject);
  if (!s || !u) notFound();
  return (
    <>
      <header className="topbar"><div className="topbar-in">
        <Link href="/" className="brand"><span className="seal">CA</span><span className="brand-t">CA Revise</span></Link>
        <span className="crumb-sep" aria-hidden="true">/</span><Link href={`/${s.id}`} className="crumb">{s.label}</Link>
        <span className="crumb-sep" aria-hidden="true">/</span><span className="chapter-name">What changed</span>
      </div></header>
      <main className="page rd" data-subj={s.id}>
        <header className="vhead">
          <p className="eyebrow">{s.long}</p>
          <h1 className="vh">{s.label}: what changed for Nov 2026</h1>
          <p className="muted">ICAI&apos;s own text, copied from the Nov 2026 RTP without rewording. Source: {u.source}. <a href={u.url}>Open the RTP on ICAI&apos;s site</a>. Where an amendment changes a standard or a Schedule, ICAI&apos;s study material for that chapter has the older text: use this page for the current rule.</p>
        </header>
        <PrintBar label="Print this page" />
        {u.text
          ? <PackText text={u.text} />
          : <p className="card pk-empty">ICAI&apos;s Nov 2026 {s.label} RTP has no amendments or academic-update section. Nothing to add for this paper.</p>}
      </main>
    </>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import ChapterList from '@/components/ChapterList';
import type { Subject } from '@/lib/types';

export default function SubjectPage({ params }: { params: { subject: string } }) {
  if (!['aaa', 'fr', 'afm'].includes(params.subject)) notFound();
  return (
    <>
      <header className="bar"><div className="wrap"><Link href="/" className="crumb">‹ All subjects</Link><Link href="/" className="brand"><span className="seal">CA</span><span>CA Revise</span></Link></div></header>
      <main className="wrap"><ChapterList only={params.subject as Subject} /></main>
    </>
  );
}

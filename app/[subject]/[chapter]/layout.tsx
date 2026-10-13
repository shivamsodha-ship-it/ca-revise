import { notFound } from 'next/navigation';
import ChapterShell from '@/components/ChapterShell';
import { findChapter, listChapters, subjectOf } from '@/lib/registry';

export const dynamicParams = false;
export function generateStaticParams() {
  return listChapters().map(r => ({ subject: r.subject, chapter: r.id }));
}

// Chapter data is loaded on the server, so pages render with content instead of a loading screen.
export default async function ChapterLayout({ params, children }: { params: { subject: string; chapter: string }; children: React.ReactNode }) {
  const row = findChapter(params.chapter);
  const subj = subjectOf(params.subject);
  if (!row || !subj || row.subject !== subj.id) notFound();
  const [ch, cb, learn] = await Promise.all([row.loader(), row.casebook ? row.casebook() : null, row.learn ? row.learn() : null]);
  return <ChapterShell subject={subj.id} subjectLabel={subj.label} chapterId={row.id} ch={ch} cb={cb} learn={learn}>{children}</ChapterShell>;
}

export async function generateMetadata({ params }: { params: { chapter: string } }) {
  const row = findChapter(params.chapter);
  return { title: row ? `Ch ${row.number} ${row.title} · CA Revise` : 'CA Revise' };
}

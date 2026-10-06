import Link from 'next/link';
import { notFound } from 'next/navigation';
import LastDayPlan, { type PlanChapter } from '@/components/LastDayPlan';
import { SUBJECTS, listChapters, subjectOf } from '@/lib/registry';
import { stripTags } from '@/lib/casebook';
import { formulaCards } from '@/lib/formulaCards';

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.map(s => ({ subject: s.id }));
}
export async function generateMetadata({ params }: { params: { subject: string } }) {
  return { title: `${subjectOf(params.subject)?.label ?? ''} last-day revision · CA Revise` };
}

// The whole subject, chapter by chapter, for a timed final revision.
export default async function LastDay({ params }: { params: { subject: string } }) {
  const s = subjectOf(params.subject);
  if (!s) notFound();
  const chapters: PlanChapter[] = [];
  for (const r of listChapters(s.id)) {
    const [ch, cb] = await Promise.all([r.loader(), r.casebook ? r.casebook() : null]);
    const kind = new Map((cb?.Q ?? []).map(q => [q.id, q.k]));
    chapters.push({
      id: r.id, number: r.number, title: r.title, weight: ch.weight ?? 0,
      cards: ch.sections.reduce((n, x) => n + x.cards.length, 0) + formulaCards(cb).length,
      hasCasebook: !!cb, hasFormulas: !!cb?.formulas?.length, hasMcqs: !!cb?.Q.some(q => q.k === 'mcq'),
      provisions: (cb?.P ?? []).map(p => ({ id: p.id, label: p.label, title: stripTags(p.title), qs: p.qs.map(id => ({ id, k: kind.get(id) ?? '' })) })),
    });
  }
  chapters.sort((a, b) => b.weight - a.weight || a.number - b.number);
  return (
    <>
      <header className="topbar"><div className="topbar-in">
        <Link href="/" className="brand"><span className="seal">CA</span><span className="brand-t">CA Revise</span></Link>
        <span className="crumb-sep" aria-hidden="true">/</span>
        <Link href={`/${s.id}`} className="crumb">{s.label}</Link>
        <span className="crumb-sep" aria-hidden="true">/</span>
        <span className="chapter-name">Last-day revision</span>
      </div></header>
      <main className="page">
        <header className="vhead">
          <p className="eyebrow">{s.long}</p>
          <h1 className="vh">Last-day revision</h1>
          <p className="muted">A timed run through the whole subject, weighted by ICAI mark weight, with the concepts you miss most at the top.</p>
        </header>
        <LastDayPlan subject={s.id} subjectLabel={s.label} chapters={chapters} />
      </main>
    </>
  );
}

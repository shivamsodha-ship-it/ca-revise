import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SUBJECTS, subjectOf } from '@/lib/registry';
import { TIERS, packsOf } from '@/lib/lastday';
import ThemeToggle from '@/components/ThemeToggle';

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.map(s => ({ subject: s.id }));
}
export async function generateMetadata({ params }: { params: { subject: string } }) {
  return { title: `${subjectOf(params.subject)?.label ?? ''} must-do packs · CA Revise` };
}

// Last-day packs for the chapters that are not built yet: ICAI's questions and ICAI's study material, ranked by exam weight.
export default function MustDo({ params }: { params: { subject: string } }) {
  const s = subjectOf(params.subject);
  const set = packsOf(params.subject);
  if (!s || !set) notFound();
  return (
    <>
      <header className="topbar"><div className="topbar-in">
        <Link href="/" className="brand"><span className="seal">CA</span><span className="brand-t">CA Revise</span></Link>
        <span className="crumb-sep" aria-hidden="true">/</span>
        <Link href={`/${s.id}`} className="crumb">{s.label}</Link>
        <span className="crumb-sep" aria-hidden="true">/</span>
        <span className="chapter-name">Must-do packs</span>
        <ThemeToggle />
      </div></header>
      <main className="page rd" data-subj={s.id}>
        <header className="vhead">
          <p className="eyebrow">{s.long}</p>
          <h1 className="vh">Must-do packs</h1>
          <p className="muted">For chapters that are not built in the app yet. Each pack has two to three ICAI questions (the first touches the most of the chapter), ICAI&apos;s own answers, and the study-material text for the sections ICAI asks most. Nothing in a pack is written by the app.</p>
        </header>
        <p className="pk-basis muted">{set.basis}</p>
        <p className="pk-warn">Read <Link href={`/${s.id}/updates`}>what changed for Nov 2026</Link> alongside these packs: ICAI&apos;s amendments are newer than the study-material text.</p>
        {TIERS.map(t => {
          const rows = set.topics.filter(p => p.tier === t.id);
          if (!rows.length) return null;
          return (
            <section key={t.id} className="pk-tier">
              <h2 className="pk-h">{t.label}<span className="muted"> · {t.note}</span></h2>
              <ol className="pk-list">
                {rows.map(p => (
                  <li key={p.id}>
                    <Link href={`/${s.id}/must-do/${p.id}`} className="pk-row">
                      <span className="pk-title">{p.title}</span>
                      <span className="pk-meta muted">{p.questions.length} questions · {p.sections.length} SM sections{p.rank.pyq !== undefined ? ` · ICAI score ${p.rank.score}` : ` · ${p.rank.score} points`}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </main>
    </>
  );
}

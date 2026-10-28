import Link from 'next/link';
import { notFound } from 'next/navigation';
import TodayRedirect from '@/components/TodayRedirect';
import { SUBJECTS, subjectOf } from '@/lib/registry';
import { dateLabel, dayOf, subjectDates } from '@/lib/writePlan';
import { EXAMS } from '@/lib/plan';

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.map(s => ({ subject: s.id }));
}
export async function generateMetadata({ params }: { params: { subject: string } }) {
  return { title: `${subjectOf(params.subject)?.label ?? ''} writing plan · CA Revise` };
}

export default function SubjectPlan({ params }: { params: { subject: string } }) {
  const s = subjectOf(params.subject);
  const dates = subjectDates(params.subject);
  if (!s || !dates.length) notFound();
  const exam = EXAMS.find(e => e.subject === s.id);
  return (
    <>
      <header className="topbar"><div className="topbar-in">
        <Link href="/" className="brand"><span className="seal">CA</span><span className="brand-t">CA Revise</span></Link>
        <span className="crumb-sep" aria-hidden="true">/</span><Link href={`/${s.id}`} className="crumb">{s.label}</Link>
        <span className="crumb-sep" aria-hidden="true">/</span><span className="chapter-name">Writing plan</span>
      </div></header>
      <main className="page rd" data-subj={s.id}>
        <header className="vhead">
          <p className="eyebrow">{s.long}</p>
          <h1 className="vh">{s.label} writing practice plan</h1>
          <p className="muted">{dateLabel(dates[0])} to {dateLabel(dates[dates.length - 1])}, the day before the {s.label} paper{exam ? ` (${dateLabel(exam.date)})` : ''}. Every day: real ICAI questions to copy, write from memory, or write against the clock, with ICAI&apos;s answer to check against. Yardstick: 1.8 minutes a mark. The order and minutes are the app&apos;s plan; the questions and answers are ICAI&apos;s.</p>
          <p><Link className="btn" href={`/${s.id}/weightage`}>Weightage table →</Link></p>
        </header>
        <TodayRedirect dates={dates} base={`/${s.id}/write-plan`} />
        <ol className="pk-list">
          {dates.map((d, i) => {
            const items = dayOf(s.id, d)!.items;
            return (
              <li key={d}><Link href={`/${s.id}/write-plan/${d}`} className="pk-row">
                <span className="pk-title">Day {i + 1} · {dateLabel(d)}</span>
                <span className="pk-meta muted">{items.reduce((n, x) => n + x.minutes, 0)} min · {items.length} exercises</span>
              </Link></li>
            );
          })}
        </ol>
      </main>
    </>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import PackText from '@/components/PackText';
import PlanTick from '@/components/PlanTick';
import { SUBJECTS } from '@/lib/registry';
import { MODE_LABEL, SUBJECT_ORDER, dateLabel, dayOf, planDates } from '@/lib/writePlan';

export const dynamicParams = false;
export function generateStaticParams() {
  return planDates().map(date => ({ date }));
}
export async function generateMetadata({ params }: { params: { date: string } }) {
  return { title: `Writing plan ${params.date} · CA Revise` };
}

export default function PlanDay({ params }: { params: { date: string } }) {
  const dates = planDates();
  if (!dates.includes(params.date)) notFound();
  const i = dates.indexOf(params.date);
  return (
    <>
      <header className="topbar"><div className="topbar-in">
        <Link href="/" className="brand"><span className="seal">CA</span><span className="brand-t">CA Revise</span></Link>
        <span className="crumb-sep" aria-hidden="true">/</span><Link href="/write-plan" className="crumb">Writing plan</Link>
      </div></header>
      <main className="page">
        <header className="vhead">
          <p className="eyebrow">Day {i + 1} of {dates.length}</p>
          <h1 className="vh">{dateLabel(params.date)}</h1>
          <p className="muted pk-note">Write on paper. Do the exercise in the mode shown, stop at the minutes, then open ICAI&apos;s answer and mark yourself.</p>
        </header>
        {SUBJECT_ORDER.map(s => {
          const day = dayOf(s, params.date);
          if (!day) return null;
          const subj = SUBJECTS.find(x => x.id === s)!;
          return (
            <section key={s} className="pk-sec" data-subj={s}>
              <h2 className="pk-h">{subj.label} <span className="muted">· {day.items.reduce((n, x) => n + x.minutes, 0)} min</span></h2>
              {day.items.map((it, j) => (
                <article key={j} className="card pk-q">
                  <div className="pk-qh">
                    <span className="pk-chip pk-chip-on">{MODE_LABEL[it.mode] ?? it.mode}</span>
                    <strong>{it.source}</strong>
                    <span className="muted">{it.minutes} min{it.marks ? ` · ${it.marks} marks` : ''}</span>
                  </div>
                  <p className="pk-cov">{it.concept}</p>
                  {it.q && <PackText text={it.q.prompt} />}
                  {it.q?.ans && <details className="pk-ans"><summary>ICAI&apos;s answer</summary><PackText text={it.q.ans} /></details>}
                  {it.note && <p className="muted pk-cov">{it.note}</p>}
                  <PlanTick id={`${s}:${params.date}:${j}`} />
                </article>
              ))}
            </section>
          );
        })}
        <p className="pk-foot muted">
          {i > 0 && <Link href={`/write-plan/${dates[i - 1]}`}>← {dateLabel(dates[i - 1])}</Link>}
          {i > 0 && i < dates.length - 1 && '  ·  '}
          {i < dates.length - 1 && <Link href={`/write-plan/${dates[i + 1]}`}>{dateLabel(dates[i + 1])} →</Link>}
        </p>
      </main>
    </>
  );
}

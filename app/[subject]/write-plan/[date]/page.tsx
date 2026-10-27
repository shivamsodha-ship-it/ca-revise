import Link from 'next/link';
import { notFound } from 'next/navigation';
import PackText from '@/components/PackText';
import PrintBar from '@/components/PrintBar';
import PlanTick from '@/components/PlanTick';
import { SUBJECTS, subjectOf } from '@/lib/registry';
import { MODE_LABEL, dateLabel, dayOf, subjectDates } from '@/lib/writePlan';

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.flatMap(s => subjectDates(s.id).map(date => ({ subject: s.id, date })));
}
export async function generateMetadata({ params }: { params: { subject: string; date: string } }) {
  return { title: `${subjectOf(params.subject)?.label ?? ''} writing plan ${params.date} · CA Revise` };
}

export default function PlanDay({ params }: { params: { subject: string; date: string } }) {
  const s = subjectOf(params.subject);
  const dates = subjectDates(params.subject);
  const day = dayOf(params.subject, params.date);
  if (!s || !day) notFound();
  const i = dates.indexOf(params.date);
  const base = `/${s.id}/write-plan`;
  return (
    <>
      <header className="topbar"><div className="topbar-in">
        <Link href="/" className="brand"><span className="seal">CA</span><span className="brand-t">CA Revise</span></Link>
        <span className="crumb-sep" aria-hidden="true">/</span><Link href={`/${s.id}`} className="crumb">{s.label}</Link>
        <span className="crumb-sep" aria-hidden="true">/</span><Link href={base} className="crumb">Writing plan</Link>
      </div></header>
      <main className="page rd" data-subj={s.id}>
        <header className="vhead">
          <p className="eyebrow">{s.label} · Day {i + 1} of {dates.length}</p>
          <h1 className="vh">{dateLabel(params.date)}</h1>
          <p className="muted pk-note">{day.items.reduce((n, x) => n + x.minutes, 0)} minutes. Write on paper in the mode shown, stop at the minutes, then open ICAI&apos;s answer and mark yourself.</p>
        </header>
        <PrintBar answers />
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
            <div className="wp-lines" style={{ ['--wl' as string]: `${it.marks ? Math.min(it.marks * 24, 220) : 60}mm` }} aria-hidden="true" />
            <PlanTick id={`${s.id}:${params.date}:${j}`} />
          </article>
        ))}
        <p className="pk-foot muted">
          {i > 0 && <Link href={`${base}/${dates[i - 1]}`}>← {dateLabel(dates[i - 1])}</Link>}
          {i > 0 && i < dates.length - 1 && '  ·  '}
          {i < dates.length - 1 && <Link href={`${base}/${dates[i + 1]}`}>{dateLabel(dates[i + 1])} →</Link>}
        </p>
      </main>
    </>
  );
}

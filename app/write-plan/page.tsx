import Link from 'next/link';
import TodayRedirect from '@/components/TodayRedirect';
import { SUBJECTS } from '@/lib/registry';
import { SUBJECT_ORDER, dateLabel, dayOf, planDates } from '@/lib/writePlan';
import { EXAMS } from '@/lib/plan';

export const metadata = { title: 'Writing practice plan · CA Revise' };

export default function WritePlanIndex() {
  const dates = planDates();
  return (
    <>
      <header className="topbar"><div className="topbar-in">
        <Link href="/" className="brand"><span className="seal">CA</span><span className="brand-t">CA Revise</span></Link>
        <span className="crumb-sep" aria-hidden="true">/</span><span className="chapter-name">Writing plan</span>
      </div></header>
      <main className="page">
        <header className="vhead">
          <h1 className="vh">Writing practice plan</h1>
          <p className="muted">Every day until the day before each paper: real ICAI questions to copy, write from memory, or write against the clock, with ICAI&apos;s answer to check against. Time yardstick: 1.8 minutes a mark (ICAI sets 100 marks for 3 hours). The order and minutes are the app&apos;s plan; the questions and answers are ICAI&apos;s.</p>
        </header>
        <TodayRedirect dates={dates} />
        <ol className="pk-list">
          {dates.map(d => {
            const parts = SUBJECT_ORDER.map(s => ({ s, day: dayOf(s, d) })).filter(x => x.day);
            const exam = EXAMS.find(e => e.date === d);
            return (
              <li key={d}>
                <Link href={`/write-plan/${d}`} className="pk-row">
                  <span className="pk-title">{dateLabel(d)}{exam ? ` · ${exam.label} exam` : ''}</span>
                  <span className="pk-meta muted">{parts.map(({ s, day }) => `${SUBJECTS.find(x => x.id === s)?.label} ${day!.items.reduce((n, i) => n + i.minutes, 0)} min`).join(' · ')}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </main>
    </>
  );
}

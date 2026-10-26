import Link from 'next/link';
import { SUBJECTS } from '@/lib/registry';
import { dateLabel, subjectDates } from '@/lib/writePlan';
import { EXAMS } from '@/lib/plan';

export const metadata = { title: 'Writing practice plan · CA Revise' };

// Each subject has its own plan; this page only sends you to one of them.
export default function WritePlanChooser() {
  return (
    <>
      <header className="topbar"><div className="topbar-in">
        <Link href="/" className="brand"><span className="seal">CA</span><span className="brand-t">CA Revise</span></Link>
        <span className="crumb-sep" aria-hidden="true">/</span><span className="chapter-name">Writing plan</span>
      </div></header>
      <main className="page">
        <header className="vhead">
          <h1 className="vh">Writing practice plan</h1>
          <p className="muted">One plan per subject, from today to the day before that paper.</p>
        </header>
        <ol className="pk-list">
          {SUBJECTS.map(s => {
            const d = subjectDates(s.id); const exam = EXAMS.find(e => e.subject === s.id);
            return (
              <li key={s.id}><Link href={`/${s.id}/write-plan`} className="pk-row">
                <span className="pk-title">{s.label}: {s.long}</span>
                <span className="pk-meta muted">{d.length ? `${dateLabel(d[0])} to ${dateLabel(d[d.length - 1])}` : ''}{exam ? ` · exam ${dateLabel(exam.date)}` : ''}</span>
              </Link></li>
            );
          })}
        </ol>
      </main>
    </>
  );
}

import Link from 'next/link';
import ChapterList from '@/components/ChapterList';
import AccountChip from '@/components/AccountChip';
import Today from '@/components/Today';
import { SUBJECTS, seedChapters } from '@/lib/registry';

export default function Home() {
  return (
    <>
      <header className="topbar"><div className="topbar-in"><Link href="/" className="brand"><span className="seal">CA</span><span>CA Revise</span></Link><AccountChip /></div></header>
      <main className="page">
        <section className="intro">
          <p className="eyebrow">CA Final, Group 1 · November 2026</p>
          <h1>Clear the <em>pass line</em>.</h1>
          <p>50+ in FR, AFM and AAA, one focused block at a time. You don&apos;t need every chapter; you need the right ones, done well.</p>
        </section>
        <Today seed={seedChapters()} />
        <section className="ld" aria-labelledby="ld-h">
          <h2 id="ld-h" className="ld-h">Last-day package</h2>
          <p className="muted ld-p">For the chapters not built yet: ICAI&apos;s most-asked questions with ICAI&apos;s answers, what the last three papers tested, and a daily handwriting plan.</p>
          <div className="ld-grid">
            {SUBJECTS.map(s => (
              <div key={s.id} className="card ld-card" data-subj={s.id}>
                <strong>{s.label}</strong><span className="muted ld-long">{s.long}</span>
                <Link className="ld-link" href={`/${s.id}/weightage`}>Chapter-wise weightage (printable)</Link>
                <Link className="ld-link" href={`/${s.id}/must-do`}>Must-do packs</Link>
                <Link className="ld-link" href={`/${s.id}/write-plan`}>Daily writing plan</Link>
                <Link className="ld-link" href={`/${s.id}/analysis`}>Last 3 attempts: full analysis</Link>
                <Link className="ld-link" href={`/${s.id}/last-day`}>Timed last-day plan</Link>
                <Link className="ld-link" href={`/${s.id}/formulas`}>Formula bank</Link>
              </div>
            ))}
          </div>
        </section>
        <p className="home-links">
          <Link className="btn" href="/board">Syllabus board →</Link>
          <Link className="btn" href="/weak">Weak areas →</Link>
          <Link className="btn" href="/account">Account & sync →</Link>
        </p>
        <ChapterList />
      </main>
    </>
  );
}

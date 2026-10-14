import Link from 'next/link';
import ChapterList from '@/components/ChapterList';
import AccountChip from '@/components/AccountChip';
import Today from '@/components/Today';
import { seedChapters } from '@/lib/registry';

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

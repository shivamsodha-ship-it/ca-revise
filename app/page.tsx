import Link from 'next/link';
import ChapterList from '@/components/ChapterList';

export default function Home() {
  return (
    <>
      <header className="topbar"><div className="topbar-in"><Link href="/" className="brand"><span className="seal">CA</span><span>CA Revise</span></Link></div></header>
      <main className="page">
        <section className="intro">
          <p className="eyebrow">CA Final, Group 1 · November 2026</p>
          <h1>Revise every chapter, then answer the question.</h1>
          <p>Case drills, concept hunts, MCQs and a law library for each chapter, with notes and flip cards alongside.</p>
          <p><Link className="btn" href="/weak">Weak areas →</Link> <Link className="btn" href="/account" style={{ marginLeft: 8 }}>Account & sync →</Link></p>
        </section>
        <ChapterList />
      </main>
    </>
  );
}

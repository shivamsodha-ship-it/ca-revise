import Link from 'next/link';
import ChapterList from '@/components/ChapterList';

export default function Home() {
  return (
    <>
      <header className="topbar"><div className="topbar-in"><Link href="/" className="brand"><span className="seal">CA</span><span>CA Revise</span></Link></div></header>
      <main className="page">
        <section className="intro">
          <p className="eyebrow">CA Final · Group 1 · Nov 2026</p>
          <h1>Rule on the case. <em>Then</em> read the law.</h1>
          <p>Case drills, provision hunts, MCQ sprints and a law library for each chapter, with handwritten notes and flip cards alongside.</p>
          <p><Link className="btn" href="/weak">Weak areas →</Link></p>
        </section>
        <ChapterList />
      </main>
    </>
  );
}

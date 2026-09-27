import ChapterList from '@/components/ChapterList';

export default function Home() {
  return (
    <>
      <header className="bar"><div className="wrap"><span className="brand"><span className="seal">CA</span><span>CA Revise</span></span></div></header>
      <main className="wrap">
        <section className="card hero-l">
          <p className="eyebrow">CA Final · Group 1 · Nov 2026</p>
          <h1>Rule on the case. <em>Then</em> read the law.</h1>
          <p>Case drills, clause hunts, MCQ sprints and a law library for every chapter, with handwritten notes and flip cards alongside.</p>
        </section>
        <ChapterList />
      </main>
    </>
  );
}

'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { getProgress } from '@/lib/storage';
import { isDue } from '@/lib/spacedRep';

export default function HomeView() {
  const { cb, ch, base, S, provStats } = useChapter();
  const cards = ch.sections.flatMap(s => s.cards);
  const [due, setDue] = useState<number | null>(null);
  useEffect(() => {
    const prog = getProgress(ch.id);
    setDue(cards.filter(c => isDue(prog[c.id])).length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ch.id]);

  const extra = (
    <div className="modes extra">
      <Link href={`${base}/notes`} className="mode lite hand-mode"><h3>Notes</h3><p>Section-by-section handwritten notes. Tap a point to expand it.</p><span className="go">{ch.sections.length} sections →</span></Link>
      <Link href={`${base}/flip`} className="mode lite"><h3>Flip Cards</h3><p>Active recall on a spaced-repetition schedule.</p><span className="go">{due ?? '–'} due · {cards.length} cards →</span></Link>
      <Link href={`${base}/practice`} className="mode lite"><h3>Practice</h3><p>Type a full answer, then mark it against the model answer.</p><span className="go">{ch.practice.length} questions →</span></Link>
    </div>
  );

  if (!cb) {
    return (
      <>
        <section className="card hero-l"><p className="eyebrow">{ch.subject.toUpperCase()} · Chapter {ch.number}</p><h1>{ch.title}</h1><p>{ch.summary}</p></section>
        <div style={{ marginTop: 20 }}>{extra}</div>
      </>
    );
  }

  const ids = cb.Q.map(q => q.id);
  const att = ids.filter(i => i in S.r), cor = att.filter(i => S.r[i]);
  const pct = Math.round(att.length / ids.length * 100), acc = att.length ? Math.round(cor.length / att.length * 100) : 0;
  const Cc = 2 * Math.PI * 62, off = Cc * (1 - att.length / ids.length);
  const weak = cb.P.map(p => { const s = provStats(p.id); return { p, s, r: s.a ? s.c / s.a : 1 }; })
    .filter(x => x.s.a && x.r < .6).sort((a, b) => a.r - b.r).slice(0, 12);
  const nMcq = cb.Q.filter(q => q.k === 'mcq').length;
  const nCase = cb.Q.length - nMcq;

  return (
    <>
      <section className="hero">
        <div className="card hero-l">
          <p className="eyebrow">CA Final · AAA · Chapter {ch.number} · Nov 2026</p>
          <h1>Rule on the case. <em>Then</em> read the law.</h1>
          <p>{nCase} disciplinary cases from your study material, the Nov 2026 RTP and past-paper patterns. Call the verdict, get stamped, and see exactly which clause decided it.</p>
          <div className="cta"><Link className="btn pri" href={`${base}/drill`}>Start Case Drill</Link><Link className="btn" href={`${base}/hunt`}>Play Clause Hunt</Link></div>
        </div>
        <div className="card hero-r">
          <svg className="ring" viewBox="0 0 150 150" role="img" aria-label={`${pct}% of questions attempted`}>
            <circle cx="75" cy="75" r="62" fill="none" stroke="var(--card2)" strokeWidth="14" />
            <circle cx="75" cy="75" r="62" fill="none" stroke="var(--blue)" strokeWidth="14" strokeLinecap="round" strokeDasharray={Cc.toFixed(1)} strokeDashoffset={off.toFixed(1)} transform="rotate(-90 75 75)" />
            <text x="75" y="78" textAnchor="middle" fontSize="34">{pct}%</text>
            <text x="75" y="100" textAnchor="middle" fontSize="11" style={{ fontFamily: 'var(--sans)', fontWeight: 600, fill: 'var(--muted)' }}>covered</text>
          </svg>
          <div className="kpis">
            <div className="kpi"><b>{att.length}</b><span>of {ids.length} done</span></div>
            <div className="kpi"><b>{acc}%</b><span>accuracy</span></div>
            <div className="kpi"><b>{S.best}</b><span>best streak</span></div>
          </div>
        </div>
      </section>

      <div className="modes">
        <Link className="mode m1" href={`${base}/drill`}><h3>Case Drill</h3><p>Read the facts, call Guilty or Not guilty, get the exam answer.</p><span className="go">{nCase} cases →</span><span className="big">GUILTY</span></Link>
        <Link className="mode m2" href={`${base}/hunt`}><h3>Clause Hunt</h3><p>10 rounds. Spot which clause the facts trigger.</p><span className="go">Best {S.huntBest}/10 →</span><span className="big">§</span></Link>
        <Link className="mode m3" href={`${base}/mcq`}><h3>MCQ Sprint</h3><p>Quick-fire objective questions with instant feedback.</p><span className="go">{nMcq} MCQs →</span><span className="big">abcd</span></Link>
        <Link className="mode m4" href={`${base}/library`}><h3>Law Library</h3><p>Every clause as a tile. Tap to read the law and its cases.</p><span className="go">{cb.P.length} provisions →</span><span className="big">Sch.</span></Link>
      </div>
      <div style={{ marginTop: 14 }}>{extra}</div>

      <section className="sec">
        <div className="sec-h"><h2>Your weak clauses</h2><span className="muted">Below 60% on attempted questions</span></div>
        {weak.length
          ? <div className="weak">{weak.map(x => <button key={x.p.id} className="chip bad" data-p={x.p.id}>{x.p.label} · {x.s.c}/{x.s.a}</button>)}</div>
          : <p className="muted">Nothing yet. Attempt a few cases and your weak clauses show up here.</p>}
      </section>

      <section className="sec">
        <div className="sec-h"><h2>Exam scope, confirmed by the RTP</h2><button className="chip" data-p="upd2026">Open full note</button></div>
        <div className="rail">{cb.changes.map((c, i) => <div key={i} className="chg"><span className="n">No. {i + 1}</span><span dangerouslySetInnerHTML={{ __html: c }} /></div>)}</div>
      </section>

      <section className="sec">
        <div className="sec-h"><h2>Write it the ICAI way</h2></div>
        <div className="steps">{cb.method.map((m, i) => (
          <div key={i} className="card step"><div className="num">{i + 1}</div><h3>{m[0].replace(/^Step \d — /, '')}</h3><p dangerouslySetInnerHTML={{ __html: m[1] }} /></div>
        ))}</div>
      </section>
    </>
  );
}

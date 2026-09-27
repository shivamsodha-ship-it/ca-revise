'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { cap, plural } from '@/lib/casebook';
import { getProgress } from '@/lib/storage';
import { isDue } from '@/lib/spacedRep';

// "Rule on the case. *Then* read the law." → the starred word is set in the accent colour.
function Tagline({ text }: { text: string }) {
  return <>{text.split(/(\*[^*]+\*)/).map((p, i) => (p.startsWith('*') ? <em key={i}>{p.slice(1, -1)}</em> : p))}</>;
}

export default function HomeView() {
  const { cb, meta, ch, base, S, subjectLabel, provStats } = useChapter();
  const cards = ch.sections.flatMap(s => s.cards);
  const [due, setDue] = useState<number | null>(null);
  useEffect(() => {
    const prog = getProgress(ch.id);
    setDue(cards.filter(c => isDue(prog[c.id])).length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ch.id]);

  const eyebrow = `CA Final · ${subjectLabel} · Chapter ${ch.number}`;
  const revise = (
    <div className="modes lite">
      <Link href={`${base}/notes`} className="mode lite hand-mode"><h3>Notes</h3><p>Section-by-section handwritten notes. Tap a point to expand it.</p><span className="go">{plural(ch.sections.length, 'section')} →</span></Link>
      <Link href={`${base}/flip`} className="mode lite"><h3>Flip cards</h3><p>Active recall on a spaced-repetition schedule.</p><span className="go">{due ?? '–'} due · {cards.length} cards →</span></Link>
      <Link href={`${base}/practice`} className="mode lite"><h3>Written practice</h3><p>Type a full answer, then mark it against the model answer.</p><span className="go">{plural(ch.practice.length, 'question')} →</span></Link>
    </div>
  );

  if (!cb || !meta) {
    return (
      <>
        <section className="card hero-l solo">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{ch.title}</h1>
          <p>{ch.summary}</p>
          {ch.currency && <p className="currency">{ch.currency}</p>}
        </section>
        <section className="sec"><div className="sec-h"><h2>Revise</h2></div>{revise}</section>
      </>
    );
  }

  const ids = cb.Q.map(q => q.id);
  const att = ids.filter(i => i in S.r), cor = att.filter(i => S.r[i]);
  const pct = ids.length ? Math.round(att.length / ids.length * 100) : 0;
  const acc = att.length ? Math.round(cor.length / att.length * 100) : 0;
  const Cc = 2 * Math.PI * 62, off = Cc * (1 - (ids.length ? att.length / ids.length : 0));
  const weak = cb.P.map(p => { const s = provStats(p.id); return { p, s, r: s.a ? s.c / s.a : 1 }; })
    .filter(x => x.s.a && x.r < .6).sort((a, b) => a.r - b.r).slice(0, 12);
  const nMcq = cb.Q.filter(q => q.k === 'mcq').length;
  const nCase = cb.Q.length - nMcq;
  const pn = meta.provisionNoun, cn = meta.caseNoun;
  const intro = meta.intro
    ? meta.intro.replace('{cases}', String(nCase))
    : `${plural(nCase, cn)} to work through. Answer first, then see exactly which ${pn} decided it.`;

  return (
    <>
      <section className="hero">
        <div className="card hero-l">
          <p className="eyebrow">{eyebrow}</p>
          <h1><Tagline text={meta.tagline} /></h1>
          <p>{intro}</p>
          {ch.currency && <p className="currency">{ch.currency}</p>}
          <div className="cta">
            <Link className="btn primary" href={`${base}/drill`}>Start {cn} drill</Link>
            <Link className="btn" href={`${base}/hunt`}>Play {pn} hunt</Link>
          </div>
        </div>
        <div className="card hero-r">
          <svg className="ring" viewBox="0 0 150 150" role="img" aria-label={`${pct}% of questions attempted`}>
            <circle cx="75" cy="75" r="62" fill="none" stroke="var(--card2)" strokeWidth="14" />
            <circle cx="75" cy="75" r="62" fill="none" stroke="var(--blue)" strokeWidth="14" strokeLinecap="round" strokeDasharray={Cc.toFixed(1)} strokeDashoffset={off.toFixed(1)} transform="rotate(-90 75 75)" />
            <text x="75" y="78" textAnchor="middle" fontSize="34">{pct}%</text>
            <text x="75" y="100" textAnchor="middle" fontSize="11" className="ring-sub">covered</text>
          </svg>
          <div className="kpis">
            <div className="kpi"><b>{att.length}</b><span>of {ids.length} done</span></div>
            <div className="kpi"><b>{acc}%</b><span>accuracy</span></div>
            <div className="kpi"><b>{S.best}</b><span>best streak</span></div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="sec-h"><h2>Test yourself</h2></div>
        <div className="modes">
          <Link className="mode m1" href={`${base}/drill`}>
            <h3>{cap(cn)} drill</h3>
            <p>{meta.verdicts.length ? `Read the facts, call ${meta.verdicts.map(v => v.label).slice(0, 2).join(' or ')}, get the exam answer.` : 'Read the question, frame your answer, check the model answer.'}</p>
            <span className="go">{plural(nCase, cn)} →</span>
            <span className="big" aria-hidden="true">{(meta.verdicts[0]?.label ?? '?').toUpperCase()}</span>
          </Link>
          <Link className="mode m2" href={`${base}/hunt`}><h3>{cap(pn)} hunt</h3><p>10 rounds. Spot which {pn} the facts trigger.</p><span className="go">Best {S.huntBest}/10 →</span><span className="big" aria-hidden="true">§</span></Link>
          <Link className="mode m3" href={`${base}/mcq`}><h3>MCQ sprint</h3><p>Quick-fire objective questions with instant feedback.</p><span className="go">{nMcq} MCQs →</span><span className="big" aria-hidden="true">abcd</span></Link>
          <Link className="mode m4" href={`${base}/library`}><h3>Law library</h3><p>Every {pn} as a tile. Tap to read the law and its questions.</p><span className="go">{plural(cb.P.length, pn)} →</span><span className="big" aria-hidden="true">¶</span></Link>
        </div>
      </section>

      <section className="sec"><div className="sec-h"><h2>Revise</h2></div>{revise}</section>

      <section className="sec">
        <div className="sec-h"><h2>Your weak {pn}s</h2><span className="muted">Below 60% on attempted questions</span></div>
        {weak.length
          ? <div className="chips">{weak.map(x => <button key={x.p.id} className="chip no" data-p={x.p.id}>{x.p.label} · {x.s.c}/{x.s.a}</button>)}</div>
          : <p className="muted">Nothing yet. Attempt a few {cn}s and your weak {pn}s show up here.</p>}
      </section>

      {cb.changes.length > 0 && (
        <section className="sec">
          <div className="sec-h"><h2>{meta.scopeTitle}</h2>{meta.scopeNote && cb.P.some(p => p.id === meta.scopeNote) && <button className="chip" data-p={meta.scopeNote}>Open full note</button>}</div>
          <div className="rail">{cb.changes.map((c, i) => <div key={i} className="chg"><span className="n">No. {i + 1}</span><span dangerouslySetInnerHTML={{ __html: c }} /></div>)}</div>
        </section>
      )}

      {cb.method.length > 0 && (
        <section className="sec">
          <div className="sec-h"><h2>{meta.methodTitle}</h2></div>
          <div className="steps">{cb.method.map((m, i) => (
            <div key={i} className="card step"><div className="num">{i + 1}</div><h3>{m[0].replace(/^Step \d+\s*[—–-]\s*/, '')}</h3><p dangerouslySetInnerHTML={{ __html: m[1] }} /></div>
          ))}</div>
        </section>
      )}
    </>
  );
}

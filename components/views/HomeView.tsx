'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { plural } from '@/lib/casebook';
import { getProgress } from '@/lib/storage';
import { isDue } from '@/lib/spacedRep';
import { chapterCards } from '@/lib/formulaCards';

// Chapter taglines are written with *emphasis* markers for the old design; the page now sets them plain.
const plain = (t: string) => t.replace(/\*/g, '');

export default function HomeView() {
  const { cb, meta, ch, base, S, subjectLabel, provStats, learn } = useChapter();
  const cards = useMemo(() => chapterCards(ch, cb), [ch, cb]);
  const [due, setDue] = useState<number | null>(null);
  useEffect(() => {
    const prog = getProgress(ch.id);
    setDue(cards.filter(c => isDue(prog[c.id])).length);
  }, [ch.id, cards]);

  const eyebrow = `${subjectLabel} · Chapter ${ch.number}`;
  const revise = (
    <ul className="rows">
      <li><Link href={`${base}/notes`} className="row"><span className="row-t">Notes</span><span className="row-d">Section by section. Tap a point to open it.</span><span className="row-n">{plural(ch.sections.length, 'section')}</span></Link></li>
      <li><Link href={`${base}/flip`} className="row"><span className="row-t">Flip cards</span><span className="row-d">Recall first, then rate yourself. Spaced repetition.</span><span className="row-n">{due ?? '–'} due of {cards.length}</span></Link></li>
      <li><Link href={`${base}/practice`} className="row"><span className="row-t">Written practice</span><span className="row-d">Write a full answer, then mark it against the model.</span><span className="row-n">{plural(ch.practice.length, 'question')}</span></Link></li>
    </ul>
  );

  if (!cb || !meta) {
    return (
      <>
        <section className="chapter-head">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{ch.title}</h1>
          <p className="lede">{ch.summary}</p>
          {ch.currency && <p className="currency">{ch.currency}</p>}
        </section>
        <section className="sec"><h2 className="sec-title">Revise</h2>{revise}</section>
      </>
    );
  }

  const ids = cb.Q.map(q => q.id);
  const att = ids.filter(i => i in S.r), cor = att.filter(i => S.r[i]);
  const pct = ids.length ? Math.round(att.length / ids.length * 100) : 0;
  const acc = att.length ? Math.round(cor.length / att.length * 100) : 0;
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
      <section className="chapter-head">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{plain(meta.tagline)}</h1>
        <p className="lede">{intro}</p>
        {ch.currency && <p className="currency">{ch.currency}</p>}
        {learn?.levels?.length ? <Link href={`${base}/path`} className="home-path"><b>Start the mastery path</b><span>{learn.levels.length} levels in order, from the big picture to the twisted exam case. Then play the games and the step solver.</span></Link> : null}
        <div className="cta">
          <Link className="btn primary" href={`${base}/drill`}>Start {cn} drill</Link>
          <Link className="btn" href={`${base}/hunt`}>Play {pn} hunt</Link>
        </div>
        <dl className="stats">
          <div><dt>Answered</dt><dd>{att.length} of {ids.length}</dd></div>
          <div><dt>Accuracy</dt><dd>{acc}%</dd></div>
          <div><dt>Best streak</dt><dd>{S.best}</dd></div>
          <div><dt>Covered</dt><dd>{pct}%</dd></div>
        </dl>
      </section>

      <section className="sec">
        <h2 className="sec-title">Test yourself</h2>
        <ul className="rows">
          <li><Link className="row" href={`${base}/drill`}><span className="row-t">{cap(cn)} drill</span><span className="row-d">{meta.verdicts.length ? `Read the facts, call ${meta.verdicts.map(v => v.label).slice(0, 2).join(' or ')}, then compare.` : 'Read the question, frame your answer, then check the model answer.'}</span><span className="row-n">{plural(nCase, cn)}</span></Link></li>
          <li><Link className="row" href={`${base}/hunt`}><span className="row-t">{cap(pn)} hunt</span><span className="row-d">Ten rounds. Spot which {pn} the facts trigger.</span><span className="row-n">Best {S.huntBest} of 10</span></Link></li>
          <li><Link className="row" href={`${base}/mcq`}><span className="row-t">MCQ sprint</span><span className="row-d">Quick objective questions with instant feedback.</span><span className="row-n">{nMcq} questions</span></Link></li>
          <li><Link className="row" href={`${base}/library`}><span className="row-t">Law library</span><span className="row-d">Every {pn} in full, with the questions that test it.</span><span className="row-n">{plural(cb.P.length, pn)}</span></Link></li>
        </ul>
      </section>

      <section className="sec">
        <h2 className="sec-title">Revise</h2>
        {revise}
      </section>

      <section className="sec">
        <div className="sec-h"><h2 className="sec-title">Weak {pn}s</h2><span className="muted">Below 60% on attempted questions</span></div>
        {weak.length
          ? <div className="chips">{weak.map(x => <button key={x.p.id} className="chip no" data-p={x.p.id}>{x.p.label} · {x.s.c}/{x.s.a}</button>)}</div>
          : <p className="muted">Nothing yet. Attempt a few {cn}s and your weak {pn}s appear here.</p>}
      </section>

      {cb.changes.length > 0 && (
        <section className="sec">
          <div className="sec-h"><h2 className="sec-title">{meta.scopeTitle}</h2>{meta.scopeNote && cb.P.some(p => p.id === meta.scopeNote) && <button className="chip" data-p={meta.scopeNote}>Open full note</button>}</div>
          <div className="rail">{cb.changes.map((c, i) => <div key={i} className="chg"><span className="n">{i + 1}</span><span dangerouslySetInnerHTML={{ __html: c.replace(/^((?:<[^>]+>)*)\s*\d+\.\s+/, '$1') }} /></div>)}</div>
        </section>
      )}

      {cb.method.length > 0 && (
        <section className="sec">
          <h2 className="sec-title">{meta.methodTitle}</h2>
          <div className="steps">{cb.method.map((m, i) => (
            <div key={i} className="step"><h3>{m[0].replace(/^Step \d+\s*[—–-]\s*/, '')}</h3><p dangerouslySetInnerHTML={{ __html: m[1] }} /></div>
          ))}</div>
        </section>
      )}
    </>
  );
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

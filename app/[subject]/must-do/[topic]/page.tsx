import Link from 'next/link';
import { notFound } from 'next/navigation';
import PackText from '@/components/PackText';
import PrintBar from '@/components/PrintBar';
import { SUBJECTS, subjectOf } from '@/lib/registry';
import { TIERS, marksOf, packsOf } from '@/lib/lastday';
import { packAffected } from '@/lib/updates';

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.flatMap(s => (packsOf(s.id)?.topics ?? []).map(p => ({ subject: s.id, topic: p.id })));
}
export async function generateMetadata({ params }: { params: { subject: string; topic: string } }) {
  const p = packsOf(params.subject)?.topics.find(x => x.id === params.topic);
  return { title: `${p?.title ?? 'Pack'} · must-do · CA Revise` };
}

export default function Pack({ params }: { params: { subject: string; topic: string } }) {
  const s = subjectOf(params.subject);
  const set = packsOf(params.subject);
  const p = set?.topics.find(x => x.id === params.topic);
  if (!s || !set || !p) notFound();
  const tier = TIERS.find(t => t.id === p.tier)!;
  const covered = new Set(p.questions.flatMap(q => q.covers));
  const evidence = [p.sweep.pyq ? `${p.sweep.pyq} past-paper` : '', p.sweep.rtp ? `${p.sweep.rtp} RTP` : '', p.sweep.mtp ? `${p.sweep.mtp} MTP` : '']
    .filter(Boolean).join(', ');
  return (
    <>
      <header className="topbar"><div className="topbar-in">
        <Link href="/" className="brand"><span className="seal">CA</span><span className="brand-t">CA Revise</span></Link>
        <span className="crumb-sep" aria-hidden="true">/</span>
        <Link href={`/${s.id}/must-do`} className="crumb">{s.label} must-do</Link>
      </div></header>
      <main className="page rd" data-subj={s.id}>
        <header className="vhead">
          <p className="eyebrow">{tier.label} · {s.long}</p>
          <h1 className="vh">{p.title}</h1>
          <p className="muted">
            {p.rank.pyq !== undefined ? `ICAI frequency score ${p.rank.score} (${p.rank.pyq} question papers, ${p.rank.rtpmtp} RTP/MTP appearances${p.rank.nov26 ? ', in the Nov 2026 RTP/MTPs' : ''}). ` : ''}
            {evidence ? `Questions found on this chapter in the swept papers: ${evidence}.` : ''}
          </p>
        </header>

        <PrintBar answers />
        {packAffected(s.id, p.id) && (
          <p className="pk-warn">ICAI&apos;s Nov 2026 RTP lists amendments that touch this chapter (Ind AS 1, 7, 12, 21 and 107 disclosures). The study-material text below is the older wording: read <Link href={`/${s.id}/updates`}>what changed for Nov 2026</Link> first.</p>
        )}
        <section className="pk-sec">
          <h2 className="pk-h">Write these first</h2>
          <p className="muted pk-note">
            Question 1 is the one that touches the most of the chapter: do it first and check it against ICAI&apos;s answer. Then the others.
            {' '}Each is ICAI&apos;s own question, shown as published. Time yourself at 1.8 minutes a mark.
          </p>
          {p.questions.length === 0 && <p className="card pk-empty">No ICAI question on this chapter matched in the papers swept (May 2024 to Nov 2026). Read the study-material sections below.</p>}
          {p.questions.map((q, i) => {
            const m = marksOf(q.prompt);
            return (
              <article key={i} className="card pk-q">
                <div className="pk-qh">
                  <span className={'pk-chip' + (q.role === 'comprehensive' ? ' pk-chip-on' : '')}>{q.role === 'comprehensive' ? 'Comprehensive' : `Drill ${i}`}</span>
                  <strong>{q.src} · Q{q.label.replace(/^Q/, '')}</strong>
                  {m ? <span className="muted">{m} marks · about {Math.round(m * 1.8)} min</span> : null}
                </div>
                <p className="muted pk-cov">Touches {q.covers.length} of {p.sections.length} SM sections. Closest section: {q.closest.t.trim()} (SM PDF p.{q.closest.p0}).</p>
                {q.loose && <p className="pk-warn">Matched to this chapter by wording only; check the closest section above before relying on it.</p>}
                <PackText text={q.prompt} />
                <details className="pk-ans">
                  <summary>ICAI&apos;s answer</summary>
                  {q.ans ? <PackText text={q.ans} /> : <p className="muted">The answer could not be extracted for this question. Open the paper on ICAI&apos;s site.</p>}
                </details>
              </article>
            );
          })}
        </section>

        <section className="pk-sec">
          <h2 className="pk-h">Scenario checklist</h2>
          <p className="muted pk-note">The sections of the ICAI study material for this chapter. A tick means one of the questions above exercises it. Sections without a tick are not covered by these questions: read them in the SM. &ldquo;Asked&rdquo; counts questions in the swept papers whose wording is closest to that section.</p>
          <ul className="pk-check">
            {p.sections.map((sec, i) => (
              <li key={i} className={covered.has(i) ? 'pk-on' : ''}>
                <span className="pk-tick" aria-hidden="true">{covered.has(i) ? '✓' : '·'}</span>
                <span className="pk-ct">{sec.n !== '0' ? `${sec.n} ` : ''}{sec.t}</span>
                <span className="muted pk-cm">SM p.{sec.p0}{sec.p1 > sec.p0 ? `–${sec.p1}` : ''}{sec.hits ? ` · asked ${sec.hits}` : ''}</span>
                <span className="sr">{covered.has(i) ? 'covered by the questions above' : 'not covered by the questions above'}</span>
              </li>
            ))}
          </ul>
        </section>

        {p.reading.length > 0 && (
          <section className="pk-sec">
            <h2 className="pk-h">Read in the study material</h2>
            <p className="muted pk-note">ICAI&apos;s text for the sections asked most, as published. Page numbers are PDF pages of the chapter file{p.url ? '' : ' (the file for each unit is on ICAI’s study-material page)'}.</p>
            {p.reading.map((r, i) => {
              const sec = p.sections[r.sec];
              return (
                <details key={i} className="card pk-read">
                  <summary>{sec.n !== '0' ? `${sec.n} ` : ''}{sec.t} <span className="muted">· SM p.{sec.p0}–{sec.p1} · asked {sec.hits}</span></summary>
                  <PackText text={r.text} />
                  {r.cut && <p className="muted">Continues in the SM from here (PDF p.{sec.p0}–{sec.p1}).</p>}
                </details>
              );
            })}
          </section>
        )}

        <footer className="pk-foot muted">
          {p.url && <p><a href={p.url}>ICAI study material PDF for this chapter</a> (resource.cdn.icai.org).</p>}
          <p>Sources: ICAI study material, ICAI question papers with suggested answers, RTPs and MTPs. Text is extracted from ICAI&apos;s PDFs; the rupee sign is restored and page headers removed. Tables may lose alignment, so check figures against the ICAI file. Which chapter a question belongs to was decided by matching its wording to the study material, not by ICAI.</p>
        </footer>
      </main>
    </>
  );
}

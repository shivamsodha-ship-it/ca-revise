import Link from 'next/link';
import { SUBJECTS, countChapter, listChapters } from '@/lib/registry';
import { plural } from '@/lib/casebook';
import type { Subject } from '@/lib/types';

// Server component: counts come from each chapter's data files at build time.
export default async function ChapterList({ only }: { only?: Subject }) {
  const subjects = SUBJECTS.filter(s => !only || s.id === only);
  const rows = await Promise.all(subjects.map(async s => {
    const chapters = listChapters(s.id);
    return { s, chapters: await Promise.all(chapters.map(async c => ({ c, n: await countChapter(c) }))) };
  }));
  // Subjects with chapters first; empty ones collapse to a single line at the end.
  rows.sort((a, b) => Number(b.chapters.length > 0) - Number(a.chapters.length > 0));
  return (
    <>
      {rows.map(({ s, chapters }) => (
        <section key={s.id} id={s.id} className={'subj' + (chapters.length ? '' : ' empty-subj')}>
          <div className="subj-h">
            <h2><Link href={`/${s.id}`}>{s.label}</Link></h2>
            <span className="subj-long">{s.long}</span>
            <span className="subj-n">{chapters.length ? plural(chapters.length, 'chapter') : 'No chapters yet'}</span>
          </div>
          {chapters.length > 0 && <ol className="chlist">{chapters.map(({ c, n }) => (
                <li key={c.id}>
                  <Link href={`/${s.id}/${c.id}`} className="chrow">
                    <span className="chnum">{String(c.number).padStart(2, '0')}</span>
                    <span className="chbody">
                      <span className="chtitle">{c.title}</span>
                      <span className="chsum">{c.summary.replace(/ · /g, ', ')}</span>
                      <span className="chmeta">
                        {n.cases > 0 && <span>{plural(n.cases, 'case')}</span>}
                        {n.mcqs > 0 && <span>{n.mcqs} MCQs</span>}
                        {n.provisions > 0 && <span>{plural(n.provisions, 'provision')}</span>}
                        <span>{plural(n.cards, 'card')}</span>
                        {n.written > 0 && <span>{n.written} written</span>}
                      </span>
                    </span>
                    <span className="chgo" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}</ol>}
        </section>
      ))}
    </>
  );
}

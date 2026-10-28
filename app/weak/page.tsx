import Link from 'next/link';
import WeakAreas from '@/components/WeakAreas';
import { SUBJECTS, listChapters } from '@/lib/registry';
import { stripTags } from '@/lib/casebook';
import type { SlimChapter } from '@/components/WeakAreas';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata = { title: 'Weak areas · CA Revise' };

// Every chapter's provisions with their questions, so the browser can rank misses across chapters.
export default async function WeakPage() {
  const chapters: SlimChapter[] = [];
  for (const s of SUBJECTS) {
    for (const r of listChapters(s.id)) {
      const cb = r.casebook ? await r.casebook() : null;
      if (!cb) continue;
      const kind = new Map(cb.Q.map(q => [q.id, q.k]));
      chapters.push({
        id: r.id, subject: s.id, subjectLabel: s.label, number: r.number, title: r.title,
        provisions: cb.P.map(p => ({ id: p.id, label: p.label, title: stripTags(p.title), qs: p.qs.map(id => ({ id, k: kind.get(id) ?? '' })) })),
      });
    }
  }
  return (
    <>
      <header className="topbar"><div className="topbar-in">
        <Link href="/" className="brand"><span className="seal">CA</span><span className="brand-t">CA Revise</span></Link>
        <span className="crumb-sep" aria-hidden="true">/</span>
        <span className="chapter-name">Weak areas</span>
        <ThemeToggle />
      </div></header>
      <main className="page">
        <header className="vhead">
          <p className="eyebrow">All chapters</p>
          <h1 className="vh">Weak areas</h1>
          <p className="muted">Concepts ranked by the questions you missed, weighted by how often ICAI has asked them. One tap drills them.</p>
        </header>
        <WeakAreas chapters={chapters} />
      </main>
    </>
  );
}

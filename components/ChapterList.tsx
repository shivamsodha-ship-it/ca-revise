import Link from 'next/link';
import { allSubjects, listChapters } from '@/lib/registry';
import type { Subject } from '@/lib/types';

export default function ChapterList({ only }: { only?: Subject }) {
  const subjects = allSubjects().filter(s => !only || s.id === only);
  return (
    <>
      {subjects.map(s => {
        const chapters = listChapters(s.id);
        return (
          <section key={s.id} className="subj">
            <h2>{s.label} <span className="muted" style={{ fontFamily: 'var(--sans)', fontWeight: 500, fontSize: 14 }}>{s.long}</span></h2>
            {chapters.length === 0
              ? <p className="muted">No chapters yet. Add one under <code>data/{s.id}/</code> and register it in <code>lib/registry.ts</code>.</p>
              : <div className="tiles" style={{ marginTop: 10 }}>{chapters.map(c => (
                  <Link key={c.id} href={`/${s.id}/${c.id}`} className="tile">
                    <span className="code">{s.label} · Ch {c.number}</span>
                    <span className="t">{c.title}</span>
                    <span className="meta">{c.summary}</span>
                  </Link>
                ))}</div>}
          </section>
        );
      })}
    </>
  );
}

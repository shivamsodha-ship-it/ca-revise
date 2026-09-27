'use client';
import { useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { stripTags } from '@/lib/casebook';

// Group markers cycle through the theme's accent tokens.
const GCOL = ['var(--blue)', 'var(--n)', 'var(--g)', 'var(--p)', 'var(--u)', 'var(--sun)', 'var(--muted)'];

export default function LibraryView() {
  const { cb, meta, provStats } = useChapter();
  const [t, setT] = useState('');
  if (!cb || !meta) return null;
  const q = t.toLowerCase();

  const groups = cb.groups.map(([key, name], gi) => {
    const tiles = cb.P.filter(p => p.g === key && (!q || (p.label + ' ' + p.title + ' ' + stripTags(p.law) + ' ' + p.notes.map(stripTags).join(' ')).toLowerCase().includes(q)));
    if (!tiles.length) return null;
    return (
      <section key={key} className="grp">
        <h2><span className="dot" style={{ background: GCOL[gi % GCOL.length] }} />{name}</h2>
        <div className="tiles">{tiles.map(p => {
          const s = provStats(p.id), okw = s.n ? s.c / s.n * 100 : 0, now = s.n ? (s.a - s.c) / s.n * 100 : 0;
          return (
            <button key={p.id} className={'tile' + (p.upd ? ' u' : '')} data-p={p.id}>
              <span className="code">{p.label}{p.upd && <> <span className="badge-u">note</span></>}</span>
              <span className="t">{p.short}</span>
              <span className="meta"><span className="mini" aria-hidden="true"><i className="ok" style={{ width: okw + '%' }} /><i className="no" style={{ width: now + '%' }} /></span>{s.n} Qs</span>
            </button>
          );
        })}</div>
      </section>
    );
  }).filter(Boolean);

  return (
    <>
      <header className="vhead"><p className="eyebrow">Law library</p><h1 className="vh">Every {meta.provisionNoun}, one tap away</h1><p className="muted">{cb.P.length} {meta.provisionNoun}s in {cb.groups.length} groups. The bar under each shows your right and wrong answers.</p></header>
      <input className="search" type="search" placeholder={`Search ${meta.provisionNoun}s, facts or numbers…`} aria-label="Search the law library" value={t} onChange={e => setT(e.target.value)} />
      {groups.length ? groups : <p className="empty">No provision matches.</p>}
    </>
  );
}

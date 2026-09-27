'use client';
import { useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { stripTags } from '@/lib/casebook';

const GCOL = ['#2446e0', '#0f7a5a', '#b8233f', '#d2531f', '#6b35cf', '#a1339e', '#1a5f8f', '#b56f00', '#5a6680'];

export default function LibraryView() {
  const { cb, provStats } = useChapter();
  const [t, setT] = useState('');
  if (!cb) return null;
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
              <span className="meta"><span className="mini"><i className="ok" style={{ width: okw + '%' }} /><i className="no" style={{ width: now + '%' }} /></span>{s.n} Qs</span>
            </button>
          );
        })}</div>
      </section>
    );
  }).filter(Boolean);

  return (
    <>
      <div className="sec-h" style={{ marginTop: 0 }}><div><p className="eyebrow" style={{ margin: 0 }}>Law Library</p><h2 style={{ fontSize: '1.6rem' }}>Every provision, one tap away</h2></div></div>
      <input className="search" placeholder="Search: website, goodwill, 182 days, substantial interest…" value={t} onChange={e => setT(e.target.value)} />
      {groups.length ? groups : <p className="empty">No provision matches.</p>}
    </>
  );
}

'use client';
import { useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { cap, stripTags } from '@/lib/casebook';

export default function CheatView() {
  const { cb, meta, P } = useChapter();
  const [t, setT] = useState('');
  if (!cb || !meta) return null;
  const q = t.toLowerCase();
  return (
    <>
      <header className="vhead"><p className="eyebrow">Cheat sheet</p><h1 className="vh">Numbers and triggers</h1><p className="muted">Highlighted figures changed from the study material.</p></header>
      <input className="search" type="search" placeholder="Filter numbers…" aria-label="Filter numbers" value={t} onChange={e => setT(e.target.value)} />
      <div className="card tbl" style={{ marginTop: 12 }}>
        <table>
          <thead><tr><th>Item</th><th>Exam figure</th><th>{cap(meta.provisionNoun)}</th></tr></thead>
          <tbody>{cb.numbers.filter(n => !q || stripTags(n[0] + ' ' + n[1]).toLowerCase().includes(q)).map((n, i) => (
            <tr key={i} className={n[3] ? 'c' : ''}><td dangerouslySetInnerHTML={{ __html: n[0] }} /><td dangerouslySetInnerHTML={{ __html: n[1] }} /><td>{P[n[2]] && <button className="chip" data-p={n[2]}>{P[n[2]].label}</button>}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <section className="sec">
        <div className="sec-h"><h2>Facts → {meta.provisionNoun}</h2><span className="muted">Tap to open the {meta.provisionNoun}</span></div>
        <div className="finder">{cb.finder.map((f, i) => P[f[1]] && (
          <button key={i} className="fnd" data-p={f[1]}><span dangerouslySetInnerHTML={{ __html: f[0] }} /><b>{P[f[1]].label}</b></button>
        ))}</div>
      </section>
    </>
  );
}

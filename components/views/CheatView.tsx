'use client';
import { useState } from 'react';
import { useChapter } from '@/components/ChapterShell';

export default function CheatView() {
  const { cb, P } = useChapter();
  const [t, setT] = useState('');
  if (!cb) return null;
  const q = t.toLowerCase();
  return (
    <>
      <div className="sec-h" style={{ marginTop: 0 }}><div><p className="eyebrow" style={{ margin: 0 }}>Cheat Sheet</p><h2 style={{ fontSize: '1.6rem' }}>Numbers and triggers</h2></div></div>
      <input className="search" placeholder="Filter numbers…" value={t} onChange={e => setT(e.target.value)} />
      <div className="card tbl" style={{ marginTop: 12 }}>
        <table>
          <thead><tr><th>Item</th><th>Exam figure</th><th>Law</th></tr></thead>
          <tbody>{cb.numbers.filter(n => !q || (n[0] + ' ' + n[1]).toLowerCase().includes(q)).map((n, i) => (
            <tr key={i} className={n[3] ? 'c' : ''}><td>{n[0]}</td><td>{n[1]}</td><td>{P[n[2]] && <button className="chip" data-p={n[2]}>{P[n[2]].label}</button>}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <section className="sec">
        <div className="sec-h"><h2>Facts → clause</h2><span className="muted">Tap to open the clause</span></div>
        <div className="finder">{cb.finder.map((f, i) => P[f[1]] && (
          <button key={i} className="fnd" data-p={f[1]}><span>{f[0]}</span><b>{P[f[1]].label}</b></button>
        ))}</div>
      </section>
    </>
  );
}

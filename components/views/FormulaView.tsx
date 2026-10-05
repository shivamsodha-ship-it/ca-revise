'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useChapter } from '@/components/ChapterShell';
import FormulaBank, { formulaLabels } from '@/components/FormulaBank';
import { stripTags } from '@/lib/casebook';
import type { Formula, FormulaFamily } from '@/lib/casebook';

const text = (f: Formula) => stripTags([f.name, f.expr, f.logic, f.derive, f.cue, f.hook].filter(Boolean).join(' ')).toLowerCase();

export default function FormulaView() {
  const { cb, subject } = useChapter();
  const [t, setT] = useState('');
  const labels = useMemo(() => formulaLabels(cb?.formulas ?? [], cb?.P ?? []), [cb]);
  const fams = cb?.formulas ?? [];
  if (!cb) return null;
  const q = t.trim().toLowerCase();
  const shown: FormulaFamily[] = !q ? fams : fams.flatMap(f => {
    const hit = text(f.master).includes(q) || stripTags(f.title).toLowerCase().includes(q);
    const items = f.items.filter(x => hit || text(x).includes(q));
    return hit || items.length ? [{ ...f, items }] : [];
  });
  const n = fams.reduce((k, f) => k + 1 + f.items.length, 0);
  return (
    <>
      <header className="vhead">
        <p className="eyebrow">Formula bank</p>
        <h1 className="vh">{n} formulas, {fams.length} families</h1>
        <p className="muted">Each family starts from one master formula. Open a formula to see why it works, where it comes from and the trap. <Link href={`/${subject}/formulas`}>All chapters →</Link></p>
      </header>
      <input className="search" type="search" placeholder="Filter formulas…" aria-label="Filter formulas" value={t} onChange={e => setT(e.target.value)} />
      <nav className="fjump" aria-label="Formula families">{fams.map(f => <a key={f.id} href={`#${f.id}`} className="chip">{f.title}</a>)}</nav>
      {shown.length ? <FormulaBank families={shown} labels={labels} linkP open={!!q} /> : <p className="muted">No formula matches “{t}”.</p>}
    </>
  );
}

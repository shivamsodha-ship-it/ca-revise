'use client';
import { useEffect, useState } from 'react';
import { loadCaseState } from '@/lib/progress';
import { loadLearn, LEVEL_PASS } from '@/lib/learn';

// Small progress read-out on a chapter card. Reads this device's saved progress after the first paint.
export default function ChapterProgress({ id, total, levels }: { id: string; total: number; levels: number }) {
  const [p, setP] = useState<{ a: number; l: number } | null>(null);
  useEffect(() => {
    const S = loadCaseState(id), L = loadLearn(id);
    setP({ a: Object.keys(S.r).length, l: Object.values(L.lv).filter(v => v.best >= LEVEL_PASS).length });
  }, [id]);
  const pct = total ? Math.round(((p?.a ?? 0) / total) * 100) : 0;
  return (
    <span className="cp">
      <span className="cp-bar" aria-hidden="true"><i style={{ transform: `scaleX(${pct / 100})` }} /></span>
      <span className="cp-t">{p ? `${pct}% answered${levels ? ` · ${Math.min(p.l, levels)}/${levels} levels` : ''}` : ' '}</span>
    </span>
  );
}

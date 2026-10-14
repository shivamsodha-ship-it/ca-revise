'use client';
import { useChapter } from '@/components/ChapterShell';
import { useLearnState } from '@/lib/learn';
import { HBlock as H } from '@/components/learn/ui';

const STYLE = { numerical: 'Mostly numerical', theory: 'Mostly theory and cases', mixed: 'Numerical and theory' } as const;

export default function VisionView() {
  const { learn, ch, P, chapterId, go } = useChapter();
  const { L, bump } = useLearnState(chapterId);
  const v = learn?.vision;
  if (!v) return null;
  const seen = (L.lv.vision?.best ?? 0) >= 100;
  return (
    <div className="lm">
      <header className="lm-head">
        <p className="eyebrow">Stage 1 · Vision</p>
        <h1>{ch.title.length > 56 ? 'The chapter on one page' : ch.title}</h1>
        <p className="lede">{v.oneLine}</p>
        <div className="chips"><span className="chip">{STYLE[v.style]}</span>{v.marks && <span className="chip">{v.marks}</span>}</div>
      </header>

      <section className="lm-sec"><h2 className="lm-step"><span>Why it matters</span></h2><H html={v.why} className="lm-body" /></section>

      <section className="lm-sec">
        <h2 className="lm-step"><span>The map</span><small>Know the branches before the leaves. Tap a chip to open the rule.</small></h2>
        <div className="vz-map">
          {v.map.map((b, i) => (
            <div key={i} className="vz-branch">
              <h3>{b.h}</h3>
              <ul>{b.items.map((x, j) => <li key={j}>{x}</li>)}</ul>
              {!!b.p?.length && <div className="chips">{b.p.map(id => P[id] && <button key={id} className="chip" data-p={id}>{P[id].label}</button>)}</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="lm-sec">
        <h2 className="lm-step"><span>In 60 seconds</span><small>Say these out loud.</small></h2>
        <ol className="vz-sixty">{v.sixty.map((s, i) => <li key={i}>{s}</li>)}</ol>
      </section>

      <section className="lm-sec">
        <h2 className="lm-step"><span>How ICAI asks it</span></h2>
        <ul className="vz-asked">{v.askedAs.map((a, i) => <li key={i}><b>{a.kind}</b><span>{a.how}</span></li>)}</ul>
      </section>

      <section className="lm-sec">
        <h2 className="lm-step"><span>Marks are lost here</span></h2>
        <div className="trap"><ul style={{ margin: 0, paddingLeft: 18 }}>{v.pitfalls.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
      </section>

      <div className="nav">
        <button className="btn" disabled={seen} onClick={() => bump('lv', 'vision', 100)}>{seen ? 'Marked as read' : 'I have read this'}</button>
        <button className="btn pri" onClick={() => { bump('lv', 'vision', 100); go('path'); }}>Start the path →</button>
      </div>
    </div>
  );
}

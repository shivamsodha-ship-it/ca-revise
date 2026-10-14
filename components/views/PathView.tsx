'use client';
import { useState } from 'react';
import { useChapter } from '@/components/ChapterShell';
import { RecallRun } from '@/components/learn/Recall';
import { LEVEL_PASS, useLearnState } from '@/lib/learn';
import { HBlock as H } from '@/components/learn/ui';


export default function PathView() {
  const { learn, chapterId, P, ch } = useChapter();
  const { L, bump } = useLearnState(chapterId);
  const [open, setOpen] = useState<string | null>(null);
  const [twist, setTwist] = useState(false);
  if (!learn) return null;
  const levels = learn.levels;
  const cleared = levels.filter(l => (L.lv[l.id]?.best ?? 0) >= LEVEL_PASS).length;
  const nextIx = levels.findIndex(l => (L.lv[l.id]?.best ?? 0) < LEVEL_PASS);
  const cur = levels.find(l => l.id === open);

  if (cur) {
    const ix = levels.indexOf(cur);
    const nxt = levels[ix + 1];
    return (
      <div className="lm">
        <button className="lm-back" onClick={() => { setOpen(null); setTwist(false); window.scrollTo(0, 0); }}>← All levels</button>
        <header className="lm-head">
          <p className="eyebrow">Level {ix + 1} of {levels.length}{cur.mins ? ` · ${cur.mins} min` : ''}</p>
          <h1>{cur.title}</h1>
          <p className="lede">{cur.hook}</p>
        </header>

        <section className="lm-sec" aria-label="Lesson">
          <h2 className="lm-step"><span>Learn</span></h2>
          {cur.teach.map((b, i) => (
            <div key={i} className="lm-block"><h3>{b.h}</h3><H html={b.html} className="lm-body" /></div>
          ))}
          {cur.picture && <div className="lm-pic"><H html={cur.picture} /></div>}
          {cur.correlate && <div className="callout note"><b>How it connects</b><H html={cur.correlate} /></div>}
          {!!cur.links?.length && <p className="links"><span>Open the rule</span>{cur.links.map(l => P[l] && <button key={l} className="chip" data-p={l}>{P[l].label}</button>)}</p>}
        </section>

        <section className="lm-sec" aria-label="Recall check">
          <h2 className="lm-step"><span>Recall</span><small>Answer from memory. Clear {LEVEL_PASS}% to pass.</small></h2>
          <div className="card lm-card">
            <RecallRun items={cur.recall} onFinish={pct => bump('lv', cur.id, pct)} />
          </div>
        </section>

        {cur.twist && (
          <section className="lm-sec" aria-label="Twist">
            <h2 className="lm-step"><span>Twist</span><small>The examiner changes one fact.</small></h2>
            <div className="card lm-card">
              <H html={cur.twist.q} className="facts" />
              {!twist ? <button className="btn pri" onClick={() => setTwist(true)}>Show how to think it through</button> : <H html={cur.twist.a} className="answer" />}
            </div>
          </section>
        )}

        <div className="nav">
          <span />
          {nxt ? <button className="btn pri" onClick={() => { setOpen(nxt.id); setTwist(false); window.scrollTo(0, 0); }}>Next: {nxt.title} →</button>
            : <button className="btn pri" onClick={() => { setOpen(null); window.scrollTo(0, 0); }}>Back to the path</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="lm">
      <header className="lm-head">
        <p className="eyebrow">Mastery path</p>
        <h1>{ch.title.length > 60 ? 'From first principles to exam-ready' : ch.title}</h1>
        <p className="lede">Each level teaches one idea in plain words, links it to the rest, then checks you from memory. Go in order the first time; jump around when you revise.</p>
        <div className="lm-sum"><b>{cleared}</b> of {levels.length} levels cleared
          <div className="track"><i style={{ transform: `scaleX(${cleared / levels.length})` }} /></div></div>
      </header>
      <ol className="lm-path">
        {levels.map((l, i) => {
          const best = L.lv[l.id]?.best;
          const state = best === undefined ? 'new' : best >= LEVEL_PASS ? 'ok' : 'try';
          return (
            <li key={l.id} className={'lm-lv ' + state + (i === nextIx ? ' next' : '')}>
              <button onClick={() => { setOpen(l.id); window.scrollTo(0, 0); }}>
                <span className="lm-n">{i + 1}</span>
                <span className="lm-t"><b>{l.title}</b><small>{l.hook}</small></span>
                <span className="lm-s">{state === 'ok' ? `Cleared ${best}%` : state === 'try' ? `Best ${best}%` : i === nextIx ? 'Start here' : l.mins ? `${l.mins} min` : 'New'}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

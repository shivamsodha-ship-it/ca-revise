'use client';
import { useEffect, useState } from 'react';

// A scratch pad that follows you around the chapter, so working never needs a notebook.
// Kept on this device only (not synced); cleared with the button.
export default function Jotter({ chapterId }: { chapterId: string }) {
  const k = `ca-revise:v1:jot:${chapterId}`;
  const [open, setOpen] = useState(false);
  const [t, setT] = useState('');
  useEffect(() => { try { setT(localStorage.getItem(k) ?? ''); } catch {} }, [k]);
  const save = (v: string) => { setT(v); try { localStorage.setItem(k, v); } catch {} };
  return (
    <>
      <button className="jot-fab" aria-expanded={open} aria-controls="jot-panel" onClick={() => setOpen(o => !o)}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4" /></svg>
        <span>Jot</span>
      </button>
      {open && (
        <div className="jot" id="jot-panel" role="dialog" aria-label="Scratch pad">
          <div className="jot-h"><b>Scratch pad</b><span className="muted">Saved on this device</span>
            <button className="chip" onClick={() => save('')}>Clear</button>
            <button className="x" aria-label="Close scratch pad" onClick={() => setOpen(false)}>×</button></div>
          <textarea id="jot-text" aria-label="Scratch pad" value={t} onChange={e => save(e.target.value)} placeholder={'Write working here.\nExample: DTL 400 − 40 = 360\nCRR 4% of 360 = 14.4'} spellCheck={false} />
        </div>
      )}
    </>
  );
}

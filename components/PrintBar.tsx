'use client';

// Print buttons. "With answers" opens every ICAI-answer block first and restores them afterwards.
export default function PrintBar({ answers = false, label = 'Print this page' }: { answers?: boolean; label?: string }) {
  const run = (open: boolean) => {
    const ds = [...document.querySelectorAll<HTMLDetailsElement>('details')];
    const was = ds.map(d => d.open);
    ds.forEach(d => { d.open = open; });
    const restore = () => { ds.forEach((d, i) => { d.open = was[i]; }); window.removeEventListener('afterprint', restore); };
    window.addEventListener('afterprint', restore);
    window.print();
  };
  return (
    <p className="noprint prb">
      <button type="button" className="btn primary" onClick={() => run(false)}>{answers ? 'Print questions with writing space' : label}</button>
      {answers && <button type="button" className="btn" onClick={() => run(true)}>Print with ICAI answers</button>}
    </p>
  );
}

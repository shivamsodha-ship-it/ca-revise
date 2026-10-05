import type { Formula, FormulaFamily } from '@/lib/casebook';

// Renders formula families. Used by the chapter's Formulas view (with provision chips that open the
// law drawer) and by the subject-wide formula bank page (no drawer, so provision labels are plain text).
export default function FormulaBank({ families, labels, linkP = false, open = false }: {
  families: FormulaFamily[];
  labels: Record<string, string>;   // formula id -> name, for "derived from" chips
  linkP?: boolean;
  open?: boolean;
}) {
  return (
    <div className="fbank">
      {families.map(f => (
        <section key={f.id} className="ffam" id={f.id}>
          <h2 className="ffam-h">{f.title}</h2>
          <div className="ffam-idea" dangerouslySetInnerHTML={{ __html: f.idea }} />
          <FormulaCard f={f.master} labels={labels} linkP={linkP} master open />
          {f.items.length > 0 && <ol className="fkids">{f.items.map(x => (
            <li key={x.id}><FormulaCard f={x} labels={labels} linkP={linkP} open={open} /></li>
          ))}</ol>}
        </section>
      ))}
    </div>
  );
}

function FormulaCard({ f, labels, linkP, master = false, open = false }: {
  f: Formula; labels: Record<string, string>; linkP: boolean; master?: boolean; open?: boolean;
}) {
  return (
    <details className={'fcard' + (master ? ' master' : '')} id={f.id} open={open}>
      <summary>
        <span className="fname">{master && <span className="ftag">Master</span>}{f.beyond && <span className="ftag beyond">Beyond SM</span>}{f.name}</span>
        <span className="fexpr" dangerouslySetInnerHTML={{ __html: f.expr }} />
      </summary>
      <div className="fbody">
        {f.from && f.from.length > 0 && (
          <p className="ffrom">Comes from {f.from.map(id => <a key={id} href={`#${id}`} className="chip">{labels[id] ?? id}</a>)}</p>
        )}
        {f.vars && f.vars.length > 0 && (
          <dl className="fvars">{f.vars.map(([s, m], i) => (
            <div key={i}><dt dangerouslySetInnerHTML={{ __html: s }} /><dd>{m}</dd></div>
          ))}</dl>
        )}
        <div className="fsec"><b>Why it works</b><div dangerouslySetInnerHTML={{ __html: f.logic }} /></div>
        {f.derive && <div className="fsec"><b>How it is derived</b><div dangerouslySetInnerHTML={{ __html: f.derive }} /></div>}
        {f.example && <div className="fsec"><b>Try it</b><div dangerouslySetInnerHTML={{ __html: f.example }} /></div>}
        {f.cue && <div className="callout note"><b>Exam cue</b><div>{f.cue}</div></div>}
        {f.trap && <div className="callout trapc"><b>Trap</b><div dangerouslySetInnerHTML={{ __html: f.trap }} /></div>}
        {f.hook && <div className="callout hook"><b>Memory hook</b><div>{f.hook}</div></div>}
        {f.p && (linkP && labels['@' + f.p]
          ? <p className="fp"><button className="chip" data-p={f.p}>{labels['@' + f.p]}</button></p>
          : labels['@' + f.p] ? <p className="fp muted">Concept: {labels['@' + f.p]}</p> : null)}
      </div>
    </details>
  );
}

// Labels used by FormulaBank: formula names, plus '@<provision id>' -> provision label.
export function formulaLabels(families: FormulaFamily[], provisions: { id: string; label: string }[]) {
  const out: Record<string, string> = {};
  for (const f of families) for (const x of [f.master, ...f.items]) out[x.id] = x.name;
  for (const p of provisions) out['@' + p.id] = p.label;
  return out;
}

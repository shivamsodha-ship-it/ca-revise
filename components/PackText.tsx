// ICAI text exactly as extracted. The PDF hard-wraps lines, so prose is re-flowed (whitespace only, no word changes);
// paragraphs that look like tables keep their columns and scroll sideways inside the block.
const ITEM = /^\s*(\(?[ivx]{1,5}\)|\(?[a-zA-Z]\)|\d{1,2}[.)]|[•\-–])\s/;

function reflow(p: string): string[] {
  const out: string[] = [];
  for (const ln of p.split('\n')) {
    const t = ln.trim();
    if (!t) continue;
    if (out.length && !ITEM.test(ln) && !/[:.?]$/.test(out[out.length - 1].slice(-1)) ) out[out.length - 1] += ' ' + t;
    else if (out.length && !ITEM.test(ln) && out[out.length - 1].length > 60) out[out.length - 1] += ' ' + t;
    else out.push(t);
  }
  return out;
}

export default function PackText({ text }: { text: string }) {
  const paras = text.split(/\n{2,}/);
  return (
    <div className="pk-text">
      {paras.map((p, i) => {
        const table = /\S {3,}\S[^\n]*\S {3,}\S/.test(p);
        if (table) return <pre key={i} className="pk-pre pk-table">{p}</pre>;
        return <div key={i} className="pk-prose">{reflow(p).map((l, j) => <p key={j}>{l}</p>)}</div>;
      })}
    </div>
  );
}
